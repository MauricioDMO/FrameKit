# Step 6 - Public Image API Route

## Goal

Implement the authenticated synchronous endpoint that validates client input,
normalizes it into a render payload, invokes the server renderer, and returns PNG
bytes or stable JSON failures.

## Depends on

- [Step 1](./01-contracts-and-server-boundary.md) auth/config/error contracts.
- [Step 2](./02-shared-canvas-and-image-inputs.md) image and asset normalization.
- [Step 4](./04-browser-lifecycle-and-capture.md)
  `renderTemplateImage`.
- [Step 5](./05-private-next-render-route.md) operational private page.
- Consumer-generated registry entries and loaders.

## Deliverables

- `POST /api/v1/images` in the canonical generated application.
- Equivalent thin route in first-party Studio.
- Bounded streaming JSON reader.
- Exact request-shape and registry/template validation.
- Stable status/error/header mapping.
- Request-abort propagation and cleanup.
- Focused route tests with browser orchestration mocked.

## Route location and runtime

```text
src/app/api/v1/images/route.ts
```

Rules:

- export only `POST` initially;
- run in Node.js runtime, never Edge;
- mark dynamic/no-store;
- do not enable CORS implicitly;
- do not add a `GET` that renders or returns job state;
- do not accept multipart input initially;
- do not expose the private job ID/token.

Unsupported methods use Next.js route behavior or an explicit `405` with
`Allow: POST`; choose one consistent tested result.

## Processing pipeline

The route order is security- and cost-sensitive:

```text
load config
  -> authenticate
  -> read bounded body
  -> parse exact JSON
  -> find/load template
  -> select variant
  -> normalize image inputs/assets
  -> resolve and validate full data
  -> invoke renderTemplateImage
  -> return PNG
```

Do not perform template lookup, include validation details, reserve browser
capacity, write a job, or make network requests before authentication succeeds.

## 1. Configuration

Call the Step 1 parser with an explicit environment record. Map configuration
failure to:

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

Configuration may be parsed once per stable server module if tests prove safe
under environment loading, but do not cache a failure across development env
changes without a reload.

## 2. Authentication

- Read `Authorization` once.
- Use the constant-time Bearer helper.
- On failure return `401`, `Cache-Control: no-store`, and a conventional
  `WWW-Authenticate: Bearer` header without extra diagnostics.
- Do not parse/log body before auth.
- Return the same auth result regardless of template slug.

## 3. Bounded body reader

Do not rely only on `Content-Length`:

1. If a finite declared length exceeds 12 MB, reject immediately.
2. Read `Request.body` chunks and count encoded bytes.
3. Cancel reading once the limit is exceeded.
4. Reject a missing body or invalid UTF-8/JSON as `invalid_request`.
5. Require `Content-Type` beginning with `application/json`, allowing a charset.
6. Do not accept compressed request bodies unless the deployment/server provides
   a separately bounded decompression contract.

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
- only `template`, `variant`, and `data` are allowed;
- `template` must be a non-empty exact slug string and satisfy the generated
  slug grammar;
- `variant`, when present, must be a non-empty string;
- `data`, when present, must be a plain object, not `null`/array/class value;
- reject prototype-sensitive keys such as `__proto__`, `prototype`, and
  `constructor` at every untrusted object boundary;
- do not trim field values or coerce runtime types;
- omission of `data` becomes an empty object.

Unknown data keys are rejected after the definition is loaded.

## 5. Registry and definition lookup

Use generated application imports:

```typescript
import { templates } from '@framekit/generated/templates'
```

Expected flow:

1. Find the exact `TemplateRegistryEntry` in `templates` for assets and metadata.
2. If absent, return `template_not_found` with `404`.
3. Load the definition through `entry.load()`.
4. Validate its default export with canonical runtime validation.
5. Treat an invalid project definition or loader failure as `render_failed`, not
   client field error, because the deployed project is broken.
6. Read trusted dimensions from the definition.
7. Select `request.variant ?? definition.variants.default`.
8. If selected variant is absent, return `invalid_request` with `400`.

Do not derive dimensions, title, or assets from request data.

## 6. Data and image normalization

Call the Step 2 pure helper with:

- loaded definition;
- selected variant;
- request data;
- generated entry asset manifest;
- configured exact image-host allowlist.

The helper returns ordinary edits plus a cloned temporary asset manifest. Then:

1. Resolve complete values with the canonical resolver.
2. Validate complete values through the current canonical data-validation
   boundary.
3. Return `422 invalid_template_data` and structured `fields` if invalid.
4. Build `NormalizedRenderPayload` with slug, selected variant, edits, temporary
   assets, and trusted dimensions.

Base64/signature/host failures map to their specific `413`, `415`, or `422`
codes before browser capacity is reserved.

## 7. Rendering and request cancellation

Call:

```typescript
const png = await renderTemplateImage({
  payload,
  config: config.render,
  signal: request.signal,
})
```

If the installed Next runtime exposes request abort reliably, propagate it so a
disconnected client closes browser work and deletes the job. Cleanup remains the
renderer responsibility, not route duplication.

An aborted request must not produce an unhandled rejection. It may map to an
internal cancellation result if the response can still be written; otherwise
only coarse operational logging is required.

## 8. Success response

Return the `Buffer` without base64 wrapping:

```http
200 OK
Content-Type: image/png
Content-Length: <buffer length>
Content-Disposition: inline; filename="<safe-slug>.png"
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

Filename rules:

- replace `/` with `-`, matching current Studio export;
- rely only on validated generated slug characters;
- quote safely;
- do not accept a caller-provided filename.

Do not return render ID/token, request echo, ETag, or cacheable headers.

## Error response shape

```typescript
interface ImageApiErrorResponse {
  error: ImageRenderErrorCode
  message: string
  fields?: Record<string, unknown>
}
```

Map semantic failures:

| Failure | HTTP | Additional behavior |
|---|---:|---|
| `invalid_request` | `400` | No browser work |
| `unauthorized` | `401` | `WWW-Authenticate: Bearer` |
| `template_not_found` | `404` | Only after auth |
| `request_too_large` | `413` | Stop/cancel body read |
| `unsupported_image` | `415` | No raw data in message |
| `invalid_template_data` | `422` | Include canonical `fields` |
| `image_host_not_allowed` | `422` | Do not echo full URL |
| `api_not_configured` | `503` | Generic config message |
| `render_capacity_exhausted` | `503` | Add bounded `Retry-After` |
| `render_timeout` | `504` | Cleanup already complete |
| `render_failed` | `500` | Generic public message; log coarse cause |

Every JSON error includes `Content-Type: application/json` and
`Cache-Control: no-store`.

## Thin adapter rule

The canonical template and `apps/studio` should differ only where they import
their generated registry or read deployment configuration. If the route grows
into duplicated parsing/mapping code, expose a server-package handler/helper
that accepts registry dependencies explicitly.

Do not create a Studio-only API contract.

## Abuse and rate behavior

- Authentication is mandatory but one shared key is not a rate limiter.
- Browser capacity returns `503` rather than accepting an unbounded queue.
- Deployment infrastructure may add IP/key rate limits outside this route.
- The application does not retry a failed render internally.
- The route does not cache PNGs because request data may be sensitive.
- Repeated identical requests each render independently initially.

## Logging

On completion, log only:

- generated internal render/request correlation ID if available;
- template slug;
- stable result code;
- coarse duration;
- output byte length on success.

Never log authorization, field data, data URLs, private token, temp path, or full
remote image URLs.

## Expected files

```text
packages/create-framekit/template/src/app/api/v1/images/route.ts
apps/studio/src/app/api/v1/images/route.ts
packages/framekit/src/server/request-body.ts
packages/framekit/src/server/request-body.test.ts
packages/framekit/src/server/http-errors.ts
```

Pure body/error helpers belong in the server package only if they prevent real
duplication and remain independent of a consumer registry.

## Implementation sequence

1. Add bounded request-body reading and exact parser tests.
2. Implement canonical template lookup/definition validation helper boundaries.
3. Implement the canonical template route adapter.
4. Wire config and authentication first in the request pipeline.
5. Wire Step 2 normalization and canonical data validation.
6. Invoke `renderTemplateImage` with abort propagation.
7. Add success and semantic error response mapping.
8. Add route-focused tests with mocked renderer and generated fixture registry.
9. Mirror the thin route in first-party Studio.

## Focused tests

- Missing/wrong auth returns `401` before body/registry/renderer access.
- Missing production config returns generic `503` without secret names/values.
- Content type, malformed JSON, null/array roots, unknown properties, dangerous
  keys, missing template, invalid data object, and encoded size are rejected.
- Unknown template returns `404` only after auth.
- Omitted variant uses declared default; unknown variant returns `400`.
- Loader/definition project failure returns generic `500`.
- Image/data normalization failures retain their documented status/code.
- Canonical field errors return `422` plus fields and do not call renderer.
- Capacity and timeout errors map to `503`/`504` and cleanup is not repeated by
  route code.
- Success returns exact PNG headers/body and safe filename.
- Request abort reaches renderer signal.
- No response/log snapshot contains secret request values.
- Template and Studio route adapters behave identically for the same fixture.

## Exit gate

Step 6 is complete when:

- the full authenticated endpoint contract works with a mocked browser renderer;
- all invalid/unauthorized input exits before browser work;
- success returns raw PNG bytes and stable headers;
- every semantic failure maps without message parsing;
- canonical template and Studio focused tests/typecheck/build pass.
