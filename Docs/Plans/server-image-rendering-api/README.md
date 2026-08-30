# Server Image Rendering API

- **Status:** Proposed; not yet implemented.
- **GitHub issue:** Not assigned.
- **Release:** No version preselected.
- **Target runtime:** Long-lived Node.js process in the generated Docker image.
- **Primary package:** `@mauriciodmo/framekit`.
- **Canonical consumer:** `packages/create-framekit/template/`.

## Purpose of this plan

This directory is the implementation plan for an authenticated API that renders
a FrameKit template to PNG on the server. A client sends a template slug,
variant, and partial field data. The server validates the request, stores a
short-lived render record, opens a private Next.js render page with Chromium,
captures the exact template canvas through `playwright-core`, deletes the
temporary data, and returns the PNG in the same HTTP response.

The plan is split into ordered phases so each layer can be implemented and
verified before the next layer depends on it. The phase documents are the source
of truth for implementation details. This README defines the cross-cutting
contract and execution order.

## How to execute the plan

Implement the phases in order. A phase is complete only when its focused tests
and exit gate pass. Do not start Docker or end-to-end work while the package,
job-store, and browser contracts are still changing.

| Step | Plan | Main result | Depends on |
|---:|---|---|---|
| 1 | [Contracts and server boundary](./01-contracts-and-server-boundary.md) | Stable types, errors, configuration, package boundary, and HTTP contract | Current FrameKit baseline |
| 2 | [Shared canvas and image inputs](./02-shared-canvas-and-image-inputs.md) | One render canvas plus safe asset/base64/URL normalization | Step 1 |
| 3 | [Temporary render jobs](./03-temporary-render-jobs.md) | Authenticated, expiring, owner-only filesystem job protocol | Step 1 |
| 4 | [Browser lifecycle and capture](./04-browser-lifecycle-and-capture.md) | Shared Chromium process, bounded contexts, safe navigation, PNG capture | Steps 1-3 |
| 5 | [Private Next.js render route](./05-private-next-render-route.md) | Internal job-backed page that renders only the template canvas | Steps 2-4 |
| 6 | [Public image API route](./06-public-image-api-route.md) | Authenticated `POST /api/v1/images` returning PNG or structured JSON errors | Steps 1-5 |
| 7 | [Packaging and Docker](./07-packaging-and-docker.md) | Public server export, dependencies, starter integration, and production image | Steps 1-6 |
| 8 | [Verification and rollout](./08-verification-and-rollout.md) | Unit/integration/browser/package gates and documentation rollout | Steps 1-7 |

Each step document contains:

- its objective and non-goals;
- exact implementation responsibilities;
- expected files and public/internal symbols;
- ordering within the step;
- failure and cleanup behavior;
- focused test cases;
- an explicit completion gate.

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

A successful response is the generated image itself:

```http
HTTP/1.1 200 OK
Content-Type: image/png
Content-Disposition: inline; filename="social-instagram-post.png"
Cache-Control: no-store
```

The endpoint does not return a public job ID. The ID exists only to connect the
original API request with one private render-page request made by Playwright.

## Current baseline

The implementation must evolve the current code rather than introduce a second
template model:

- `packages/framekit/src/editor/framekit-editor.tsx` resolves data and invokes
  `definition.render(...)` inside an exact-size wrapper used by Studio.
- `packages/framekit/src/editor/export-template.ts` exports PNG entirely in the
  browser with `modern-screenshot` after `document.fonts.ready`.
- `packages/framekit/src/core/resolve-template-data.ts` applies defaults,
  variant content, edits, and finally matching image assets.
- `packages/framekit/src/dev/asset-upload.ts` already has byte limits, raster
  MIME checks, base64 validation, and signature checks worth reusing.
- generated `templates.ts` modules expose canonical summaries, asset manifests,
  and lazy loaders through the `templates` registry.
- `packages/create-framekit/template/` is copied into each generated consumer;
  generated files under `src/generated/framekit/` remain disposable output.
- `packages/create-framekit/template/next.config.ts` uses
  `output: 'standalone'` and `.framekit/next`.
- `packages/framekit/src/cli/production.ts` copies `public` and Next static
  assets beside the discovered standalone server.
- the public package currently has no `./server` export, no Playwright runtime,
  no image API route, and no production Dockerfile.

The existing Studio `modern-screenshot` flow stays functional. The server API is
an additive path, not a replacement in the first implementation.

## Accepted architecture

### Ownership

| Concern | Owner | Why |
|---|---|---|
| Public request/response types and stable render errors | `@mauriciodmo/framekit/server` | One contract for starter and first-party Studio |
| Browser singleton and context lifecycle | `@mauriciodmo/framekit/server` | Browser fixes must ship with library updates |
| Temporary render job protocol | `@mauriciodmo/framekit/server` | API and private route need one safe storage implementation |
| Image-source validation and normalization | `@mauriciodmo/framekit/server` plus shared raster helper | Avoid divergent security rules |
| Shared exact-size render canvas | `@mauriciodmo/framekit/editor` | Browser and Studio must invoke the same template boundary |
| Public App Router route | Generated application | Next.js discovers routes from the consumer project |
| Private render page | Generated application | It must import the consumer-generated template registry |
| API key and deployment environment | Generated application | Secrets belong to the deployment |
| Dockerfile and `.dockerignore` | Generated application | Container construction is application-owned |
| First-party integration | `apps/studio` | Dogfood supported public imports and protocol |

### Package/application split

The library can contain browser and rendering behavior, but it cannot insert App
Router files into a consuming Next.js application. The generated application
therefore contains thin adapters:

```text
Client
  -> POST /api/v1/images                     generated application
     -> request/auth/template validation     generated adapter + server helpers
     -> renderTemplateImage(...)             @mauriciodmo/framekit/server
        -> temporary job file                @mauriciodmo/framekit/server
        -> Chromium context                  @mauriciodmo/framekit/server
        -> GET /__framekit/render/<id>        generated application
           -> loadRenderRequest(...)         @mauriciodmo/framekit/server
           -> generated templates registry    generated application
           -> shared TemplateCanvas          @mauriciodmo/framekit/editor
        -> locator.screenshot()              @mauriciodmo/framekit/server
     <- PNG Buffer
  <- image/png
```

No generated application may import `packages/framekit/src/*`. All shared
behavior crosses a supported package export.

## End-to-end lifecycle

1. The public route loads and validates server configuration.
2. It checks `Authorization` before revealing template or validation details.
3. It reads the request body with an incremental byte limit.
4. It validates the exact top-level JSON shape.
5. It finds the template in the generated registry and loads its definition.
6. It selects the requested variant or `definition.variants.default`.
7. It validates ordinary field values against the loaded definition.
8. It validates image data URLs and allowlisted HTTPS image URLs.
9. It clones the template asset manifest and installs image overrides into that
   temporary manifest without changing project files.
10. It resolves and validates the complete render data before browser work.
11. The server package reserves one render-capacity slot.
12. It creates a random job ID and independent private token.
13. It writes the serializable job atomically below the FrameKit temp directory.
14. It creates a new isolated browser context with the token in an internal
    request header.
15. It installs network restrictions before navigation.
16. Chromium navigates to the fixed loopback private render URL.
17. The private server page authenticates and loads the temporary job.
18. The private client component loads the generated template module.
19. It resolves the job payload through the canonical FrameKit runtime and
    renders the shared exact-size canvas.
20. It exposes either a ready marker or a machine-readable error marker.
21. Playwright waits for the marker, fonts, and image decoding.
22. Playwright captures only the template element at device scale factor `1`.
23. The server verifies the PNG signature.
24. A `finally` path closes the context, releases capacity, and deletes the job.
25. The public route returns PNG bytes or maps a known failure to stable JSON.

## Cross-cutting invariants

These rules apply to every phase and are not implementation suggestions:

- The caller chooses a template slug, not an arbitrary page URL.
- Chromium's top-level navigation target is always the configured loopback
  FrameKit route.
- Authentication happens before template lookup and request-specific errors.
- Invalid input is rejected before reserving browser capacity whenever possible.
- Template defaults, variant content, and current common/variant image precedence
  remain canonical.
- A request-specific image override never writes into `src/templates` or
  `public`; it exists only in the temporary render payload.
- Template code/functions are never serialized to disk.
- Every request receives a fresh browser context and page.
- Browser startup may be shared, but page state, cookies, storage, headers, and
  temporary data are isolated by request.
- Capacity is bounded; there is no unbounded in-process render queue.
- Job deletion, context close, and capacity release are idempotent cleanup.
- Private job IDs and tokens are independent cryptographic values.
- Private routes return the same not-found behavior for missing, expired, and
  unauthorized jobs.
- PNG output is captured at the template's declared CSS dimensions and scale
  `1`; callers cannot override dimensions or scale initially.
- Server-only modules never leak through `.`, `./editor`, `./studio`, or other
  client-compatible exports.
- API keys, authorization headers, field data, data URLs, private tokens, and
  full remote URLs are never logged.
- The implementation target is a long-lived Node.js process, not Edge or
  serverless execution.

## Public HTTP summary

The complete route contract is implemented in
[Step 6](./06-public-image-api-route.md). The stable summary is:

| Property | Required | Meaning |
|---|---:|---|
| `template` | Yes | Exact generated-registry slug |
| `variant` | No | Exact content key; omitted means declared default |
| `data` | No | Plain object of partial canonical field overrides |

Unknown properties and unknown field keys fail. The API does not coerce values
into field runtime types.

Initial image sources:

- an existing generated template asset when the API field is omitted;
- a trusted project root-relative asset in an accepted asset namespace;
- `data:image/png;base64,...`;
- `data:image/jpeg;base64,...`;
- `data:image/webp;base64,...`;
- `data:image/gif;base64,...`;
- an `https:` URL whose exact hostname is configured in the allowlist.

Initial output is PNG only.

## Stable error summary

All failures before PNG output return JSON with a stable code and diagnostic
message. Field validation may add a `fields` object.

| Status | Code | Meaning |
|---:|---|---|
| `400` | `invalid_request` | Malformed JSON, exact-shape failure, wrong value type, or invalid variant |
| `401` | `unauthorized` | Missing or incorrect Bearer token |
| `404` | `template_not_found` | No exact template slug |
| `413` | `request_too_large` | Encoded body or decoded image exceeds limits |
| `415` | `unsupported_image` | Unsupported MIME, base64, or signature |
| `422` | `invalid_template_data` | Canonical field validation failed |
| `422` | `image_host_not_allowed` | Remote image host is outside the allowlist |
| `503` | `api_not_configured` | Required server configuration is missing or invalid |
| `503` | `render_capacity_exhausted` | No browser-context slot is available |
| `504` | `render_timeout` | Private rendering did not become capture-ready in time |
| `500` | `render_failed` | Browser, page, asset, or screenshot failure not caused by client input |

Authentication failures do not reveal whether a template exists. Capacity
failures include `Retry-After`.

## Configuration summary

Detailed parsing and ownership are defined in Steps 1, 4, 6, and 7.

| Variable | Required | Initial behavior |
|---|---:|---|
| `FRAMEKIT_API_KEY` | Production | Bearer key for the public endpoint |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | No | Comma-separated exact HTTPS hostnames; empty rejects remote URLs |
| `FRAMEKIT_INTERNAL_ORIGIN` | Production | Loopback origin, normally `http://127.0.0.1:3000` |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | No | Positive bounded integer, default `2` |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | No | Positive bounded integer, default `30000` |
| `FRAMEKIT_BROWSER_HEADLESS` | No | Defaults to `true`; production rejects `false` |
| `FRAMEKIT_BROWSER_SLOW_MO_MS` | No | Defaults to `0`; local diagnosis only |

Production accepts only a loopback internal origin. Secrets are injected at
runtime and never baked into Docker layers.

## Initial resource limits

- 12 MB maximum encoded request body;
- 8 MB maximum decoded bytes per base64 image;
- two concurrent render contexts per Node.js process;
- 30 seconds end-to-end per render;
- 15 minutes before a leaked context is force-closed as a backstop;
- 30 minutes before an idle browser is closed;
- two minutes before an unconsumed temporary job expires;
- one PNG at declared template dimensions and device scale factor `1`.

The HTTP body limit is enforced while streaming, not only through
`Content-Length`. The request timeout is independent from context and browser
idle cleanup.

## Target file map

The phase plans may refine names while preserving these boundaries.

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
  editor/components/template-canvas.tsx

packages/create-framekit/template/
  Dockerfile
  .dockerignore
  src/instrumentation.ts
  src/app/api/v1/images/route.ts
  src/app/__framekit/render/[id]/page.tsx
  src/app/__framekit/render/[id]/render-client.tsx

apps/studio/
  src/instrumentation.ts
  src/app/api/v1/images/route.ts
  src/app/__framekit/render/[id]/page.tsx
  src/app/__framekit/render/[id]/render-client.tsx
```

Focused test files live beside their owning modules. Generated files under
`src/generated/framekit/` are regenerated, never hand-edited.

## Execution rules

- Keep changes in the smallest owning layer; route adapters must not duplicate
  browser or job-store logic.
- Complete focused tests with each step instead of deferring all tests to Step 8.
- Do not add Redis, a database, object storage, or a queue to make the temporary
  protocol more generic.
- Do not expose browser/context primitives publicly unless a concrete consumer
  requires them.
- Do not add output options before the synchronous PNG contract works in the
  isolated generated consumer.
- After any `package.json` change, run root `pnpm install` and then `pnpm build`.
- Build `@mauriciodmo/framekit` before Studio or generated-consumer verification.
- Validate public tarballs and a consumer outside the workspace before calling
  the plan complete.

## Global completion criteria

The overall feature is complete when:

- an authenticated request renders any valid generated-registry template and
  returns PNG bytes in one response;
- omitted fields preserve existing defaults, content, and image assets;
- validated base64 images and exact-host allowlisted HTTPS images render;
- invalid and unauthorized requests do not consume browser capacity;
- private render data is inaccessible without both job ID and private token;
- temporary data is owner-only, expiring, and deleted on success and failure;
- browser startup is shared, contexts are isolated and bounded, and shutdown is
  graceful;
- Playwright cannot navigate to a caller-provided page or unexpected host;
- the Docker image installs only Chromium headless shell and runs the standalone
  server as non-root under `tini`;
- package tarballs work in an isolated creator-generated project through build,
  start, API request, and browser capture;
- Studio's current browser download/copy behavior remains functional;
- English/Spanish docs, package exports, migration note, changelog, and
  repository instructions match the shipped behavior;
- every phase exit gate in this directory is checked.

## Out of scope

- asynchronous public jobs, polling, callbacks, or queues;
- Redis, database persistence, Prisma, object storage, or generated-image URLs;
- multiple API keys, accounts, key records, per-client quotas, or billing;
- public unauthenticated rendering;
- arbitrary URL screenshotting, scraping, crawling, or client-provided HTML;
- wildcard host allowlists or automatic trust of arbitrary HTTPS destinations;
- SVG data URLs or other active uploaded documents;
- JPEG, WebP, PDF, scale/DPI, quality, crop, or transparency output controls;
- Firefox, WebKit, or browser selection;
- replacing `modern-screenshot` in Studio's current export path;
- serverless or Edge support;
- shared temporary storage across containers;
- an npm-specific production Dockerfile in the first implementation;
- pixel-perfect cross-platform visual regression testing.
