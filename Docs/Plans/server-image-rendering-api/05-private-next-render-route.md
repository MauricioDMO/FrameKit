# Step 5 - Private Next.js Render Route

## Goal

Add the application-owned private page that receives a temporary job through the
server package, loads the consumer's generated template module, and exposes one
exact-size render root for Playwright.

This route is internal plumbing. It is not authenticated with the public API key
and is not a second public rendering API.

## Depends on

- [Step 2](./02-shared-canvas-and-image-inputs.md) `TemplateCanvas`.
- [Step 3](./03-temporary-render-jobs.md) `loadRenderRequest`.
- [Step 4](./04-browser-lifecycle-and-capture.md) token header and marker
  protocol.
- The existing generated `templates` registry and `TemplateRegistryEntry` asset
  types.

## Deliverables

- Private dynamic route in the canonical generated application.
- Server page that authenticates and loads the temporary record.
- Client component that loads the template definition and renders the shared
  canvas.
- Stable loading/ready/error DOM-state protocol for Playwright.
- Node startup integration for browser shutdown handlers.
- Equivalent thin integration in `apps/studio`.
- Focused server/component tests without a real browser.

## Route location

```text
src/app/__framekit/render/[id]/page.tsx
src/app/__framekit/render/[id]/render-client.tsx
```

The reserved `__framekit` namespace aligns with existing generated template
assets and the development asset endpoint. Do not place this page under the
public `/api/v1` namespace.

The route must be:

- Node.js runtime only;
- dynamic for every request;
- `no-store`/non-cacheable;
- excluded from public navigation and sitemap behavior;
- inaccessible without a valid temporary ID and private header;
- free of route-level static generation.

Use the current Next.js App Router signatures at implementation time; do not
copy a stale `params` signature from an older Next release.

## Server page responsibilities

The server page performs only the secure handoff:

1. Read the generated `id` route parameter.
2. Read exactly one `x-framekit-render-token` request header.
3. Call `loadRenderRequest(id, token)` from
   `@mauriciodmo/framekit/server`.
4. Treat malformed ID, missing header, missing job, wrong token, expired job,
   unsupported version, and malformed stored record as the same not-found state.
5. Pass only the returned serializable payload to `RenderClient`.
6. Set response metadata/headers that prevent indexing and caching where the
   App Router boundary permits it.

It does not:

- compare `FRAMEKIT_API_KEY`;
- parse public request JSON;
- create or delete jobs;
- launch a browser;
- import template source by a filesystem path;
- render Studio controls;
- expose the token to the client component;
- reveal why a private lookup failed.

The temporary job reader validates the token before returning data, so an
external request that guesses an ID cannot receive base64 or field content.

## Client render component

The client component owns the lazy module boundary because the generated
registry already exposes lazy template loaders used by Studio.

Input:

```typescript
interface RenderClientProps {
  payload: NormalizedRenderPayload
}
```

State machine:

```text
loading definition
  -> validating definition
  -> resolving job data
  -> validating resolved data
  -> ready
  -> error (from any failed stage)
```

Required behavior:

1. Resolve the matching `TemplateRegistryEntry` from `templates` by slug.
2. If no entry exists, enter error. This should be unreachable after Step 6
   validation but protects against registry changes between the two requests.
3. Load the module and validate its default export with the canonical definition
   validator.
4. Confirm definition width/height still equal the validated job dimensions.
5. Confirm the variant remains defined.
6. Resolve payload edits plus temporary assets through `resolveTemplateData`.
7. Run the canonical data validation boundary used by the current runtime.
8. Render `TemplateCanvas` with exact resolved values.
9. Mark the state ready only after React has committed the canvas root.

If the canonical data pipeline becomes a single discriminated resolver before
implementation, use that current source of truth instead of reintroducing the
older parallel resolver/validator sequence.

## DOM protocol

The private page needs stable machine-readable state, not localized UI text.

### Loading

```html
<main data-framekit-render-state="loading"></main>
```

No capture root exists yet.

### Ready

```html
<main data-framekit-render-state="ready">
  <div data-framekit-render-root>...</div>
</main>
```

Exactly one root exists. The root comes from `TemplateCanvas`.

### Error

```html
<main
  data-framekit-render-state="error"
  data-framekit-render-error="template_load_failed"
></main>
```

The browser reads the stable coarse error marker. Do not render field values,
stack traces, tokens, URLs, or raw thrown messages into the page.

Suggested internal marker values:

- `template_not_found`;
- `template_load_failed`;
- `invalid_definition`;
- `job_definition_mismatch`;
- `invalid_render_data`;
- `render_component_failed`.

These are internal diagnostics, not necessarily public API error codes.

## React commit and readiness

Setting ready in the same render that creates the canvas is acceptable only if
Playwright's next action observes the committed DOM. A small effect after the
definition/data are ready provides a clear commit boundary.

The component does not wait for fonts or `<img>` decoding. Step 4 performs those
checks against the committed root because it has the final browser-level view of
resource success and timeout.

Do not use arbitrary sleeps in the component or browser.

## Styling and layout isolation

The route inherits the consumer's root layout and global CSS because templates
depend on the same styles as Studio. Prevent inherited application chrome from
affecting capture:

- render no Studio shell/navigation;
- reset body/page margin for the private route if global CSS does not already do
  so;
- keep canvas at its declared dimensions without preview scaling;
- do not add shadow, border, overflow clipping, theme background, or centering to
  the capture root;
- status containers may exist outside the capture root;
- Playwright captures the root locator, never the whole page.

The private page must use the same font and static asset environment as the
normal application so the screenshot represents the actual template.

## Registry integration

The application imports only generated supported aliases:

```typescript
import { templates } from '@framekit/generated/templates'
```

Do not edit generated `templates.ts` manually. If the existing generated module
cannot be safely consumed by both Studio and the private route, update codegen
once and regenerate the canonical template/Studio outputs.

The private component receives the temporary asset manifest from the job. It
does not use the generated entry's original assets after normalization, except
through the cloned payload created by Step 6.

## Handling application rebuilds and HMR

During development, the public API request and private page can span a module
reload:

- the filesystem job survives module replacement;
- the job reader does not depend on an in-memory map;
- the generated registry loaded by the private page is current;
- a mismatch between validated dimensions/variant and the reloaded definition
  becomes an explicit error rather than capturing a different layout;
- browser singleton state remains global/HMR-safe from Step 4.

This makes development behavior deterministic without promising render success
across a source edit occurring in the middle of a request.

## Shutdown startup integration

Add the application startup boundary required by Step 4, expected at:

```text
src/instrumentation.ts
```

Requirements:

- register only in the Node.js runtime;
- dynamically import the server entry if needed to keep non-Node bundles clean;
- call `registerBrowserShutdownHandlers()` once;
- do not launch Chromium during registration;
- do not register in Edge runtime;
- mirror the thin integration in `apps/studio`.

Validate the exact Next.js instrumentation contract against the installed Next
version during implementation.

## Error and response behavior

- Private authentication/storage failure returns not found, not JSON API errors.
- The client error state returns a page that Playwright can inspect; it does not
  need to change HTTP status after streaming/hydration.
- The page is never cached.
- The route must not echo request data in metadata, title, body, or console logs.
- Browser-side errors may log a coarse code and internal render ID only.

## Expected files

```text
packages/create-framekit/template/src/app/__framekit/render/[id]/page.tsx
packages/create-framekit/template/src/app/__framekit/render/[id]/render-client.tsx
packages/create-framekit/template/src/instrumentation.ts
apps/studio/src/app/__framekit/render/[id]/page.tsx
apps/studio/src/app/__framekit/render/[id]/render-client.tsx
apps/studio/src/instrumentation.ts
```

If duplication exceeds thin imports/registry wiring, move behavior into the
supported package instead of creating a template utility and Studio copy.

## Implementation sequence

1. Add the private server page in the canonical template.
2. Wire ID/header lookup to `loadRenderRequest` and uniform not-found handling.
3. Add `RenderClient` with explicit load/validate/resolve/render states.
4. Add loading/ready/error DOM markers.
5. Render the shared `TemplateCanvas` without Studio chrome.
6. Add Node-only instrumentation shutdown registration.
7. Add focused page/component tests.
8. Mirror the same thin integration in first-party Studio.
9. Run template generation/build rather than editing generated registries.

## Focused tests

- Missing, malformed, expired, and wrong-token jobs produce the same not-found
  server result.
- A valid job passes payload without token/timestamps to the client.
- Loading state has no capture root.
- Valid loader/definition/data produces one ready marker and one root.
- Unknown loader, rejected import, invalid definition, dimension mismatch,
  missing variant, and invalid data produce error markers.
- Marker content does not contain field values, base64, token, or stack trace.
- Shared canvas receives exact payload assets and resolved data.
- Route output is dynamic/non-cacheable.
- Instrumentation registers shutdown only for Node and does not launch browser.
- Canonical template and Studio build with generated registries.

## Exit gate

Step 5 is complete when:

- a test-created valid temporary job can be rendered by the private page to one
  exact-size ready canvas without Chromium;
- all private lookup failures are indistinguishable externally;
- the page uses generated registry and supported package imports only;
- the application startup boundary registers graceful browser cleanup;
- template and Studio tests/typecheck/build pass.
