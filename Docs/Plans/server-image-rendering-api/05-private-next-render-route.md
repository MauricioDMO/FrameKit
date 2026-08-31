# Step 5 - Private Next.js Render Route

## Goal

Add the application-owned private page that authenticates an in-memory render
job, loads the consumer-generated template module, and renders the already
resolved payload through one exact-size `TemplateCanvas`.

The private route is internal plumbing. It is not authenticated with the public
API key and is not a second public rendering API.

## Depends on

- [Step 2](./02-shared-canvas-and-image-inputs.md) `TemplateCanvas`.
- [Step 3](./03-temporary-render-jobs.md) `loadRenderRequest` Map protocol.
- [Step 4](./04-browser-lifecycle-and-capture.md) exact private token header and DOM
  marker protocol.
- Existing generated `templates` registry and `TemplateRegistryEntry` loaders.

## Deliverables

- Private dynamic route in the canonical generated application.
- Server page that reads ID/header and loads the process-global job.
- Client component that loads the template definition and renders already
  resolved data/assets.
- Stable loading/ready/error DOM markers for Playwright.
- Equivalent thin integration in `apps/studio`.
- Focused component/Next tests without real Chromium.
- A production Next build/start smoke proving Route Handler and page share the
  same `globalThis` store before Step 6 proceeds.

## Route location

```text
src/app/__framekit/render/[id]/page.tsx
src/app/__framekit/render/[id]/render-client.tsx
```

The reserved `__framekit` namespace aligns with existing generated assets/dev
endpoints. Do not place this page under public `/api/v1`.

Route requirements:

- Node.js runtime only;
- dynamic for every request;
- non-cacheable/no-store;
- excluded from navigation/sitemap behavior;
- inaccessible without valid job ID + private token;
- no route-level static generation.

Use the installed Next.js App Router signatures at implementation time.

## Server page responsibilities

The server page performs only the secure handoff:

1. Read the generated `id` route parameter.
2. Read exactly one `x-framekit-render-token` request header.
3. Call `loadRenderRequest(id, token)` from
   `@mauriciodmo/framekit/server`.
4. Treat malformed ID, missing header, missing job, wrong token, and expired job
   as the same not-found state.
5. Pass only the returned `ResolvedRenderPayload` to `RenderClient`.
6. Apply no-store/no-index metadata/headers where the App Router boundary permits.

It does **not**:

- compare `FRAMEKIT_API_KEY`;
- parse public JSON;
- fetch remote images;
- create/delete jobs;
- launch Chromium;
- import template source by filesystem path;
- resolve defaults/content/assets again;
- run canonical template-data validation again;
- expose token/job timestamps to the client component;
- reveal why private lookup failed.

The job reader validates the token before returning payload data.

## Client render component

The generated registry already exposes lazy template loaders used by Studio, so
the private client component may reuse that boundary.

Input:

```typescript
interface RenderClientProps {
  payload: ResolvedRenderPayload
}
```

Simplified state:

```text
loading template
  -> checking definition identity
  -> ready
  -> error
```

Required behavior:

1. Resolve `TemplateRegistryEntry` from `templates` by exact slug.
2. Load the module and validate its default export using the current canonical
   definition validator.
3. Confirm definition width/height still equal payload dimensions.
4. Confirm `payload.variant` still exists in the current definition.
5. Render `TemplateCanvas` using exactly:
   - loaded definition;
   - `payload.data`;
   - `payload.assets`;
   - `payload.variant`.
6. Mark ready only after React has committed the canvas root.

Do **not** call `resolveTemplateData` or `validateTemplateData` here. Those ran
once in the authenticated public route before browser work.

The definition/dimension/variant checks exist only to detect a source/HMR rebuild
between public validation and private rendering. They are not a second data
pipeline.

## DOM protocol

Use stable machine-readable state, not localized UI text.

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

Exactly one render root exists and it comes from `TemplateCanvas`.

### Error

```html
<main
  data-framekit-render-state="error"
  data-framekit-render-error="template_load_failed"
></main>
```

Keep marker values coarse, for example:

- `template_not_found`;
- `template_load_failed`;
- `invalid_definition`;
- `job_definition_mismatch`;
- `render_component_failed`.

Do not render field values, data URLs, URLs, stack traces, tokens, or thrown
messages into the page.

These are internal browser diagnostics, not necessarily public API codes.

## React commit and readiness

Use a small client effect/state transition after the template/data are ready so
Playwright observes a committed canvas before seeing `ready`.

The component does not wait for fonts or `<img>` decode. Step 4 performs those
browser-level checks after the committed root exists.

Do not use arbitrary sleeps.

## Styling and layout isolation

The private route inherits the consumer's root layout/global CSS because
FrameKit templates need the same Tailwind/styles/font environment as Studio.

Prevent application chrome from affecting capture:

- render no Studio shell/navigation;
- reset body/page margin if global styles add one;
- keep canvas at declared dimensions without preview scaling;
- do not add capture-root border/shadow/background/centering/overflow effects;
- status containers may exist outside the capture root;
- Playwright captures only the root locator.

Remote fonts/stylesheets are not part of the v1 server-render contract. Templates
used by the API should package required fonts/styles/assets with the application
so Chromium can load them over loopback.

## Registry integration

Application code imports only the supported generated alias:

```typescript
import { templates } from '@framekit/generated/templates'
```

Do not edit generated `templates.ts` manually.

If the generated registry cannot be safely consumed by both Studio/private page,
update codegen once and regenerate consumers.

The private component uses `payload.assets`, not the original registry assets,
because request image overrides were prepared and cloned in Step 2.

## Handling application rebuilds and HMR

The public API request and private page can span a development module reload.

Expected behavior:

- job store lives under `globalThis` and survives module replacement in the same
  Node process;
- generated registry loaded by the private page is current;
- changed definition dimensions/variant cause a coarse mismatch error rather
  than silently capturing a different layout;
- already-resolved data is not reprocessed against the changed definition;
- browser singleton also remains process-global.

The implementation does not promise a successful render across arbitrary source
edits during an active request; it promises safe failure.

## Production `globalThis` compatibility gate

Using the Map is an explicit architecture choice, so prove it before building the
public route on top of it.

After this step, run a real production Next.js build/start (preferably the
standalone server if available) with a test-only route flow:

1. create an in-memory job from one server route/module;
2. request the private page through normal HTTP;
3. confirm the private page can read that same job through
   `loadRenderRequest(...)`;
4. repeat for two concurrent jobs;
5. confirm deletion is visible to both modules.

If this fails because the runtime uses separate Node processes/isolate globals,
do not paper over it with duplicate Maps. Replace only the store implementation
before Step 6. The v1 support target remains one Node process.

## Error and response behavior

- Private auth/job failure returns not-found rather than public JSON API errors.
- Client-side template load/mismatch creates a coarse DOM error marker.
- The page is never cached.
- The route never echoes render payload values in metadata/title/body/logs.
- Browser-side logs, if any, use only coarse code + internal job ID.

## Expected files

```text
packages/create-framekit/template/src/app/__framekit/render/[id]/page.tsx
packages/create-framekit/template/src/app/__framekit/render/[id]/render-client.tsx
apps/studio/src/app/__framekit/render/[id]/page.tsx
apps/studio/src/app/__framekit/render/[id]/render-client.tsx
```

No `src/instrumentation.ts` is required solely for browser shutdown in v1.

If canonical-template/Studio duplication exceeds thin registry imports/wiring,
move the shared behavior into a supported package helper rather than maintaining
two implementations.

## Implementation sequence

1. Add private server page in canonical template.
2. Wire ID/header lookup to `loadRenderRequest` and uniform not-found handling.
3. Add `RenderClient` with template-load/definition-check/ready/error states.
4. Render shared `TemplateCanvas` directly from `ResolvedRenderPayload`.
5. Add stable DOM markers and styling isolation.
6. Add focused page/component tests.
7. Mirror the thin integration in first-party Studio.
8. Run generation/build instead of hand-editing generated registries.
9. Run the production global-Map compatibility smoke.

## Focused tests

- Missing/malformed/expired/wrong-token jobs produce the same not-found server
  result.
- Valid job passes resolved payload without token/timestamps.
- Loading state has no capture root.
- Valid loader/definition/payload produces one ready marker/root.
- Unknown loader, rejected import, invalid definition, dimension mismatch, and
  missing variant produce coarse error state.
- Private client never calls `resolveTemplateData` or canonical validation.
- Shared canvas receives exact resolved data/assets/variant/dimensions.
- Marker output contains no field values/base64/token/full URL/stack trace.
- Route is dynamic/non-cacheable.
- Canonical template and Studio build with generated registries.
- Real production Next server proves route/page share one global job store.

## Exit gate

Step 5 is complete when:

- a valid Map job renders to one exact-size ready canvas without Chromium in
  component tests;
- all private lookup failures are externally indistinguishable;
- private page renders already-resolved data without a duplicate data pipeline;
- generated registry and supported package imports are used exclusively;
- production Next build/start proves the `globalThis` Map handoff works across
  route/page bundles in the supported runtime;
- template/Studio tests, typecheck, and build pass.
