# Step 1 - Contracts and Server Boundary

- **Status:** Implemented and verified in the current checkout.
- **Reading note:** This file preserves the historical Step 1 design and
  sequence, but its contracts and boundary notes are reconciled with the
  implementation currently shipped by the checkout.

## Historical design vs current implementation

The original Step 1 goal was to establish the contracts before image fetching,
temporary jobs, browser capture, and Next.js routes were added. Those later
pieces are now implemented, so wording such as “later steps” and “Step 6” below
describes the historical delivery sequence, not pending work.

The current public route adapter is:

```typescript
createFrameKitApiHandler(
  templates: readonly TemplateRegistryEntry[]
): (request: Request) => Promise<Response>
```

The generated Next.js adapter binds this handler to `GET`, `POST`, `PATCH`, and
`DELETE` under `/api/framekit/[...action]`. The handler sends exactly
`POST /api/framekit/images/render` to `createStudioImageHandler(templates)`;
other requests are delegated to the access handler, and unsupported methods or
unknown paths receive the access/API error response. `createStudioImageHandler`
is also a supported lower-level image-handler export, but it is not the
generated route adapter. Consumers do not call the configuration parser or
authentication helpers themselves.

The current image flow uses an active same-origin session or an active database
API token. The historical single-shared-credential design is not a current
contract. The render parser is internal to the image-handler flow and is not a
supported export from `@mauriciodmo/framekit/server`.

## Goal (historical Step 1 design)

Establish the stable server vocabulary and package boundary before adding image
fetching, in-memory jobs, browser behavior, or Next.js routes.

Later steps must depend on typed configuration and discriminated failures rather
than parsing error text or importing route-specific code.

The contracts/configuration tests are intentionally executable without launching
Chromium. The current `./server` facade also exports the later Next.js and
Playwright-backed runtime helpers described above.

## Depends on

- Existing public package entry points and tsdown build.
- Existing `TemplateDefinition`, `TemplateAssetManifest`, field, validation, and
  generated-registry contracts.
- The architecture decisions in this plan's README.

## Deliverables

- A server-only source entry at `packages/framekit/src/server.ts`.
- Server configuration types and strict environment parsing for render settings.
- Public request and internal resolved-payload types independent of Next.js.
- One discriminated render-error model with stable codes.
- A server-only access boundary for session and API-token authentication.
- Package build/export wiring for the `@mauriciodmo/framekit/server` facade.
- Focused tests and public-import type fixtures.

## Boundary design

The Step 1 contracts own generic server-rendering behavior. Later steps extend
the same facade with runtime helpers and Next private-page integration. The
package must not import a consumer's generated registry or own a global
environment singleton.

The generated application remains responsible for supplying:

- its registry entries and template loaders;
- runtime environment values, including secrets and deployment policy;
- the incoming `Request` through its route adapter;
- the public API route;
- the private render route;
- its loopback internal origin.

The server package remains responsible for:

- validating server option values;
- stable render failure codes;
- session and database API-token authentication at the access boundaries;
- request/image helpers added in later steps;
- the in-memory render-job store;
- browser and capture orchestration;
- the complete HTTP handler, now implemented by
  `createFrameKitApiHandler`/`createStudioImageHandler`; the original plan
  placed that work in Step 6. The image handler passes `process.env` explicitly
  to the pure render parser at request time and constructs the outgoing
  `Response`.

Consumers using `createFrameKitApiHandler(templates)` do not manually call the
parser or orchestrate these lower-level helpers. The pure render parser is kept
inside the server-owned image handler.

No type in the `./server` facade may reference `packages/create-framekit/template`,
`apps/studio`, or `@framekit/generated/*`.

## Public types (current facade)

The current `@mauriciodmo/framekit/server` facade exports these contracts. The
request type is public, but its runtime validation remains inside the image
handler.

```typescript
export interface ImageRenderRequest {
  template: string
  variant?: string
  data?: Record<string, unknown>
}

export interface ImageRenderRuntimeConfig {
  internalOrigin: URL
  allowedImageHosts: ReadonlySet<string>
  maxConcurrentRenders: number
  renderTimeoutMs: number
}

```

The HTTP parser starts from `unknown`; `ImageRenderRequest` does not replace
runtime validation. The current parser accepts only `template`, optional
`variant`, and optional `data`, rejecting unknown keys and empty values before
template loading.

The public route resolves and validates data before browser work. The renderer
therefore receives a final serializable payload:

```typescript
export interface ResolvedRenderPayload {
  template: string
  variant: string
  data: Record<string, string | number | boolean>
  assets: TemplateAssetManifest
  width: number
  height: number
}
```

`data` is the output of the canonical resolver after request image overrides are
prepared. The private page must not run `resolveTemplateData(...)` again.

The payload contains no API key, authorization header, job token, loader,
template definition, React node, browser object, filesystem path, request
object, or response object.

## Error model

The current server package uses the exported `ImageRenderError` class. It
carries machine-readable information so the public route never matches
messages.

```typescript
export type ImageRenderErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'template_not_found'
  | 'request_too_large'
  | 'unsupported_image'
  | 'invalid_template_data'
  | 'image_host_not_allowed'
  | 'image_fetch_failed'
  | 'api_not_configured'
  | 'render_capacity_exhausted'
  | 'render_timeout'
  | 'render_failed'

export interface ImageRenderFailure {
  code: ImageRenderErrorCode
  message: string
  fields?: Record<string, unknown>
  cause?: unknown
}
```

Rules:

- `code` is stable and public.
- `message` is a safe public diagnostic and may improve without changing the
  code.
- `fields` is allowed only for canonical template-data validation errors.
- `cause` is server-side only and is never serialized directly.
- Playwright errors, fetch response bodies, stack traces, signed URLs, and
  secrets never reach the client.
- unknown thrown values are normalized once at the public route boundary to
  `render_failed` unless a lower layer already created a semantic failure.

Lower-level browser, job, request-body, image-input, and render modules throw
semantic failures; they do not create `Response` objects. The image-handler
boundary is the exception: it normalizes those failures and creates the public
`Response`.

## Environment parser (current implementation)

The current pure render parser accepts an explicit environment record:

```typescript
parseImageRenderConfig(env: NodeJS.ProcessEnv): ImageRenderRuntimeConfig
```

It lives in `packages/framekit/src/server/config.ts`, is invoked with
`process.env` by `createStudioImageHandler` for each request, and is not exported
by the supported `./server` facade. Browser/image/job modules receive the
parsed config instead of reading `process.env` throughout their own logic.

The parser validates only render settings. `createStudioImageHandler` passes its
result to image preparation/render orchestration and authenticates either an
active same-origin session or an unrevoked database API token. Credentials never
enter the render payload, Map job, browser state, page request, or logs.

### Private loopback render origin

- The current parser derives the origin as `http://localhost:${PORT}` from the
  trusted process configuration.
- `PORT` defaults to `3000` and must be an integer from `1` through `65535`.
- The derived HTTP loopback origin is used for the private render page and the
  browser request allowlist.
- The parser does not read `NODE_ENV`, `HOSTNAME`, or any public-origin setting.

### `FRAMEKIT_ALLOWED_IMAGE_HOSTS`

- Split on commas.
- Trim and lowercase each hostname.
- Remove empty entries and duplicates.
- Treat entries as hostnames, not URLs.
- Reject schemes, credentials, paths, queries, fragments, wildcards, ports, and
  IP literals.
- An empty set is valid and disables remote HTTPS request-image overrides.

This allowlist is used by Node.js remote-image fetching. Chromium never receives
it as permission to access those hosts.

### Numeric limits

Initial configurable values:

```text
FRAMEKIT_MAX_CONCURRENT_RENDERS=2
FRAMEKIT_RENDER_TIMEOUT_MS=30000
```

Parsing rules:

- parse base-10 integers only;
- reject decimals, exponent notation, `NaN`, infinities, negatives, and zero;
- reject values above `32` simultaneous renders or `120000` milliseconds;
- defaults are `2` simultaneous renders and `30000` milliseconds.

### Current access variables

The three render variables above plus the following three access/bootstrap
variables are the six current FrameKit-specific application variables consumed
by the checkout.
`PORT` is a trusted process setting used to derive the private loopback origin:

- `FRAMEKIT_DATABASE_PATH` is consumed by the SQLite access layer. It defaults
  to `.framekit-data/framekit.sqlite`, resolves relative to `process.cwd()`,
  creates parent directories for file-backed databases, and accepts `:memory:`
  for an in-memory database.
- `FRAMEKIT_ADMIN_USERNAME` is read by `bootstrapUsers` only when the database
  has no users. It defaults to `admin` and must be 3-64 ASCII letters, numbers,
  `.`, `_`, or `-`.
- `FRAMEKIT_ADMIN_PASSWORD` is read by `bootstrapUsers` only for that initial
  bootstrap. It has no default and must be 12-256 UTF-8 bytes.

Request/body/image-size constants can remain package constants in v1 rather than
expanding the environment surface prematurely.

### Browser mode

Production server rendering is always headless in v1. Do not add public
`HEADLESS`, `SLOW_MO`, arbitrary launch args, or browser-selection environment
variables until an actual supported deployment requires them.

### Related runtime and build variables

The following runtime/build variables may appear in a generated deployment but
are separate from the six FrameKit application variables above:

- `NODE_ENV=production` is consumed by the standalone Next.js runtime; the access
  cookie helper also adds `Secure` only when it equals `production`.
- `HOSTNAME=0.0.0.0` and `PORT=3000` configure the standalone server's container
  bind address and port. `PORT` also supplies the inferred private loopback
  origin `http://localhost:${PORT}`.
- `PLAYWRIGHT_BROWSERS_PATH` is consumed by Playwright's installer and runtime
  executable lookup. Installer and renderer must use the same path.
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` is build-only and suppresses browser
  downloads during dependency installation; the runner installs the pinned shell
  explicitly through FrameKit's browser command.

The parser consumes `PORT` but does not consume `NODE_ENV` or `HOSTNAME`. Current
code does not consume `FRAMEKIT_PUBLIC_ORIGIN`, `HEADLESS`, `SLOW_MO`, arbitrary
browser arguments, or browser selectors.

## HTTP route and adapter (current implementation)

The generated consumer route is a thin Next.js adapter:

```typescript
import { createFrameKitApiHandler } from '@mauriciodmo/framekit/server'
import { templates } from '@framekit/generated/templates'

const handler = createFrameKitApiHandler(templates)

export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
```

The canonical image endpoint is exactly:

```text
POST /api/framekit/images/render
```

`createFrameKitApiHandler` matches that pathname before delegating every other
request to the access handler. Only `POST` is accepted for the image endpoint;
other methods return `405` with `Allow: POST` before the request body is read.
The image-handler path uses the four render settings and the access layer's
three database/bootstrap settings, authenticates the request, validates/resolves
the template payload, and returns PNG bytes with `Content-Type: image/png`.
Configuration, authentication, validation, capacity, timeout, and render
failures are returned as the documented machine-readable image errors with
`Cache-Control: no-store`.

## Authentication boundary

The access layer owns session and API-token authentication. The image handler:

- accepts exactly one strict `Authorization: Bearer <token>` credential;
- validates the token against the active, unrevoked SQLite user/token records;
- accepts a session cookie only for a same-origin request when no Authorization
  header is present;
- rejects an invalid Bearer credential without falling back to a session;
- does not require same-origin for a valid Bearer credential, while the session
  path does require it;
- checks authentication before reading the image request body (after the render
  configuration has been parsed);
- returns only success/failure and never logs compared credentials.

Configuration failure is distinct from client authentication failure: missing or
invalid render settings return `api_not_configured`, while missing or wrong
session/token credentials return `unauthorized`.

## Server-only export rules

The supported import is:

```typescript
import {
  createFrameKitApiHandler,
  createStudioImageHandler
} from '@mauriciodmo/framekit/server'
```

`createFrameKitApiHandler` is the public route adapter; `createStudioImageHandler`
is the lower-level public image handler. The current facade also exports the
access handler, image-input/render helpers, private render-page/job helpers,
and their supported types. Do not add `server/*`, `browser`, `auth`, or `shared`
public subpaths.

Rules:

- `./server` may import Node built-ins and `playwright-core`.
- root, `./client`, `./editor`, and the `./studio` client graph must not import the
  server entry at runtime; `./dev` is Node tooling, not a client-capable export.
- the existing `./next` configuration entry must not import request-bound Next
  APIs or the server/browser runtime; see Step 0.6 for its import-time contract.
- importing `@mauriciodmo/framekit` or `/editor` must never pull Playwright into a
  client bundle.
- generated apps must consume supported package exports, never repository source
  paths.
- keep internal helpers unexported unless a generated/first-party adapter needs
  them.

## Expected files

```text
packages/framekit/src/server.ts
packages/framekit/src/server/config.ts
packages/framekit/src/server/__tests__/config.test.ts
packages/framekit/src/server/errors.ts
packages/framekit/tests/types/server-api.ts
packages/framekit/package.json
packages/framekit/tsdown.config.ts
```

Runtime tests live under the nearest relevant `__tests__/` directory and mirror
the production domain. Compile-time type fixtures remain under
`packages/framekit/tests/types/`.

Use fewer source files if config/auth/errors remain clear together; do not create
interfaces for speculative implementations.

## Implementation sequence

1. Add stable error codes and one semantic failure representation.
2. Add `ResolvedRenderPayload` and configuration contracts.
3. Implement strict pure environment parsing.
4. Integrate session and API-token authentication at the image-handler boundary.
5. Create `packages/framekit/src/server.ts` and export only completed symbols.
6. Wire `./server` into tsdown and `package.json`.
7. Add positive/negative tests and supported-import type fixture.
8. Build the package and inspect client/server dependency boundaries.

## Focused tests

- Every documented error code is accepted and arbitrary strings are rejected.
- `ResolvedRenderPayload` contains only serializable render values and assets.
- Missing or invalid render settings fail closed for `parseImageRenderConfig` in
  every environment.
- The pure parser stays strict regardless of `NODE_ENV`; any development
  fallback remains outside the parser.
- Internal origin accepts loopback with a port and rejects public hosts,
  credentials, paths, queries, and fragments.
- Host allowlist parsing normalizes case/whitespace and rejects wildcard/scheme/
  path/port/IP values.
- Numeric parsing accepts defaults/bounded integers and rejects coercion edge
  cases.
- Strict Bearer parsing rejects empty, repeated, Basic, malformed, and wrong
  tokens; invalid Bearer credentials do not fall back to a session.
- `./server` compiles through the public package export.
- root/editor imports do not resolve server-only dependencies.

## Exit gate

Step 1 is complete and verified in the current checkout:

- [x] The server-only public boundary builds and typechecks without Next.js
  route objects or Chromium.
- [x] Auth/config/error behavior is deterministic and covered by focused tests.
- [x] The final render payload contract represents already-resolved data.
- [x] Existing package entry points still build without depending on `./server`.

This records only Step 1's verified gate. See the plan README for the current
status of subsequent phases; it does not certify their later exports or checks.
