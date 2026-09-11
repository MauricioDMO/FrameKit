# Step 6 - Public Image API Route

- **Status:** Implemented and verified in the current checkout on 2026-09-10; packed-consumer release synchronization remains in Steps 7-8.

## Goal

Implement `createImageHandler(templates)` in `@mauriciodmo/framekit/server`. Its
returned handler authenticates, validates client input, prepares request-specific
images, resolves/validates final data, invokes the renderer, and returns PNG bytes
or stable JSON failures. Consumers supply only their generated registry and a
Next.js route/config adapter.

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

- A public `createImageHandler` factory owning the entire HTTP pipeline.
- `POST /api/v1/images` adapters in the canonical generated app and Studio.
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
packages/create-framekit/template/src/app/api/v1/images/route.ts
apps/studio/src/app/api/v1/images/route.ts
```

Both route files contain only:

```typescript
import { createImageHandler } from '@mauriciodmo/framekit/server'
import { templates } from '@framekit/generated/templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = createImageHandler(templates)
```

Public factory signature:

```typescript
function createImageHandler (
  templates: readonly TemplateRegistryEntry[]
): (request: Request) => Promise<Response>
```

The factory only binds the registry. It does not read secrets, validate runtime
configuration, load templates, or start a browser during route-module evaluation.
Those operations occur in the returned request handler. Use native `Request` and
`Response`; the HTTP implementation does not require Next-specific request APIs.
Keep body/error helpers private and test through the handler where practical.

Rules:

- export only `POST` initially;
- Node.js runtime only, never Edge;
- dynamic/no-store;
- no implicit CORS;
- no public `GET` job/render status;
- no multipart input initially;
- never expose private job ID/token.

Unsupported methods may use Next's route behavior or a tested explicit `405`
with `Allow: POST`; choose one consistent behavior.

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

Remote image preparation occurs before browser capacity reservation. A valid API
key can cause allowed outbound image fetches, but an invalid/unauthenticated
request cannot.

## 1. Configuration

Inside each handler invocation, call the Step 1 pure parser with `process.env` as
the explicit environment record. The consumer owns runtime environment values;
it does not need to call the parser or pass secrets in a route adapter.

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

Parse per request in v1. This avoids build-time secret requirements and stale
development configuration without adding a cache or environment singleton.

## 2. Authentication

- Read `Authorization` once.
- Use the Step 1 constant-time Bearer helper.
- On failure return `401`, `Cache-Control: no-store`, and
  `WWW-Authenticate: Bearer`.
- Do not parse/log request body before auth.
- Return the same auth result regardless of template slug/data.

One shared key is the full v1 auth contract.

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
| `render_capacity_exhausted` | 503 | Add small bounded `Retry-After` |
| `render_timeout` | 504 | Renderer cleanup already performed |
| `render_failed` | 500 | Generic public message; coarse internal cause only |

Every JSON error includes `Content-Type: application/json` and
`Cache-Control: no-store`.

## Thin adapter rule

Canonical template and Studio use the same `createImageHandler` adapter. There
must be no application-owned authentication, parsing, resolution, image
preparation, response construction, or error mapping to copy between them.

The existing `./server` facade already contains the Steps 1-5 runtime and Step
0.5 private-page helper. Extend it with the high-level handler; keep the existing
lower-level exports compatible. Consumers using the standard endpoint do not
need to construct `ResolvedRenderPayload` or manage render jobs.

The actual Next.js `route.ts` and its literal static configuration stay in the
consumer. The package owns `server/image-handler/`, not an undiscoverable
Next route file. Do not add a public dependency-injection container, middleware
framework, or separate Studio protocol to implement this one pipeline.

## Abuse and rate behavior

- Authentication is mandatory but one shared key is not a rate limiter.
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

- Authorization/API key;
- job token;
- request field values;
- data URLs/base64;
- full remote image URLs or signed query strings;
- remote response bodies;
- private page payload.

## Expected files

```text
packages/create-framekit/template/src/app/api/v1/images/route.ts
apps/studio/src/app/api/v1/images/route.ts
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

1. Add the package handler factory, configuration/auth ordering, and bounded
   reader/request parser with focused tests.
2. Bind registry lookup/definition validation inside the handler.
3. Wire one deadline and abort signal across reading/preparation/rendering.
4. Prepare images and run canonical resolve/validate exactly once.
5. Invoke `renderTemplateImage`; construct PNG/error responses in the package.
6. Export the factory and add its public-import type fixture.
7. Add the two minimal `POST` adapters, bringing the starter to five maintained
   `src/app` files.
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
- Importing the route/factory with absent API secrets does not fail the build;
  a request with absent configuration returns the documented generic `503`.
- No response/log snapshot contains secret request values/full signed URLs.
- Template and Studio adapters behave identically for the same fixture.

## Exit gate

Step 6 is complete when:

- authenticated endpoint works with mocked browser renderer;
- `createImageHandler` owns all HTTP behavior and both application routes contain
  only registry imports, literal route settings, and the `POST` factory binding;
- remote images are fetched/prepared before browser work;
- all invalid/unauthorized input exits before browser capacity consumption;
- canonical data resolution/validation runs once;
- success returns raw PNG bytes;
- every semantic failure maps without message parsing;
- request-wide cancellation/deadline and factory import/type checks pass;
- the minimal starter contains exactly five maintained `src/app` files;
- canonical template and Studio focused tests/typecheck/build pass.
