# Server Image Rendering API

- **Status:** Steps 0.5 and 0.6, and Steps 1-6, implemented and verified on 2026-09-10; Step 7 implemented and verified on 2026-09-11; Step 8 is pending.
- **GitHub issue:** Not assigned.
- **Release:** No version preselected.
- **Target runtime:** One long-lived Node.js process per generated application container.
- **Primary package:** `@mauriciodmo/framekit`.
- **Canonical consumer:** `packages/create-framekit/template/`.

The current supported package facades are `.`, `./client`, `./editor`, `./studio`,
`./studio/root`, `./dev`, `./server`, `./next`, and `./styles.css`. The `./server`
facade currently exports the Steps 1-5 contracts, errors, configuration parser,
Bearer authentication helper, image-input preparation API, temporary render jobs,
PNG browser renderer, and Step 0.5 `createRenderPage`. The `./client` factory and
the Step 0.6 configuration-only `./next` facade (`withFrameKit`) also exist. Step
6 adds `createImageHandler` to `./server`. This plan does not propose `server/*`,
`browser`, `auth`, or `shared` public subpaths.

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

Verify the completed Step 0.5 and Step 0.6 gates before continuing to Step 6.
Steps 1 through 5 are complete in the current checkout. The two cross-cutting
steps preserve the render protocol while moving reusable behavior and registry
binding out of maintained consumer files. Source presence alone does not
establish that a phase's focused tests and exit gate pass.

The `0.5` and `0.6` numbers mark cross-cutting boundaries; in the current checkout
their gates run after Step 5 and before Step 6.

| Step | Plan | Main result | Depends on |
|---:|---|---|---|
| 0.5 | Package client/server boundaries | Reusable private-page behavior, a dedicated client entry, and thin consumer route adapters | Current Steps 1-5 implementation |
| 0.6 | [Minimal consumer integration](./00.6-minimal-consumer-integration.md) | Next config preset, generated client bindings, and one editor/brand route; four maintained app files before Step 6 | Step 0.5 gate |
| 1 | [Contracts and server boundary](./01-contracts-and-server-boundary.md) | Stable types, errors, configuration, package boundary, and auth contract | Current FrameKit baseline |
| 2 | [Shared canvas and image inputs](./02-shared-canvas-and-image-inputs.md) | One render canvas plus safe local/base64/remote image preparation | Step 1 |
| 3 | [Temporary render jobs](./03-temporary-render-jobs.md) | Authenticated, expiring `globalThis Map` handoff | Step 1 |
| 4 | [Browser lifecycle and capture](./04-browser-lifecycle-and-capture.md) | Shared Chromium, bounded contexts, loopback-only browser network, PNG capture | Steps 1-3 |
| 5 | [Private Next.js render route](./05-private-next-render-route.md) | Internal job-backed page that renders already-resolved data | Steps 2-4 |
| 6 | [Public image API route](./06-public-image-api-route.md) | Package-owned `createImageHandler(templates)` and a thin authenticated PNG route | Steps 0.5-0.6 and 1-5 |
| 7 | [Packaging and Docker](./07-packaging-and-docker.md) | FrameKit-owned browser installation/versioning, minimal starter distribution, and production image | Steps 0.5-0.6 and 1-6 |
| 8 | [Verification and rollout](./08-verification-and-rollout.md) | Unit/integration/browser/package/security gates and documentation rollout | Steps 0.5-0.6 and 1-7 |

## Step 0.5 - Package Client/Server Boundaries

The extraction described here is already present in source. Retain its exit
checks; Step 0.6 subsequently replaces the local client binding shown below with
generated output. The final starter shape is defined by Step 0.6.

### Goal

Move the reusable private-render implementation into `@mauriciodmo/framekit`
without pretending that a published package owns the consumer's Next.js route or
generated template registry. This is a packaging and ownership refactor of Step 5,
not a change to the private render protocol.

### Depends on

- Step 5's working private render page and client lifecycle.
- The generated `TemplateRegistryEntry[]` contract and lazy template loaders.
- The existing `./editor` and `./server` package facades.

### Deliverables

- A dedicated `@mauriciodmo/framekit/client` entry whose source entry is marked
  with `'use client'` and exports `createRenderClient(templates)`.
- The complete template-load, definition-check, readiness, error-boundary, and
  `TemplateCanvas` lifecycle moved into the package client entry.
- A `createRenderPage(RenderClient)` helper exported from the existing
  `@mauriciodmo/framekit/server` facade. It owns parameter/header lookup,
  `loadRenderRequest`, and uniform `notFound()` handling.
- A `client` entry in `tsdown.config.ts` and a matching `./client` condition in
  `packages/framekit/package.json`.
- Thin route adapters in the canonical generated consumer and `apps/studio`.
- Package, route, generated-consumer, and distribution checks for the new boundary.

### Boundary rules

The package client entry must not import `next/headers`, `next/navigation`, Node
built-ins, Playwright, or the server runtime at execution time. Server-related
types may only be referenced as erased type imports, or should be moved to a
client-safe shared type if the emitted declarations require it.

The generated `templates` registry remains owned by the consumer. Its `load()`
functions point to consumer-local template modules and cannot be passed from a
Server Component to a Client Component as ordinary props. The client API therefore
uses a factory that closes over the registry in a consumer-local client boundary:

```tsx
'use client'

import { createRenderClient } from '@mauriciodmo/framekit/client'
import { templates } from '@framekit/generated/templates'

export const RenderClient = createRenderClient(templates)
```

The local `src/app/framekit/render/[id]/page.tsx` remains required because Next.js
discovers routes from the consumer's `app` tree. It retains the static route
configuration and metadata, then delegates the server behavior to
`createRenderPage(RenderClient)`. The package does not ship a route file that Next
would discover from `node_modules`.

### Expected source shape

```text
packages/framekit/src/
  client/
    index.ts                         # 'use client' entry
    render-client.tsx                # createRenderClient()
  server/
    render-page.tsx                  # createRenderPage()

packages/create-framekit/template/src/app/framekit/render/[id]/
  page.tsx                           # local Next route/config adapter
  render-client.tsx                  # local registry binding

apps/studio/src/app/framekit/render/[id]/
  page.tsx                           # local Next route/config adapter
  render-client.tsx                  # local registry binding
```

### Tests and checks

- Move the render-client behavior coverage from `apps/studio` to the package
  client implementation while preserving loading, ready, mismatch, loader,
  validation, and render-error cases.
- Test `createRenderPage` with missing, malformed, expired, and wrong-token jobs,
  plus the valid resolved-payload handoff.
- Add a type fixture for `@mauriciodmo/framekit/client` and its factory signature.
- Build the package and assert that `dist/client.js` preserves `'use client'`.
- Confirm the client artifact has no runtime import of `next/headers`, Node
  built-ins, Playwright, or the server renderer.
- Build the canonical generated consumer and first-party Studio with the thin
  adapters and generated registry.
- Pack the public package and verify that `.`, `./client`, and `./server` resolve
  with their declarations.

### Implementation order

1. Extract the client lifecycle into the package client entry and preserve the
   existing DOM/error protocol.
2. Extract the private server-page handoff into `createRenderPage`.
3. Add the `./client` build/export boundary and verify the emitted directive.
4. Replace duplicated consumer and Studio implementations with thin adapters.
5. Move focused tests to their owning package and retain route integration checks.
6. Build, pack, and run the generated-consumer smoke before continuing to Step 6.

### Exit gate

Step 0.5 is complete when the package exposes a working `./client` entry with a
preserved `'use client'` directive, the `./server` page helper handles the same
private token contract, both consumers contain only route/registry wiring, and
package, Studio, generated-consumer, typecheck, build, and packed-export checks
pass.

## Step 0.6 - Minimal Consumer Integration

See [the implementation phase](./00.6-minimal-consumer-integration.md). After Step
6, the final starter is expected to have five maintained files under `src/app`.
The pre-migration baseline was seven maintained files (the previous full-feature
plan described eight); the verified current pre-Step-6 result is four maintained
`src/app` files. The five-file post-Step-6 target is:

- one `[section]/[[...slug]]/page.tsx` serving `/editor` and `/brand`;
- one private render page and one public API route;
- the application layout and global CSS.

`withFrameKit` in the implemented `./next` facade owns standard Next settings and
the root redirect. Step 0.6 extends existing codegen to emit separate Studio/render
client bindings under ignored `src/generated/framekit/`. The package owns
behavior; the consumer retains ordinary Next route files, project styling,
templates, and deployment configuration. No hidden generated Next application is
introduced.

## Step 2 verification

Step 2 was implemented and verified on 2026-09-07. The available package checks
passed:

- `pnpm --filter @mauriciodmo/framekit test -- --testTimeout=15000`: 56 test files, 601 tests.
- `pnpm --filter @mauriciodmo/framekit typecheck`.
- `pnpm --filter @mauriciodmo/framekit build`.

## Step 3 verification

Step 3 was implemented and verified on 2026-09-07. The temporary render-job
store and package checks passed:

- `pnpm --filter @mauriciodmo/framekit test -- render-job`: 57 test files, 606 tests.
- `pnpm --filter @mauriciodmo/framekit typecheck`.
- `pnpm --filter @mauriciodmo/framekit build`.

The implementation provides the process-global `Map` handoff through the
`@mauriciodmo/framekit/server` facade, with independent cryptographic job IDs
and tokens, timing-safe token checks, 120-second expiry, opportunistic cleanup,
bounded collision retries, and idempotent deletion. No filesystem or external
persistent store was introduced.

## Step 4 verification

Step 4 was implemented and verified on 2026-09-07. The browser lifecycle,
capacity, routing, capture, and cleanup checks passed:

- `pnpm --filter @mauriciodmo/framekit exec vitest run src/server/__tests__/browser.test.ts src/server/__tests__/render-image.test.ts --testTimeout=15000`: 2 test files, 20 tests.
- `pnpm --filter @mauriciodmo/framekit test -- --testTimeout=15000`: 59 test files, 626 tests.
- `pnpm --filter @mauriciodmo/framekit typecheck`.
- `pnpm --filter @mauriciodmo/framekit build`.
- `pnpm install --frozen-lockfile` completed without a Chromium download.

The implementation shares Chromium through `globalThis`, bounds isolated render
contexts, restricts browser traffic to the configured internal origin and data
resources, scopes the private token to the exact render-document request, waits
for render readiness/fonts/images, captures and verifies PNG bytes, and cleans
up context, jobs, and capacity on success, failure, timeout, or abort. Real
Chromium validation remains a later integration gate.

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
- `packages/framekit/src/editor/export/export-template.ts` exports PNG in the browser
  with `modern-screenshot` after `document.fonts.ready`.
- `packages/framekit/src/core/template-data/resolve-template-data.ts` applies defaults,
  variant content, edits, and matching image assets.
- `packages/framekit/src/tooling/dev/asset-upload.ts` already contains useful byte limits,
  strict base64 validation, raster MIME checks, and signature checks.
- generated `templates.ts` modules expose summaries, asset manifests, and lazy
  loaders through the `templates` registry.
- `packages/create-framekit/template/` is copied into generated consumers;
  `src/generated/framekit/` remains generated disposable output.
- the generated Next.js application already uses `output: 'standalone'` and
  `.framekit/next`.
- `framekit build` already copies `public` and Next static assets beside the
  discovered standalone server.
- Server Image Rendering remains incomplete: the public package now includes the
  Steps 1-6 contracts, jobs, browser/capture runtime, private-page integration,
  and public image API route; Step 7 also adds the browser installer and
  production Dockerfile, while Step 8's final rollout verification remains.

Studio's existing `modern-screenshot` export remains functional. The server API
is additive in the first implementation.

## Accepted architecture

### Ownership

| Concern | Owner | Why |
|---|---|---|
| Public request types, configuration, auth helpers, and stable render errors | `@mauriciodmo/framekit/server` (Step 1) | One reusable server contract |
| In-memory render-job store | `@mauriciodmo/framekit/server` (Step 3) | Public route and private page share one implementation |
| Browser singleton, capacity, context lifecycle, and capture | `@mauriciodmo/framekit/server` (Step 4) | Browser fixes ship with FrameKit |
| Image parsing, remote fetching, byte/signature validation | `@mauriciodmo/framekit/server` (Step 2) plus shared raster helper | Browser never needs external network access |
| Shared exact-size render canvas | `@mauriciodmo/framekit/editor` | Studio and server page use the same render boundary |
| Private client render lifecycle | `@mauriciodmo/framekit/client` (Step 0.5) | Client behavior ships once and remains separate from Node/server code |
| Private page handoff behavior | `@mauriciodmo/framekit/server` (Step 0.5) | Header/job lookup is shared without moving the Next route convention |
| Public HTTP pipeline and response mapping | `@mauriciodmo/framekit/server` (Step 6) | `createImageHandler(templates)` owns auth, parsing, preparation, cancellation, and PNG/errors |
| Public App Router route adapter | Generated application | Exports static route config and the package-created `POST` handler |
| Private render route shell and static config | Generated application | Next.js discovers routes from the consumer `app` tree |
| Studio/private client registry bindings | Package codegen, emitted inside each consumer (Step 0.6) | Lazy loaders remain consumer-local without maintained wrapper files |
| Studio section validation | `@mauriciodmo/framekit/studio/root` (Step 0.6) | One page adapter accepts only editor/brand sections |
| Standard Next config and root redirect | `@mauriciodmo/framekit/next` (Step 0.6) | One configuration-time facade, free of request/browser dependencies |
| Browser revision and explicit installation command | FrameKit package and CLI (Step 7) | Consumers do not synchronize a direct Playwright dependency |
| API key and allowed image hosts | Generated application runtime environment | Secrets and deployment policy belong to the application |
| Dockerfile and `.dockerignore` | Generated application | Container construction is application-owned |
| First-party integration | `apps/studio` | Dogfood supported public imports and protocol |

### Package/application split

```text
Client
  -> POST /api/v1/images                       generated application
     -> createImageHandler(templates)           @mauriciodmo/framekit/server
     -> auth + bounded request parsing          package-owned handler
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
        -> GET /framekit/render/<id>             generated route shell
           -> createRenderPage(...)              @mauriciodmo/framekit/server
           -> generated render-client binding    consumer-local codegen output
           -> createRenderClient(templates)      @mauriciodmo/framekit/client
           -> generated template loader          generated application
           -> TemplateCanvas                     @mauriciodmo/framekit/editor
        -> locator.screenshot()                @mauriciodmo/framekit/server
     <- PNG Buffer
  <- image/png bytes
```

No generated application may import `packages/framekit/src/*`. Shared behavior
must cross supported package exports.

The FrameKit package owns the full reusable HTTP/rendering behavior, client render
lifecycle, generated bindings, standard Next config, and browser-install command.
The generated application and `apps/studio` own their Next.js route files and
static route configuration. Registries/bindings are generated inside each
consumer, while route files must not move into `packages/framekit/src/server/`. Keep
`packages/create-framekit/src/` small and limited to scaffolding concerns; do not
add `services/`, `utils/`, `lib/`, or `commands/` layers.

## End-to-end lifecycle

Step 6 implements Steps 1-11 and the final HTTP response once inside the package's
`createImageHandler`, rather than copying them into consumer route adapters. The
following lifecycle is the implemented target design; final rollout verification
remains in Step 8.
One request-wide deadline and abort signal cover body reading, image preparation,
and capture; the browser stage does not renew the end-to-end timeout budget.

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

- `FRAMEKIT_API_KEY` is required by the current parser in every environment;
  production therefore fails closed.
- `FRAMEKIT_INTERNAL_ORIGIN` is loopback-only, normally
  `http://127.0.0.1:3000` in Docker; the current parser also requires it in
  every environment.
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
  index.ts                         # current root facade
  client/
    index.ts                       # Step 0.5 client facade with 'use client'
    render-client.tsx              # createRenderClient() implementation
  editor.ts                        # current editor facade
  studio.ts                        # current Studio facade
  studio-root.ts                   # current Studio root facade
  dev.ts                           # current development facade
  next.ts                          # Step 0.6 configuration-only facade
  next/
    config.ts                      # withFrameKit()
    __tests__/
  server.ts                        # current render facade; Step 6 adds createImageHandler
  core/
    fields/
    template-data/
    validation/
    __tests__/
  markdown/
  shared/
    raster-image.ts                # future cross-domain raster helper
    __tests__/
      raster-image.test.ts
  editor/
    components/
      template-canvas.tsx          # preserve this location
      __tests__/
        template-canvas.test.tsx
    controls/
    export/
    navigation/
      framekit-navigation.tsx
    state/
  studio/
    page.tsx                       # Step 0.6 createStudioPage()
  tooling/
    cli/
      browser.ts                   # Step 7 explicit pinned browser installation
    codegen/
    discovery/
    dev/
  server/
    auth.ts
    browser.ts
    config.ts
    errors.ts
    image-handler/                 # Step 6 HTTP pipeline and response mapping
      index.ts                     # public handler factory and orchestration
      parse-request.ts             # exact request-shape validation
      errors.ts                    # stable public failures
      response.ts                  # HTTP response construction
      request-deadline.ts          # request-wide timeout and abort
      render-payload.ts            # definition/data/payload pipeline
    image-input.ts
    render-image.ts
    render-job.ts
    render-page.tsx                # Step 0.5 createRenderPage() helper
    request-body/                  # bounded JSON body reader
      index.ts
      validate-request.ts
      reader.ts
    __tests__/

packages/create-framekit/template/
  Dockerfile
  .dockerignore
  .env.example
  next.config.ts                   # withFrameKit()
  src/app/layout.tsx
  src/app/globals.css
  src/app/[section]/[[...slug]]/page.tsx
  src/app/api/v1/images/route.ts
  src/app/framekit/render/[id]/page.tsx

apps/studio/
  next.config.ts                   # withFrameKit() plus monorepo settings
  src/app/layout.tsx
  src/app/globals.css
  src/app/[section]/[[...slug]]/page.tsx
  src/app/api/v1/images/route.ts
  src/app/framekit/render/[id]/page.tsx
  src/__tests__/framekit/generation.integration.test.ts

<each consumer>/src/generated/framekit/    # generated, never copied in the starter
  templates.ts
  brands.ts
  studio-client.tsx
  render-client.tsx

tests/e2e/
  # root Playwright E2E coverage remains here
```

Runtime tests live under the nearest relevant `__tests__/` directory and mirror
the production domain. FrameKit server tests use
`packages/framekit/src/server/__tests__/`; the shared raster test is
`packages/framekit/src/shared/__tests__/raster-image.test.ts`; and the canvas
test is `packages/framekit/src/editor/components/__tests__/template-canvas.test.tsx`.
Compile-time type fixtures remain under `packages/framekit/tests/types/`, and
root Playwright E2E remains under `tests/e2e/`. Generated files under
`src/generated/framekit/` are regenerated, never hand-edited.

`shared/` is reserved for legitimate cross-domain functionality consumed by
`packages/framekit/src/tooling/dev/asset-upload.ts` and
`packages/framekit/src/server/image-input.ts`; it is not a generic
`utils/`/`helpers/`/`common/` dumping ground.

## Execution rules

- Keep changes in the smallest owning layer.
- Route adapters must not duplicate browser, image-fetch, or job-store logic.
- The public adapter exports `POST = createImageHandler(templates)`; the package
  also owns authentication order, bounded parsing, resolution, and HTTP mapping.
- Step 0.6 reduces the final maintained starter `src/app` inventory from eight to
  five files. Generated bindings stay disposable; generation never rewrites routes.
- `./next` must import without a Next request context and without pulling in
  `./server`, Playwright, Studio, or development-server initialization.
- Browser installation is explicit through `framekit browser install`; ordinary
  install/generate/check/dev/build/start commands do not download browsers.
- Keep `@mauriciodmo/framekit/client` free of runtime Node.js, Playwright, and
  server-route imports.
- Treat preservation of `'use client'` in `dist/client.js` as a package build
  contract, not an assumption about the bundler.
- Use `globalThis + Symbol.for(...)` for both render-job and browser process state.
- Keep the render-job API storage-agnostic enough that a future Redis/filesystem
  implementation can replace the `Map` without changing public/private routes.
- Complete focused tests with each step instead of deferring them to Step 8.
- After Steps 0.5 and 0.6, run a production Next.js build/start smoke proving that
  a test-only server route and private page see the same global job store before
  continuing to Step 6. Step 6 replaces the test-only flow with the actual API.
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
- the final starter has five maintained `src/app` files, with existing URLs and
  project styling preserved and registry bindings reproducible through codegen;
- the API adapter contains no HTTP pipeline logic, and browser installation uses
  FrameKit's pinned dependency without consumer-managed Playwright versions;
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
