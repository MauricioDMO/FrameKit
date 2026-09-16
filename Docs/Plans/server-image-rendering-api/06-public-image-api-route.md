# Step 6 - Public Image API Route

- **Status:** Implemented and verified in the current checkout on 2026-09-10; packed-consumer release synchronization remains in Steps 7-8.

## Goal

Document and verify the current `createFrameKitApiHandler(templates)` dispatcher
and `createStudioImageHandler(templates)` image handler in
`@mauriciodmo/framekit/server`. The handler authenticates with a same-origin
session cookie or an `Authorization: Bearer` database API token, validates client
input, prepares request-specific images, resolves/validates final data, invokes
the renderer, and returns PNG bytes or stable JSON failures. Consumers supply
only their generated registry and a thin Next.js route adapter.

## Depends on

- [Step 1](./01-contracts-and-server-boundary.md) auth/config/error contracts.
- [Step 2](./02-shared-canvas-and-image-inputs.md) image preparation and shared
  canvas semantics.
- [Step 4](./04-browser-lifecycle-and-capture.md)
  `renderTemplateImage`.
- [Step 5](./05-private-next-render-route.md) operational private page and proven
  process-global Map handoff.
- Consumer-generated registry entries/loaders.
- [Step 0.5](./README.md#step-05---package-clientserver-boundaries) package-boundary gate.
- [Step 0.6](./00.6-minimal-consumer-integration.md) minimal starter and generated
  client bindings, with the production Map handoff reverified.

## Deliverables

- The public `createFrameKitApiHandler` dispatcher and
  `createStudioImageHandler` image handler.
- `POST /api/framekit/images/render` adapters in the generated app and Studio.
- Bounded streaming JSON reader.
- Exact request-shape and registry/template validation.
- Node-side remote image preparation before browser capacity is consumed.
- One canonical resolve/validate pass producing `ResolvedRenderPayload`.
- Stable status/error/header mapping.
- One request-wide deadline and abort propagation through body reading, remote
  fetch, and browser rendering.
- Package-owned handler tests with renderer/fetch orchestration mocked, plus
  thin consumer-route integration and public-import type checks.

## Route location and runtime

```text
packages/create-framekit/template/src/app/api/framekit/[...action]/route.ts
apps/studio/src/app/api/framekit/[...action]/route.ts
```

Both route files contain only:

```typescript
import { createFrameKitApiHandler } from '@mauriciodmo/framekit/server'
import { templates } from '@framekit/generated/templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const handler = createFrameKitApiHandler(templates)

export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
```

Public factory signatures:

```typescript
function createFrameKitApiHandler (
  templates: readonly TemplateRegistryEntry[]
): (request: Request) => Promise<Response>

function createStudioImageHandler (
  templates: readonly TemplateRegistryEntry[]
): (request: Request) => Promise<Response>
```

Both factories only bind the registry. They do not read secrets, validate runtime
configuration, load templates, or start a browser during route-module evaluation.
Those operations occur in the returned request handler. Use native `Request` and
`Response`; the HTTP implementation does not require Next-specific request APIs.
Keep body/error helpers private and test through the handler where practical.

Rules:

- the catch-all `route.ts` exports the four bindings above so it can reach both
  access and image actions; for image rendering, the dispatcher routes only the
  exact `POST /api/framekit/images/render` request;
- any other method at `/api/framekit/images/render` returns the access-style JSON
  `405` with `Allow: POST`, before image authentication or body parsing;
- access paths retain their own method contracts: `POST` for `/login`, `/logout`,
  and `/account/password`; `GET,PATCH` for `/account`; `GET,POST` for `/tokens`
  and `/users`; `DELETE` for `/tokens/:id`; `PATCH,DELETE` for `/users/:id`;
  `POST` for `/users/:id/password`; and `GET` for `/users/:id/tokens`;
- there is no generic image `POST` endpoint or `/api/v1/images` compatibility
  route;
- Node.js runtime only, never Edge;
- dynamic/no-store;
- no implicit CORS;
- no public `GET` job/render status;
- no multipart input initially;
- never expose private job ID/token.

Unknown paths/actions return `404`. A known access path with an unsupported
method returns `405` with that route's own `Allow` list.

## Processing pipeline

Order is security/cost-sensitive:

```text
load config
  -> authenticate
  -> read bounded body
  -> parse exact JSON
  -> find/load template definition
  -> select variant
  -> prepare image inputs
       -> validate data URL/local path
       -> fetch allowed remote HTTPS image through Node.js
       -> convert remote raster to data URL
  -> resolveTemplateData once
  -> validateTemplateData once
  -> build ResolvedRenderPayload
  -> renderTemplateImage
  -> return PNG bytes
```

Do not parse/log body, load template details, fetch remote URLs, create jobs, or
reserve browser capacity before authentication succeeds.

Remote image preparation occurs before browser capacity reservation. A valid
same-origin session or database API token can cause allowed outbound image
fetches, but an invalid/unauthenticated request cannot.

## 1. Configuration

Inside each image-handler invocation, call the current pure
`parseImageRenderConfig` parser in `packages/framekit/src/server/config.ts` with
`process.env` as the explicit environment record. The consumer owns runtime
environment values; it does not need to call the parser or pass secrets in a
route adapter.

| Variable | Consumption | Default/valid range |
|---|---|---|
| `FRAMEKIT_INTERNAL_ORIGIN` | Private render origin and browser allowlist | Required HTTP loopback origin only; no parser default |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Node-side remote-image hostname allowlist | Optional; empty/unset disables remote hosts; exact DNS hostnames only |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | Process-local render capacity | Optional; `2` by default; `1`-`32` |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | Request/render deadline | Optional; `30000` ms by default; `1`-`120000` ms |

The current access layer additionally uses `FRAMEKIT_DATABASE_PATH` (default
`.framekit-data/framekit.sqlite`) for SQLite user/session/API-token storage.
On an empty database, `bootstrapUsers` reads only
`FRAMEKIT_ADMIN_USERNAME` (default `admin`) and
`FRAMEKIT_ADMIN_PASSWORD` (required, 12-256 UTF-8 bytes). These are the seven
supported FrameKit application variables: `FRAMEKIT_INTERNAL_ORIGIN`,
`FRAMEKIT_ALLOWED_IMAGE_HOSTS`, `FRAMEKIT_MAX_CONCURRENT_RENDERS`,
`FRAMEKIT_RENDER_TIMEOUT_MS`, `FRAMEKIT_DATABASE_PATH`,
`FRAMEKIT_ADMIN_USERNAME`, and `FRAMEKIT_ADMIN_PASSWORD`. There is no
image-handler API-key variable.

In the generated Dockerfile, `NODE_ENV=production`, `HOSTNAME=0.0.0.0`,
`PORT=3000`, and `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` are image defaults
consumed by Next's standalone server, session-cookie handling, and Playwright/
the browser installer respectively. `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` is
used only in Docker dependency-install stages. `HOSTNAME`, `PORT`, and
`PLAYWRIGHT_BROWSERS_PATH` have no additional FrameKit parser range/default.
`FRAMEKIT_PUBLIC_ORIGIN` is unsupported: it is not consumed by the current
image/access code and is not a fallback for same-origin checks.

Configuration failure returns:

```http
503 Service Unavailable
Content-Type: application/json
Cache-Control: no-store
```

```json
{
  "error": "api_not_configured",
  "message": "Image rendering API is not configured"
}
```

Do not reveal which secret/config value is absent.

The image handler's `api_not_configured` `503` covers missing or invalid image
render configuration. Missing or invalid administrator bootstrap settings are
an access-login concern and return the access `service_unavailable` `503` only
when login initializes an empty database.

Parse per request in v1. This avoids build-time secret requirements and stale
development configuration without adding a cache or environment singleton.

## 2. Authentication

- For the image action, if `Authorization` is present, require a valid database
  API token in the strict `Bearer` credential; an invalid Bearer value does not
  fall back to a session.
- Without `Authorization`, require a valid active `framekit_session` cookie and
  a same-origin request. The same-origin check uses the request URL and accepted
  forwarding headers, never `FRAMEKIT_PUBLIC_ORIGIN`.
- On failure return `401`, `Cache-Control: no-store`, and
  `WWW-Authenticate: Bearer`.
- Do not parse/log request body before auth.
- Return the same auth result regardless of template slug/data.

Historical only, removed and unsupported: the former `FRAMEKIT_API_KEY`,
`authenticateBearer`, `parseImageApiConfig`, and `createImageHandler` API-key
contract. The current image route uses database-backed sessions and API tokens
only.

## 3. Bounded body reader

Do not rely only on `Content-Length`:

1. Require `Content-Type` beginning with `application/json` (optional charset).
2. If finite declared length exceeds 12 MB, reject immediately.
3. Stream `Request.body`, count encoded bytes, and cancel when above 12 MB.
4. Reject missing body, invalid UTF-8, or malformed JSON as `invalid_request`.
5. Do not accept compressed request bodies unless a separately bounded
   decompression contract is later added.

Return `413` for size and `400` for syntax/shape.

## 4. Exact request parsing

Accepted top-level shape:

```typescript
{
  template: string
  variant?: string
  data?: Record<string, unknown>
}
```

Rules:

- root must be a plain object;
- only `template`, `variant`, and `data` are accepted;
- template must be a non-empty exact generated slug string;
- variant, when present, must be a non-empty string;
- data, when present, must be a plain object, not `null`/array/class value;
- reject prototype-sensitive keys such as `__proto__`, `prototype`, and
  `constructor` at untrusted object boundaries;
- do not trim/coerce field values;
- omitted data becomes `{}`.

Unknown field keys are rejected after definition load and before any remote
image fetch.

## 5. Registry and definition lookup

The thin application adapter supplies the registry through:

```typescript
import { templates } from '@framekit/generated/templates'
```

The package never imports `@framekit/generated/*` directly. The registry remains
server-consumable; only the separate generated client bindings carry `'use client'`.

Flow:

1. Find exact `TemplateRegistryEntry` by slug.
2. If absent -> `template_not_found` / `404`.
3. Load definition with `entry.load()`.
4. Validate the default export through canonical definition validation.
5. Loader/definition project failure -> `render_failed`, not client field error.
6. Read trusted width/height from definition.
7. Select `request.variant ?? definition.variants.default`.
8. Unknown selected variant -> `invalid_request` / `400`.

Do not derive dimensions/title/assets from caller data.

## 6. Data and image preparation

Call the Step 2 async helper with:

- loaded definition;
- selected variant;
- request data;
- generated entry asset manifest;
- exact allowed image hosts;
- request/deadline abort signal.

The helper returns ordinary edits plus a cloned prepared asset manifest. Remote
HTTPS values have already become validated data URLs.

Then run the canonical pipeline exactly once:

```typescript
const data = resolveTemplateData(definition, variant, edits, assets)
const fields = validateTemplateData(definition, data)
```

Rules:

- unknown fields and invalid source shapes fail before remote fetch where
  possible;
- data/base64/root-relative/host errors map to their semantic 4xx codes;
- allowed remote fetch/network/upstream failure maps to `image_fetch_failed`;
- canonical field validation errors -> `422 invalid_template_data` + safe
  `fields`;
- no browser capacity is consumed until all preparation/validation succeeds.

Build:

```typescript
const payload: ResolvedRenderPayload = {
  template: entry.slug,
  variant,
  data,
  assets,
  width: definition.width,
  height: definition.height
}
```

The private page must render this payload directly rather than re-resolving it.

## 7. Rendering and request cancellation

The handler establishes one end-to-end deadline from request handling and combines
it with `request.signal`. Use the same effective signal for bounded body reading,
remote image preparation, and rendering. Do not give capture a fresh 30-second
budget after the earlier stages have consumed time.

Call with that effective signal:

```typescript
const png = await renderTemplateImage({
  payload,
  config: config.render,
  signal
})
```

Cancel the body reader on abort or deadline and stop remote fetch/browser work.
Map the handler's deadline to `render_timeout`, including expiry before browser
capacity is reserved. Preserve safe handling of a disconnected client without
inventing a new public error code.

The handler clears its own deadline timer/listeners in `finally`. Image-fetch and
renderer cleanup remain owned by their existing helpers; the route adapter owns
none of these resources.

An aborted request must not create an unhandled rejection. If a response can no
longer be written, coarse operational logging is sufficient.

## 8. Success response

Return screenshot bytes directly, without base64/JSON wrapping:

```http
200 OK
Content-Type: image/png
Content-Length: <buffer length>
Content-Disposition: inline; filename="<safe-slug>.png"
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

Filename rules:

- replace `/` with `-`, matching current Studio behavior;
- use only validated generated slug characters;
- quote safely;
- never accept caller-provided filename.

Do not return job ID/token, request echo, ETag, or cacheable headers.

Client examples may consume the response as `Blob`, `ArrayBuffer`, or raw bytes.

## Error response shape

```typescript
interface ImageApiErrorResponse {
  error: ImageRenderErrorCode
  message: string
  fields?: Record<string, unknown>
}
```

Initial mapping:

| Failure | HTTP | Additional behavior |
|---|---:|---|
| `invalid_request` | 400 | No browser work |
| `unauthorized` | 401 | `WWW-Authenticate: Bearer` |
| `template_not_found` | 404 | Only after auth |
| `request_too_large` | 413 | Stop body/image read |
| `unsupported_image` | 415 | No raw bytes/URL in message |
| `invalid_template_data` | 422 | Include canonical safe `fields` |
| `image_host_not_allowed` | 422 | Do not echo full URL |
| `image_fetch_failed` | 502 | Retryable upstream/network-style failure; no full URL/body |
| `api_not_configured` | 503 | Generic config message |
| `render_capacity_exhausted` | 503 | `Retry-After: 1` |
| `render_timeout` | 504 | Handler clears its deadline; renderer cleanup is owned by the renderer if started |
| `render_failed` | 500 | Generic public message; the cause is never serialized |

Every JSON error includes `Content-Type: application/json` and
`Cache-Control: no-store`.

The dispatcher handles route-level errors separately from the image error-code
union: the exact image path with a non-`POST` method returns
`{ "error": "method_not_allowed", "message": "Method not allowed" }` with
status `405` and `Allow: POST`; an unknown path/action returns `404`, and a
known access path with a wrong method returns `405` with its route-specific
`Allow` header.

## Thin adapter rule

Canonical template and Studio use the same `createFrameKitApiHandler` adapter,
which dispatches the image action to `createStudioImageHandler`. There must be
no application-owned authentication, parsing, resolution, image preparation,
response construction, or error mapping to copy between them.

The existing `./server` facade exports the dispatcher, image handler, render
helpers, access handler, and private-page helper. Keep those exports compatible.
Consumers using the standard endpoint do not need to construct
`ResolvedRenderPayload` or manage render jobs.

The actual Next.js `route.ts` and its literal static configuration stay in the
consumer. The package owns `server/image-handler/`, not an undiscoverable
Next route file. Do not add a public dependency-injection container, middleware
framework, or separate Studio protocol to implement this one pipeline.

## Abuse and rate behavior

- Authentication is mandatory, but sessions and database API tokens are not a
  rate limiter.
- Body/image byte limits bound memory/network work.
- Exact image-host allowlist bounds outbound destinations.
- Browser capacity returns `503` instead of creating an unbounded queue.
- Deployment infrastructure may add rate limits outside FrameKit.
- The app does not internally retry failed renders or remote images in v1.
- Repeated identical requests render independently and are not cached.

## Logging

On completion log only coarse operational information such as:

- internal correlation/job ID if available;
- template slug;
- stable result code;
- coarse duration;
- output byte length on success.

Never log:

- Authorization credentials (session/API token);
- job token;
- request field values;
- data URLs/base64;
- full remote image URLs or signed query strings;
- remote response bodies;
- private page payload.

## Expected files

```text
packages/create-framekit/template/src/app/api/framekit/[...action]/route.ts
apps/studio/src/app/api/framekit/[...action]/route.ts
packages/framekit/src/server.ts
packages/framekit/src/server/image-handler/
  index.ts
  parse-request.ts
  errors.ts
  response.ts
  request-deadline.ts
  render-payload.ts
packages/framekit/src/server/__tests__/image-handler.test.ts
packages/framekit/src/server/request-body/
  index.ts
  validate-request.ts
  reader.ts
packages/framekit/src/server/__tests__/request-body.test.ts
packages/framekit/tests/types/image-handler.ts
```

Runtime tests live under the nearest relevant `__tests__/` directory and mirror
the production domain. FrameKit server tests use
`packages/framekit/src/server/__tests__/`; compile-time type fixtures remain
under `packages/framekit/tests/types/`; root Playwright E2E remains under
`tests/e2e/`.

Image preparation stays in the Step 2 server module. Keep response/error mapping
inside the private `server/image-handler/` modules; do not expose these helpers as
public package exports.

## Implementation sequence

1. Keep the package dispatcher/image handler, configuration/auth ordering, and
   bounded reader/request parser covered by focused tests.
2. Bind registry lookup/definition validation inside the handler.
3. Wire one deadline and abort signal across reading/preparation/rendering.
4. Prepare images and run canonical resolve/validate exactly once.
5. Invoke `renderTemplateImage`; construct PNG/error responses in the package.
6. Keep the dispatcher/image-handler exports and public-import type fixtures.
7. Keep the two catch-all adapters with their literal runtime settings and
   method bindings.
8. Run package tests, adapter integration, production builds, and standalone
   public/private Map handoff checks.

## Focused tests

- Missing/wrong auth returns `401` before body/registry/fetch/renderer access.
- Missing production config returns generic `503` without secret names/values.
- Content type, malformed JSON, null/array roots, unknown top-level properties,
  dangerous keys, missing template, invalid data object, and body size fail.
- Unknown template returns `404` only after auth.
- Omitted variant uses default; unknown variant returns `400`.
- Unknown data key is rejected before remote image fetch.
- Loader/definition project failure returns generic `500`.
- Remote URL is prepared by Node and renderer receives only prepared data URL.
- Host/data/MIME/fetch failures retain documented codes/status.
- Canonical field errors return `422` and renderer is not called.
- `resolveTemplateData`/validation are each invoked only once per valid request.
- Capacity/timeout map to `503`/`504` and route does not repeat renderer cleanup.
- Success returns exact PNG headers/body and safe filename.
- Request abort reaches both remote image fetch and renderer.
- A slow body or image stage consumes the same deadline budget as capture;
  expiry prevents later stages and clears the handler's timer/listeners.
- Importing the route/factory with absent runtime configuration does not fail the
  build; a request with absent image configuration returns the documented generic
  `503`.
- No response/log snapshot contains secret request values/full signed URLs.
- Template and Studio adapters behave identically for the same fixture.

## Exit gate

Step 6 is complete when:

- authenticated endpoint works with mocked browser renderer;
- `createFrameKitApiHandler`/`createStudioImageHandler` own all image HTTP
  behavior and both application routes contain only registry imports, literal
  route settings, and handler method bindings;
- remote images are fetched/prepared before browser work;
- all invalid/unauthorized input exits before browser capacity consumption;
- canonical data resolution/validation runs once;
- success returns raw PNG bytes;
- every semantic failure maps without message parsing;
- request-wide cancellation/deadline and factory import/type checks pass;
- the generated starter contains the current seven maintained `src/app` files;
- canonical template and Studio focused tests/typecheck/build pass.
