# Step 3 - Temporary Render Jobs

## Goal

Implement the smallest safe bridge between one public API request and the
private page request made by Chromium. The bridge is an authenticated,
short-lived JSON file local to the current container.

This step does not expose public asynchronous jobs and does not launch a browser.

## Depends on

- [Step 1](./01-contracts-and-server-boundary.md) errors and server types.
- The normalized serializable payload shape agreed for later steps.

## Why a temporary file

A module-level `Map` is not a reliable contract between independently bundled
Next.js route/page modules and can be duplicated during development reloads.
Passing request data in the render URL would leak it into logs, impose URL-size
limits, and expose base64. Redis or a database is unnecessary because Chromium
navigates back to the same container over loopback while the original request
is still waiting.

A local temporary file provides:

- a process/bundle-independent handoff;
- support for multi-megabyte base64 within the existing request limit;
- no external service;
- straightforward expiry and deletion;
- container-local isolation compatible with horizontal replicas.

## Job state model

```text
created -> available -> loaded -> deleted
                    \-> expired -> deleted
                    \-> failed render -> deleted
```

The private page may read a job more than once during a single Next.js render,
so loading is not destructive. The original API render orchestration owns final
deletion. Expiry provides a crash/backstop path, not the normal lifecycle.

## Stored contract

```typescript
interface RenderJobV1 {
  version: 1
  template: string
  variant: string
  edits: Record<string, unknown>
  assets: TemplateAssetManifest
  width: number
  height: number
  token: string
  createdAt: number
  expiresAt: number
}
```

Rules:

- `version` supports explicit rejection if a future runtime sees an incompatible
  file; it does not promise migration of old temp files.
- `template`, `variant`, dimensions, edits, and assets come from already
  normalized server input.
- `token` is independent from the filename ID.
- timestamps are Unix milliseconds from the server clock.
- no API key, authorization header, loader, template definition, React value,
  request object, browser object, or absolute project path is stored.

The reader validates the parsed shape instead of trusting JSON merely because it
was written by the same package. Partial files, stale versions, and test-created
invalid records fail safely.

## Public server functions

Keep the API minimal:

```typescript
interface CreatedRenderJob {
  id: string
  token: string
}

createRenderJob(payload, options?): Promise<CreatedRenderJob>
loadRenderRequest(id, token, options?): Promise<NormalizedRenderPayload>
deleteRenderJob(id, options?): Promise<void>
```

`options` may inject a temporary root and clock for focused tests. Production
callers use defaults. Do not expose the computed filename.

The top-level `renderTemplateImage` added in Step 4 calls create/delete
internally. `loadRenderRequest` remains exported because the private Next.js page
must consume it through the supported server entry.

## ID and token generation

- Generate ID and token separately with Node's `crypto` API.
- Use at least 128 bits of entropy for each; 192 or 256 bits is acceptable.
- Encode as lowercase hexadecimal or base64url without padding.
- Define one strict regular expression for IDs accepted by read/delete functions.
- Never accept `/`, `\`, `.`, percent escapes, or platform path separators.
- Compare tokens in constant time.
- Treat malformed ID/token exactly like a missing job at the private-page
  boundary.

The ID may appear in an internal URL and logs. The token appears only in the
temporary file and private browser request header and must never be logged.

## Filesystem layout

```text
<os.tmpdir()>/framekit-renders/
  <job-id>.json
```

Rules:

- Resolve the root once from `os.tmpdir()` plus the fixed directory name.
- In tests, inject a test-owned temporary root.
- Create the directory recursively with owner-only mode where supported.
- Refuse any computed path that is not an immediate child of the root, even
  after ID regex validation.
- Create files with exclusive semantics and mode `0600`.
- Write UTF-8 JSON only after complete payload validation.
- Do not pretty-print base64-heavy JSON.
- Bound the maximum job-file bytes slightly above the public request limit and
  reject larger/malformed records before `JSON.parse` when reading.
- Never follow caller-created symlinks. Exclusive creation and regular-file
  checks must keep access inside the owned directory.

Because browser navigation starts only after `createRenderJob` resolves, the
private page cannot observe a normal in-progress write. A process crash may leave
a partial file, which the strict reader rejects and stale cleanup removes.

## Expiry

- Set `createdAt` during creation.
- Set `expiresAt = createdAt + 120000` initially.
- On load, compare against the injected/current clock before returning payload.
- If expired, attempt deletion and report not found.
- Do not extend expiry when the private page reads the job.
- A render may continue only within the shorter 30-second request timeout, so a
  normal request never relies on the full two-minute TTL.

Clock changes are acceptable for this local safety TTL. This is not a durable
scheduler or billing clock.

## Cleanup behavior

### Normal cleanup

The browser orchestration owns:

```typescript
let job
try {
  job = await createRenderJob(payload)
  return await capture(job)
} finally {
  if (job) await deleteRenderJob(job.id)
}
```

Deletion rules:

- `ENOENT` is success, making cleanup idempotent.
- Other deletion failures are logged without request payload/token and retained
  as an operational error.
- If capture already failed, cleanup failure must not hide the original semantic
  error, but it must be observable.
- If capture succeeded and deletion fails, fail closed rather than return a PNG
  while sensitive temp data is known to remain, unless implementation evidence
  proves a safer cleanup strategy.

### Stale cleanup

Perform bounded opportunistic cleanup when creating a job:

- inspect only files in the fixed FrameKit directory;
- process at most a fixed number per creation to bound latency;
- ignore unrelated names;
- delete only regular job files whose stored expiry or conservative file age is
  older than the job TTL;
- tolerate concurrent deletion by another request;
- do not add a permanent interval merely for cleanup.

Container restart removes the ephemeral directory, but normal operation must not
depend on restart for cleanup.

## Private read semantics

`loadRenderRequest(id, token)` must avoid creating an oracle:

- malformed ID -> not found;
- missing file -> not found;
- malformed/unsupported job -> not found externally, diagnostic internally;
- expired job -> delete then not found;
- wrong token -> not found;
- valid ID/token -> return payload without token/timestamps.

The function should return `undefined` or a dedicated not-found failure suitable
for Next's `notFound()`. Do not expose separate public reasons.

## Concurrency and replicas

- Multiple requests create distinct files and tokens.
- Exclusive file creation handles the extremely unlikely ID collision by
  generating a new ID a bounded number of times.
- One request deleting its job cannot affect another ID.
- Horizontal replicas work because the browser created by a request navigates to
  `127.0.0.1` inside the same container.
- Multiple Node.js processes inside one container are not an initial target. If
  introduced later, the shared temp directory still provides visibility but
  browser/capacity semantics require separate review.
- Shared storage across containers is explicitly out of scope.

## Expected files

```text
packages/framekit/src/server/render-job.ts
packages/framekit/src/server/render-job.test.ts
packages/framekit/src/server.ts
```

Tests use Node's temporary-directory APIs and remove their own fixture root.

## Implementation sequence

1. Define `RenderJobV1`, payload validation, ID format, and constants.
2. Add injected root/clock/random hooks only where tests require them.
3. Implement root creation and safe immediate-child path resolution.
4. Implement exclusive job creation and bounded collision retry.
5. Implement strict read, version/shape/size checks, expiry, and token comparison.
6. Implement idempotent deletion.
7. Implement bounded stale cleanup.
8. Export only `loadRenderRequest` publicly now; keep create/delete available to
   internal orchestration.
9. Add race, security, expiry, and cleanup tests.

## Focused tests

- Create returns different valid ID/token values and writes one owner-only file.
- Written JSON contains payload and no API key/authorization data.
- Valid ID/token returns payload without secret metadata.
- Wrong token, malformed ID, path traversal, missing file, expired file, invalid
  JSON, wrong version, oversized file, and invalid shape do not return payload.
- Delete is idempotent.
- Collision retries are bounded.
- Concurrent jobs never read/delete each other.
- Expired load deletes the owned file.
- Opportunistic cleanup ignores unrelated names and current jobs.
- Injected test root prevents touching the developer's real temp job directory.

## Exit gate

Step 3 is complete when:

- two independent callers can safely hand off serializable payloads through the
  filesystem without shared module state;
- missing/wrong/expired jobs are externally indistinguishable;
- normal and stale cleanup are bounded and tested;
- no external service or persistent project file is introduced;
- focused Node tests pass without Next.js or Playwright.
