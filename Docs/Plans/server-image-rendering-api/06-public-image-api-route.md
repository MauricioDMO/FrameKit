# Step 6 - Public Image API Route

## Goal

Implement the authenticated synchronous endpoint that validates client input,
prepares request-specific images, resolves/validates the final template data,
invokes the server renderer, and returns PNG bytes or stable JSON failures.

## Depends on

- [Step 1](./01-contracts-and-server-boundary.md) auth/config/error contracts.
- [Step 2](./02-shared-canvas-and-image-inputs.md) image preparation and shared
  canvas semantics.
- [Step 4](./04-browser-lifecycle-and-capture.md)
  `renderTemplateImage`.
- [Step 5](./05-private-next-render-route.md) operational private page and proven
  process-global Map handoff.
- Consumer-generated registry entries/loaders.

## Deliverables

- `POST /api/v1/images` in the canonical generated application.
- Equivalent thin route in first-party Studio.
- Bounded streaming JSON reader.
- Exact request-shape and registry/template validation.
- Node-side remote image preparation before browser capacity is consumed.
- One canonical resolve/validate pass producing `ResolvedRenderPayload`.
- Stable status/error/header mapping.
- Request-abort propagation to remote fetch and browser rendering.
- Focused route tests with renderer/fetch orchestration mocked.

## Route location and runtime

```text
src/app/api/v1/images/route.ts
```

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

Call the Step 1 parser with explicit environment record.

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

A stable module may cache successfully parsed configuration if tests prove safe
for the Next runtime. Do not permanently cache a development configuration
failure across reloads.

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

Use generated application imports:

```typescript
import { templates } from '@framekit/generated/templates'
```

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
  height: definition.height,
}
```

The private page must render this payload directly rather than re-resolving it.

## 7. Rendering and request cancellation

Call:

```typescript
const png = await renderTemplateImage({
  payload,
  config: config.render,
  signal: request.signal,
})
```

The request signal should also be available during remote image preparation so a
disconnected client stops both fetch and browser work.

Cleanup belongs to image-fetch/render helpers, not route duplication.

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

Canonical template and `apps/studio` routes should differ only in registry import
and deployment configuration.

If parsing/error mapping grows into duplicated application code, expose a
server-package helper that accepts the generated registry/definition loader as a
dependency. Do not create a Studio-only protocol.

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
packages/framekit/src/server/request-body.ts
packages/framekit/src/server/request-body.test.ts
packages/framekit/src/server/http-errors.ts
```

Image preparation stays in the Step 2 server module. Pure body/error helpers
belong in the package only when they prevent real duplication.

## Implementation sequence

1. Add bounded body reader and exact request parser tests.
2. Implement canonical registry/definition lookup helper boundaries as needed.
3. Implement canonical generated-template route adapter.
4. Wire configuration and authentication first.
5. Wire async image preparation with request abort signal.
6. Run canonical resolve/validate once and create `ResolvedRenderPayload`.
7. Invoke `renderTemplateImage`.
8. Add raw PNG response + semantic JSON error mapping.
9. Add route tests with mocked image fetch/renderer/registry fixture.
10. Mirror the thin route in first-party Studio.

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
- No response/log snapshot contains secret request values/full signed URLs.
- Template and Studio adapters behave identically for the same fixture.

## Exit gate

Step 6 is complete when:

- authenticated endpoint works with mocked browser renderer;
- remote images are fetched/prepared before browser work;
- all invalid/unauthorized input exits before browser capacity consumption;
- canonical data resolution/validation runs once;
- success returns raw PNG bytes;
- every semantic failure maps without message parsing;
- canonical template and Studio focused tests/typecheck/build pass.
