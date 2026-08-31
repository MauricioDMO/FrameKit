# Server Image Rendering API

- **Status:** Proposed; not yet implemented.
- **GitHub issue:** Not assigned.
- **Release:** No version preselected.
- **Target runtime:** One long-lived Node.js process per generated application container.
- **Primary package:** `@mauriciodmo/framekit`.
- **Canonical consumer:** `packages/create-framekit/template/`.

## Purpose of this plan

This directory is the implementation plan for an authenticated API that renders
FrameKit templates to PNG on the server.

A client sends a template slug, optional variant, and partial field data. The
public route authenticates the request, validates and resolves the template data,
materializes request-specific remote images through Node.js, stores the final
render payload in a short-lived in-memory job, opens a private Next.js render
page with Chromium, captures the exact template canvas through
`playwright-core`, deletes the job, and returns the PNG bytes in the same HTTP
response.

The first implementation intentionally targets one long-lived Node.js process per
container. Temporary jobs use a `globalThis`-backed `Map`; no filesystem,
database, Redis, queue, or object storage is required.

The phase documents are the source of truth for implementation details. This
README defines the cross-cutting contract and execution order.

## How to execute the plan

Implement the phases in order. A phase is complete only when its focused tests
and exit gate pass.

| Step | Plan | Main result | Depends on |
|---:|---|---|---|
| 1 | [Contracts and server boundary](./01-contracts-and-server-boundary.md) | Stable types, errors, configuration, package boundary, and auth contract | Current FrameKit baseline |
| 2 | [Shared canvas and image inputs](./02-shared-canvas-and-image-inputs.md) | One render canvas plus safe local/base64/remote image preparation | Step 1 |
| 3 | [Temporary render jobs](./03-temporary-render-jobs.md) | Authenticated, expiring `globalThis Map` handoff | Step 1 |
| 4 | [Browser lifecycle and capture](./04-browser-lifecycle-and-capture.md) | Shared Chromium, bounded contexts, loopback-only browser network, PNG capture | Steps 1-3 |
| 5 | [Private Next.js render route](./05-private-next-render-route.md) | Internal job-backed page that renders already-resolved data | Steps 2-4 |
| 6 | [Public image API route](./06-public-image-api-route.md) | Authenticated `POST /api/v1/images` returning PNG or structured JSON errors | Steps 1-5 |
| 7 | [Packaging and Docker](./07-packaging-and-docker.md) | Public server export, Playwright runtime, starter integration, and production image | Steps 1-6 |
| 8 | [Verification and rollout](./08-verification-and-rollout.md) | Unit/integration/browser/package/security gates and documentation rollout | Steps 1-7 |

Each step contains:

- its goal and dependencies;
- exact implementation responsibilities;
- expected files and symbols;
- implementation order;
- focused tests;
- an explicit exit gate.

## Objective

Add a production-ready synchronous PNG endpoint with this external behavior:

```http
POST /api/v1/images
Authorization: Bearer <FRAMEKIT_API_KEY>
Content-Type: application/json
```

```json
{
  "template": "social/instagram/post",
  "variant": "es",
  "data": {
    "title": "Nueva publicación",
    "hero": "https://images.example.com/hero.webp",
    "logo": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

A successful response is the generated image itself, not JSON and not base64:

```http
HTTP/1.1 200 OK
Content-Type: image/png
Content-Disposition: inline; filename="social-instagram-post.png"
Cache-Control: no-store
```

The endpoint does not expose a public render job. The internal job ID and token
exist only to connect the original API request with the private render-page
request made by Playwright.

## Current baseline

The implementation must evolve the current code rather than introduce a second
template model:

- `packages/framekit/src/editor/framekit-editor.tsx` resolves data and invokes
  `definition.render(...)` inside an exact-size wrapper used by Studio.
- `packages/framekit/src/editor/export-template.ts` exports PNG in the browser
  with `modern-screenshot` after `document.fonts.ready`.
- `packages/framekit/src/core/resolve-template-data.ts` applies defaults,
  variant content, edits, and matching image assets.
- `packages/framekit/src/dev/asset-upload.ts` already contains useful byte limits,
  strict base64 validation, raster MIME checks, and signature checks.
- generated `templates.ts` modules expose summaries, asset manifests, and lazy
  loaders through the `templates` registry.
- `packages/create-framekit/template/` is copied into generated consumers;
  `src/generated/framekit/` remains generated disposable output.
- the generated Next.js application already uses `output: 'standalone'` and
  `.framekit/next`.
- `framekit build` already copies `public` and Next static assets beside the
  discovered standalone server.
- the public package currently has no `./server` export, Playwright runtime,
  image API route, or production Dockerfile.

Studio's existing `modern-screenshot` export remains functional. The server API
is additive in the first implementation.

## Accepted architecture

### Ownership

| Concern | Owner | Why |
|---|---|---|
| Public request types, configuration, auth helpers, and stable render errors | `@mauriciodmo/framekit/server` | One reusable server contract |
| In-memory render-job store | `@mauriciodmo/framekit/server` | Public route and private page share one implementation |
| Browser singleton, capacity, context lifecycle, and capture | `@mauriciodmo/framekit/server` | Browser fixes ship with FrameKit |
| Image parsing, remote fetching, byte/signature validation | `@mauriciodmo/framekit/server` plus shared raster helper | Browser never needs external network access |
| Shared exact-size render canvas | `@mauriciodmo/framekit/editor` | Studio and server page use the same render boundary |
| Public App Router route | Generated application | Next.js routes belong to the consumer |
| Private render page | Generated application | It imports the consumer-generated template registry |
| API key and allowed image hosts | Generated application runtime environment | Secrets and deployment policy belong to the application |
| Dockerfile and `.dockerignore` | Generated application | Container construction is application-owned |
| First-party integration | `apps/studio` | Dogfood supported public imports and protocol |

### Package/application split

```text
Client
  -> POST /api/v1/images                       generated application
     -> auth + request parsing                 generated adapter + server helpers
     -> load template definition              generated registry
     -> prepare image inputs                   @mauriciodmo/framekit/server
        -> data URL validation
        -> root-relative validation
        -> allowlisted HTTPS fetch via Node.js
        -> remote image converted to data URL
     -> resolveTemplateData(...)               @mauriciodmo/framekit
     -> validateTemplateData(...)              @mauriciodmo/framekit
     -> renderTemplateImage(resolvedPayload)   @mauriciodmo/framekit/server
        -> globalThis Map job                  @mauriciodmo/framekit/server
        -> shared Chromium context             @mauriciodmo/framekit/server
        -> GET /__framekit/render/<id>         generated application
           -> loadRenderRequest(...)           @mauriciodmo/framekit/server
           -> generated template loader        generated application
           -> TemplateCanvas                   @mauriciodmo/framekit/editor
        -> locator.screenshot()                @mauriciodmo/framekit/server
     <- PNG Buffer
  <- image/png bytes
```

No generated application may import `packages/framekit/src/*`. Shared behavior
must cross supported package exports.

## End-to-end lifecycle

1. The public route loads validated configuration.
2. It authenticates the Bearer API key before parsing request data or revealing
   template details.
3. It reads the JSON body with an encoded byte limit.
4. It validates the exact top-level request shape.
5. It finds the template in the generated registry and loads its definition.
6. It chooses the requested variant or the declared default.
7. It prepares request-specific image inputs:
   - validated raster data URLs remain data URLs;
   - trusted root-relative project assets remain local URLs;
   - allowlisted HTTPS images are fetched by Node.js, bounded, signature-checked,
     and converted to canonical data URLs.
8. It clones the generated asset manifest and applies request image overrides
   without changing project files.
9. It runs the canonical `resolveTemplateData(...)` once.
10. It runs the canonical template-data validation once.
11. It creates a final `ResolvedRenderPayload` containing resolved data, prepared
    assets, variant, and trusted dimensions.
12. The renderer reserves one process-local render slot.
13. It creates a random internal job ID and independent private token.
14. It stores the final payload in a `globalThis`-backed `Map` with a short TTL.
15. It creates one isolated Chromium `BrowserContext` for the render.
16. Browser routing blocks external network access and injects the private token
    only into the exact private document request.
17. Chromium navigates to the fixed loopback render URL.
18. The private page authenticates the job ID/token and receives the already
    resolved payload.
19. The client render component loads the template definition, checks that the
    definition still matches the job dimensions/variant, and renders
    `TemplateCanvas` without resolving the data again.
20. The page exposes `ready` or `error` state.
21. Playwright waits for the page load, render state, fonts, and `<img>` decode.
22. It captures only `[data-framekit-render-root]` at device scale factor `1`.
23. It verifies the PNG bytes.
24. `finally` closes the context, deletes the in-memory job, and releases capacity.
25. The public route returns raw PNG bytes or a stable JSON error.

## Cross-cutting invariants

- The caller chooses a template slug, never an arbitrary page URL or HTML string.
- Public authentication happens before body parsing, template lookup, or remote
  image fetching.
- One shared API key is the initial public auth mechanism.
- Job ID and private token are generated independently.
- The private token is sent only to the exact private document request; it is not
  configured as a global browser/page header.
- Temporary jobs exist only in process memory and are never written to disk.
- The job store lives on `globalThis` under a package-specific symbol so separate
  bundled modules and development reloads share the same process state.
- One Node.js process per application container is part of the v1 support
  boundary. Multiprocess/serverless execution requires a different store.
- Remote user images are fetched by Node.js before browser work.
- Chromium is not allowed to access arbitrary external HTTP/HTTPS resources.
- Remote redirects are followed only through the same URL validation policy and
  a bounded redirect count.
- Remote response size is enforced while streaming, not only through
  `Content-Length`.
- Raster signatures are verified; SVG/HTML/XML and other active documents are
  not accepted as request image values.
- Request-specific image overrides never modify generated/project asset files.
- `resolveTemplateData(...)` and canonical data validation run once in the public
  route, before browser capacity is consumed.
- The private page renders the already-resolved payload and does not repeat the
  canonical resolution pipeline.
- Invalid input and remote-image failures occur before browser capacity is
  reserved whenever possible.
- Every render receives a fresh `BrowserContext`; cookies/storage are never
  reused across renders.
- A single Chromium process may be shared for the lifetime of the Node process.
- The browser has a bounded number of simultaneous render contexts and no
  in-process wait queue in v1.
- Success returns binary `image/png`, never a base64 JSON wrapper.
- Logs never contain API keys, private tokens, request field values, data URLs,
  or full signed remote URLs.

## Public HTTP summary

### Request

```typescript
interface ImageRenderRequest {
  template: string
  variant?: string
  data?: Record<string, unknown>
}
```

### Success

```http
200 OK
Content-Type: image/png
Content-Length: <bytes>
Content-Disposition: inline; filename="<safe-template-slug>.png"
Cache-Control: no-store
X-Content-Type-Options: nosniff
```

### Failure

```json
{
  "error": "invalid_template_data",
  "message": "Template data is invalid",
  "fields": {}
}
```

Only canonical field-validation errors may include `fields`.

## Stable error summary

| Code | HTTP | Meaning |
|---|---:|---|
| `invalid_request` | 400 | Malformed JSON, shape, variant, or unsupported input form |
| `unauthorized` | 401 | Missing or wrong Bearer token |
| `template_not_found` | 404 | Authenticated request references an unknown template |
| `request_too_large` | 413 | Request or decoded image exceeds a configured bound |
| `unsupported_image` | 415 | Raster MIME/signature is unsupported or inconsistent |
| `invalid_template_data` | 422 | Canonical template field validation failed |
| `image_host_not_allowed` | 422 | Remote image host is outside the exact allowlist |
| `image_fetch_failed` | 502 | An allowed remote image could not be fetched safely |
| `api_not_configured` | 503 | Required server configuration is unavailable |
| `render_capacity_exhausted` | 503 | Process-local render limit is full |
| `render_timeout` | 504 | End-to-end render deadline expired |
| `render_failed` | 500 | Unexpected template/browser/capture failure |

## Configuration summary

Initial environment surface:

```text
FRAMEKIT_API_KEY
FRAMEKIT_INTERNAL_ORIGIN
FRAMEKIT_ALLOWED_IMAGE_HOSTS
FRAMEKIT_MAX_CONCURRENT_RENDERS
FRAMEKIT_RENDER_TIMEOUT_MS
```

Rules:

- `FRAMEKIT_API_KEY` is required in production.
- `FRAMEKIT_INTERNAL_ORIGIN` is loopback-only, normally
  `http://127.0.0.1:3000` in Docker.
- `FRAMEKIT_ALLOWED_IMAGE_HOSTS` is a comma-separated exact-host allowlist used
  only by the Node.js remote-image fetcher.
- an empty host allowlist disables remote HTTPS image overrides.
- production Chromium is always headless in v1.

## Initial resource limits

- 12 MB maximum encoded public request body;
- 8 MB maximum decoded bytes per request-specific image;
- two simultaneous render contexts per Node.js process;
- 30 seconds end-to-end render deadline;
- two-minute in-memory job TTL as a cleanup backstop;
- bounded remote redirects, initially 3;
- one PNG at declared template dimensions and device scale factor `1`.

The job store is expected to remain tiny because jobs are created only for active
renders and deleted in `finally`.

## Target file map

```text
packages/framekit/src/
  server.ts
  server/
    browser.ts
    config.ts
    errors.ts
    image-input.ts
    render-image.ts
    render-job.ts
    request-body.ts
  shared/
    raster-image.ts
  editor/components/
    template-canvas.tsx

packages/create-framekit/template/
  Dockerfile
  .dockerignore
  src/app/api/v1/images/route.ts
  src/app/__framekit/render/[id]/page.tsx
  src/app/__framekit/render/[id]/render-client.tsx

apps/studio/
  src/app/api/v1/images/route.ts
  src/app/__framekit/render/[id]/page.tsx
  src/app/__framekit/render/[id]/render-client.tsx
```

Focused tests live beside their owning modules. Generated files under
`src/generated/framekit/` are regenerated, never hand-edited.

## Execution rules

- Keep changes in the smallest owning layer.
- Route adapters must not duplicate browser, image-fetch, or job-store logic.
- Use `globalThis + Symbol.for(...)` for both render-job and browser process state.
- Keep the render-job API storage-agnostic enough that a future Redis/filesystem
  implementation can replace the `Map` without changing public/private routes.
- Complete focused tests with each step instead of deferring them to Step 8.
- After Step 5, run a production Next.js build/start smoke proving that the public
  route and private page see the same global job store before continuing.
- Do not add a database, Redis, queue, public job endpoint, or object storage to
  the first implementation.
- Do not allow Chromium external network access to support remote image fields;
  Node.js owns those fetches.
- Do not add output formats/options before synchronous PNG works in an isolated
  generated consumer.
- After package manifest changes, update the lockfile and run package/repository
  build checks.
- Validate packed packages and a consumer outside the workspace before calling
  the feature complete.

## Global completion criteria

The feature is complete when:

- an authenticated request renders any valid generated-registry template and
  returns PNG bytes in one response;
- omitted fields preserve existing defaults/content/assets;
- valid base64 and allowed HTTPS image overrides render correctly;
- allowed HTTPS images are fetched by Node.js and Chromium performs no external
  request for them;
- invalid/unauthorized requests do not consume browser capacity;
- remote image failures occur before browser capture;
- private job data is inaccessible without both ID and token;
- route/page modules share one `globalThis` job store in production standalone;
- successful, failed, aborted, and timed-out renders remove their Map job;
- browser startup is shared and render contexts are isolated/bounded;
- Chromium top-level navigation is fixed to the loopback render page and all
  unexpected external browser requests are blocked;
- the private token is never sent to assets, API routes, or remote hosts;
- final Docker runs standalone Next.js and matching Chromium as non-root under
  `tini`;
- package tarballs work in an isolated creator-generated project;
- Studio's existing browser export/copy behavior still works;
- English/Spanish docs, changelog, migration notes, and package exports match the
  shipped behavior;
- every phase exit gate passes.

## Out of scope

- public asynchronous jobs, polling, callbacks, queues, or webhooks;
- Redis, database persistence, filesystem render jobs, object storage, or
  generated-image URLs;
- multiple Node.js application processes sharing one render store;
- serverless/Edge deployment;
- multiple API keys, accounts, scopes, quotas, billing, or public rendering;
- arbitrary URL screenshotting, scraping, crawling, caller HTML, or caller CSS;
- browser access to arbitrary external resources;
- remote fonts/stylesheets in templates; package them with the application for
  the initial server-rendering path;
- wildcard image-host allowlists or IP-literal remote images;
- SVG or other active uploaded/request image documents;
- JPEG/WebP/PDF output, scale/DPI, quality, crop, or transparency controls;
- Firefox/WebKit/browser selection;
- replacing Studio's current `modern-screenshot` export;
- pixel-identical cross-platform visual regression guarantees.
