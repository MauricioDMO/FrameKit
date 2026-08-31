# Step 3 - Temporary Render Jobs

## Goal

Implement the smallest authenticated bridge between one public API render and
the private page request made by Chromium.

The bridge is a short-lived `Map` stored on `globalThis` under a package-specific
symbol. It contains the already-resolved render payload only for the lifetime of
the Node.js process.

This step does not expose public asynchronous jobs, write files, or launch a
browser.

## Depends on

- [Step 1](./01-contracts-and-server-boundary.md) errors and
  `ResolvedRenderPayload`.
- The v1 runtime boundary: one long-lived Node.js process per application
  container.

## Why an in-memory `Map`

The render request is synchronous: the original API request remains open while
Chromium immediately navigates back to the same application over loopback.
Durable storage is unnecessary.

A plain module-level `Map` is not sufficient because Next.js may bundle the
public route and private page separately or replace modules during development.
The store therefore lives on the process global:

```typescript
const renderJobsSymbol = Symbol.for('framekit.server.render-jobs')
```

Both bundles call a helper that resolves the same state from `globalThis`:

```typescript
interface RenderJobStoreState {
  jobs: Map<string, RenderJobRecord>
}
```

Benefits for v1:

- no JSON serialization/deserialization;
- no filesystem I/O;
- no path/symlink/permission handling;
- no Redis/database/object storage;
- multi-megabyte data URLs stay in memory rather than being copied to disk;
- module reloads/bundle duplication can still share the same process state.

This is an explicit runtime tradeoff. If FrameKit later needs multiple Node.js
processes sharing one render request, serverless execution, or a separate render
service, the storage implementation must change. The job API should remain
stable enough for that replacement.

## Job state model

```text
created -> available -> loaded -> deleted
                    \-> expired -> deleted
                    \-> failed render -> deleted
```

Loading is non-destructive because Next.js may evaluate the private page more
than once during a render. `renderTemplateImage` owns normal deletion in
`finally`. TTL is only a backstop.

## Stored contract

The public route has already loaded the definition, prepared image inputs,
resolved defaults/content/assets, and validated final data.

```typescript
interface RenderJobRecord {
  token: string
  payload: ResolvedRenderPayload
  createdAt: number
  expiresAt: number
}
```

Rules:

- `payload.data` is already canonical resolved data.
- `payload.assets` is the prepared cloned manifest.
- `width`, `height`, template slug, and variant come from the trusted loaded
  definition/registry, not arbitrary caller dimensions.
- token is independent from job ID.
- no API key, public Authorization header, `Request`, `Response`, loader,
  definition object, React value, browser/context/page object, or remote original
  response body is stored.
- no version field is needed for v1 because jobs cannot survive a process/runtime
  restart. A future durable store may introduce versioning then.

## Public server functions

Keep the storage API minimal:

```typescript
interface CreatedRenderJob {
  id: string
  token: string
}

createRenderJob(
  payload: ResolvedRenderPayload,
  options?: RenderJobTestOptions,
): CreatedRenderJob

loadRenderRequest(
  id: string,
  token: string,
  options?: RenderJobTestOptions,
): ResolvedRenderPayload | undefined

deleteRenderJob(
  id: string,
  options?: RenderJobTestOptions,
): void
```

These functions can be synchronous because the store has no I/O.

`renderTemplateImage` uses create/delete internally. `loadRenderRequest` must be
available through the supported `./server` entry because the generated private
Next.js page consumes it.

## ID and token generation

- Generate ID and token separately with Node `crypto`.
- Use at least 128 bits entropy each; 192/256 bits is fine.
- Encode as lowercase hex or unpadded base64url.
- Define one strict ID grammar accepted by load/delete.
- Compare tokens in constant time.
- Treat malformed ID/token the same as missing/expired/wrong-token at the private
  page boundary.
- ID may appear in the private loopback URL and coarse logs.
- token must never be logged or put in URL/query/fragment/client props.

Map insertion should use a bounded collision retry even though a cryptographic ID
collision is practically impossible.

## `globalThis` store layout

Suggested shape:

```typescript
const STORE = Symbol.for('framekit.server.render-jobs')

interface RenderJobStoreState {
  jobs: Map<string, RenderJobRecord>
}

function getRenderJobStore(): RenderJobStoreState {
  const globalState = globalThis as typeof globalThis & {
    [STORE]?: RenderJobStoreState
  }

  return globalState[STORE] ??= { jobs: new Map() }
}
```

Requirements:

- use `Symbol.for(...)`, not a new local `Symbol()`;
- do not export the Map itself;
- all access crosses create/load/delete helpers;
- tests may inject a clock/random source or isolated store only where needed;
- no code should depend on a specific Next.js bundle instance.

## Expiry

Initial TTL: 120 seconds.

- Set `createdAt` and `expiresAt` on creation.
- On load, delete and return not-found for expired jobs.
- Do not extend TTL when the private page reads the job.
- Normal 30-second render work should finish well inside the TTL.
- On each create, opportunistically remove expired entries before inserting the
  new one.

Because the store should contain only a handful of active jobs, a simple full
Map sweep is acceptable in v1. Do not add timers/intervals just for job cleanup.

## Cleanup behavior

### Normal cleanup

The browser orchestration owns deletion:

```typescript
let job: CreatedRenderJob | undefined

try {
  job = createRenderJob(payload)
  return await capture(job)
} finally {
  if (job) deleteRenderJob(job.id)
}
```

Rules:

- deleting a missing job is success/idempotent;
- successful render leaves no job;
- navigation/template/browser/screenshot failures leave no job;
- request abort and timeout leave no job;
- cleanup should not throw for already-missing entries;
- a cleanup bug may be logged using only job ID/coarse code, never token/payload.

### Expired cleanup

`createRenderJob` may call a small `deleteExpiredRenderJobs(now)` helper.

- inspect only the process-owned Map;
- delete entries whose `expiresAt <= now`;
- no background interval;
- no filesystem scan;
- no persistence across process/container restart.

## Private read semantics

`loadRenderRequest(id, token)` must avoid creating an oracle:

- malformed ID -> `undefined`;
- missing ID -> `undefined`;
- expired -> delete then `undefined`;
- wrong token -> `undefined`;
- valid ID/token -> return only the `ResolvedRenderPayload`.

The generated page maps every `undefined` result to the same not-found behavior.
It must not reveal whether ID or token was the incorrect part.

## Concurrency and replicas

- Concurrent renders receive distinct IDs/tokens and Map entries.
- One request can delete only its own ID.
- The global Map is shared only inside one Node.js process.
- Separate horizontal replicas each have their own browser and Map, which is
  acceptable because Chromium navigates to `127.0.0.1` in the same replica that
  accepted the original request.
- Running multiple application Node.js processes inside one container is not
  supported in v1.
- serverless/Edge processes are not supported.
- if the runtime boundary changes later, replace this store behind the same
  create/load/delete abstraction rather than rewriting the routes/browser flow.

## Expected files

```text
packages/framekit/src/server/render-job.ts
packages/framekit/src/server/render-job.test.ts
packages/framekit/src/server.ts
```

No temp directory, file permissions, stale-file scanner, or filesystem test
fixture is required.

## Implementation sequence

1. Define `RenderJobRecord`, `CreatedRenderJob`, ID grammar, TTL, and global
   symbol.
2. Implement `getRenderJobStore()` using `globalThis + Symbol.for(...)`.
3. Implement ID/token generation with bounded collision retry.
4. Implement expired-entry cleanup on create/load.
5. Implement constant-time token validation and non-destructive load.
6. Implement idempotent delete.
7. Export only the minimal functions needed by renderer/private page.
8. Add HMR/global-state, concurrency, expiry, auth, and cleanup tests.

## Focused tests

- Two independently imported copies/helpers resolve the same process-global
  store state.
- Create returns different valid ID/token values.
- Job contains resolved payload and no API-key/public-auth data.
- Valid ID/token returns the same resolved payload object/value without token or
  timestamps.
- Wrong token, malformed ID, missing ID, and expired job return the same external
  result.
- Token comparison uses the shared timing-safe helper/path.
- Delete is idempotent.
- Collision retry is bounded.
- Concurrent jobs never read/delete one another.
- Create/load opportunistically removes expired entries.
- No test creates or modifies files.

## Exit gate

Step 3 is complete when:

- public/private consumers in one Node process can hand off resolved payloads via
  one `globalThis` Map;
- missing/wrong/expired jobs are externally indistinguishable;
- normal/expired cleanup is simple, bounded, and tested;
- no filesystem/external service/persistent storage is introduced;
- focused Node tests pass without Next.js or Playwright.
