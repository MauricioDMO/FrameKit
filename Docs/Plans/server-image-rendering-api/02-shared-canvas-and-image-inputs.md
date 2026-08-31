# Step 2 - Shared Canvas and Image Inputs

## Goal

Create one exact-size template render boundary shared by Studio and the private
browser page, then implement safe preparation of request-specific image values.

Remote HTTPS images are downloaded by Node.js before browser work and converted
to validated data URLs. Chromium does not fetch them directly.

This step does not launch Chromium, create jobs, or create HTTP routes.

## Depends on

- [Step 1](./01-contracts-and-server-boundary.md) server errors/config types.
- Current `FrameKitEditor`, `resolveTemplateData`, `validateTemplateData`, and
  development asset-upload behavior.

## Deliverables

- A reusable `TemplateCanvas` exported from
  `@mauriciodmo/framekit/editor`.
- `FrameKitEditor` migrated to that component without visual/export regression.
- Shared strict raster-byte validation used by development upload and server
  request images.
- Safe parsers for data URLs and trusted root-relative asset paths.
- An allowlisted Node.js HTTPS image fetcher with bounded redirects/body bytes.
- An async image-input preparation helper that clones the generated asset
  manifest and converts remote images to canonical data URLs.
- Focused tests for precedence, redirects, SSRF boundaries, size limits, and
  mutation safety.

## Part A - Shared template canvas

### Current boundary

`FrameKitEditor` currently owns the exact render invocation directly:

```tsx
<div ref={exportRef} style={{ width: definition.width, height: definition.height }}>
  {definition.render({ data, assets, variant, width, height })}
</div>
```

The private render page needs the same call without editor controls, preview
zoom, theme shell, or export logic. Duplicating the wrapper would create two
places where render props/layout can drift.

### Proposed component contract

```typescript
interface TemplateCanvasProps<Definition extends TemplateBase> {
  definition: Definition
  data: InferTemplateData<Definition>
  assets: TemplateAssetManifest
  variant: keyof Definition['content'] & string
  canvasRef?: Ref<HTMLDivElement>
}
```

Semantic requirements:

- output exactly one wrapper with numeric `width` and `height` styles;
- invoke `definition.render` once with canonical
  `data/assets/variant/width/height` props;
- preserve the caller-provided asset object;
- add one stable `[data-framekit-render-root]` selector to the wrapper;
- apply no preview scaling, translation, shadow, background, centering, or
  editor chrome;
- own no validation, fetching, browser readiness, state, or download logic;
- remain usable in the current client editor and the private client page.

The selector identifies the screenshot target. It does not mean fonts/images are
ready.

### Studio migration

Replace only the existing direct wrapper/invocation in `FrameKitEditor`:

- keep `TemplatePreview` behavior unchanged;
- preserve `exportRef` so `modern-screenshot` still receives the exact canvas;
- preserve validation before download/copy;
- preserve selected variant and asset object behavior;
- preserve current filename and scale `1` behavior;
- keep the current client-side Export/Copy actions; do not route Studio exports
  through the server API in v1.

## Part B - Shared raster validation

The development asset-upload path already validates encoded/decoded size,
strict base64, supported raster MIME types, and basic signatures.

Extract format-agnostic primitives rather than copy them:

```typescript
type RasterMimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/gif'

decodeStrictBase64(value: string, maxBytes: number): Buffer
assertRasterSignature(mimeType: RasterMimeType, bytes: Uint8Array): void
```

Requirements:

- maximum decoded request-image bytes: 8 MB;
- canonical base64 round-trip validation;
- reject empty data;
- verify PNG signature;
- verify JPEG start marker;
- verify WebP RIFF/WEBP markers;
- verify GIF header;
- reject MIME/signature mismatches;
- no general-purpose image parser dependency is needed for v1.

Transport-specific error mapping remains in the caller:

- development upload preserves its current behavior/messages;
- server request-image preparation maps to semantic rendering errors.

## Part C - API image source parsing

Image fields supplied through the public API can use three source classes.

### Data URLs

Accept only:

```text
data:<supported-raster-mime>;base64,<strict-base64>
```

Rules:

- MIME matching may be case-insensitive during parsing but output is normalized;
- require the `;base64` marker;
- reject extra data-URL metadata parameters initially;
- decode with the shared strict helper;
- enforce the 8 MB decoded limit;
- verify bytes against declared MIME;
- return a canonical data URL;
- reject SVG, XML, HTML, text, octet-stream, empty data, percent encoding, and
  malformed padding.

The result remains a string because FrameKit image fields resolve to browser URL
strings.

### Remote HTTPS URLs

Remote URLs are validated and fetched by Node.js. Chromium never receives the
original external URL.

Initial URL policy:

- parse using `new URL(value)`;
- scheme must be exactly `https:`;
- no username/password;
- no fragment;
- hostname normalized to lowercase;
- exact hostname membership in `config.allowedImageHosts`;
- reject IP literals;
- require default HTTPS port (no explicit non-443 port);
- preserve path and query because signed CDN URLs may require them;
- never log the full URL/query.

Fetch behavior:

```typescript
fetchRemoteRasterImage(
  url: URL,
  options: {
    allowedImageHosts: ReadonlySet<string>
    signal?: AbortSignal
  },
): Promise<string> // canonical data URL
```

Requirements:

1. Use Node's `fetch`, not browser fetching.
2. Use `redirect: 'manual'`.
3. Follow at most 3 redirects.
4. Re-run the complete HTTPS/host/credential/IP/port policy for every redirect
   target before requesting it.
5. Reject relative/invalid redirect locations that cannot be resolved safely.
6. Reject a redirect to loopback, private IP literals, HTTP, or an unallowlisted
   host.
7. Treat non-2xx final responses as `image_fetch_failed` without exposing the
   response body or full URL.
8. Require a supported raster `Content-Type` on the final response; ignore MIME
   parameters when normalizing.
9. If a finite `Content-Length` exceeds 8 MB, reject before reading.
10. Stream response bytes and stop/cancel once decoded bytes exceed 8 MB.
11. Verify raster signature after reading.
12. Convert the bytes to one canonical data URL and return it.
13. Propagate the caller abort signal so disconnected/timed-out API requests stop
    remote fetching.

This design intentionally prevents remote images from becoming a browser SSRF
surface. Node performs the only external request and does so under a narrow exact
allowlist.

### Root-relative project assets

Existing trusted template content can already contain root-relative assets.
Request-specific root-relative values may use only explicit public namespaces:

- `/assets/` for application public assets;
- `/__framekit/templates/` for generated template assets.

Reject:

- protocol-relative URLs (`//host/...`);
- backslashes;
- encoded/decoded dot traversal;
- query/fragment tricks that escape the allowed namespace;
- `/api/` paths;
- `/__framekit/render/` paths;
- other arbitrary same-origin paths.

Root-relative values remain root-relative strings and are later loaded by
Chromium from the loopback application.

## Part D - Preserve image precedence

The current resolver gives discovered image assets precedence after ordinary
edits. Do not change that global resolver behavior.

Request image overrides are represented as temporary cloned asset entries.

Proposed async operation:

```typescript
prepareRenderInputs({
  definition,
  variant,
  data,
  assets,
  allowedImageHosts,
  signal,
}): Promise<{
  edits: Record<string, unknown>
  assets: TemplateAssetManifest
}>
```

Algorithm:

1. Confirm `data` is a plain object.
2. Reject unknown keys before mutation/fetching.
3. Clone `assets.common`, `assets.variants`, and nested maps that will change.
4. For every non-image field, retain the supplied value in `edits` for canonical
   runtime type resolution/validation.
5. For every supplied image field:
   - data URL -> validate/canonicalize;
   - root-relative -> validate namespace/path;
   - HTTPS -> validate/fetch/convert to canonical data URL.
6. Remove supplied image fields from ordinary `edits`.
7. For common image fields, set the prepared value in `assets.common[key]`.
8. For variant image fields, set it only in the selected variant map.
9. Never mutate the generated registry asset manifest.
10. Return ordinary edits plus the cloned temporary asset manifest.

Then the public route performs exactly once:

```typescript
const data = resolveTemplateData(definition, variant, edits, assets)
const errors = validateTemplateData(definition, data)
```

This yields API precedence:

1. supplied validated/prepared API image override;
2. selected-variant generated asset;
3. common generated asset;
4. normal content/default behavior when no asset exists.

Remote images appear only once in the prepared manifest/data flow and are never
kept both as the original URL and a second base64 edit.

## Expected files

```text
packages/framekit/src/editor/components/template-canvas.tsx
packages/framekit/src/editor/components/template-canvas.test.tsx
packages/framekit/src/editor/framekit-editor.tsx
packages/framekit/src/editor.ts
packages/framekit/src/shared/raster-image.ts
packages/framekit/src/shared/raster-image.test.ts
packages/framekit/src/server/image-input.ts
packages/framekit/src/server/image-input.test.ts
packages/framekit/src/dev/asset-upload.ts
```

The shared raster helper should remain internal unless an actual public consumer
needs byte-level primitives.

## Implementation sequence

1. Extract `TemplateCanvas` preserving existing wrapper behavior.
2. Migrate `FrameKitEditor` and run export/copy tests.
3. Export the canvas from `./editor`.
4. Extract strict base64/signature primitives from development asset upload.
5. Rewire development upload and prove no behavior regression.
6. Implement data-URL and root-relative path parsing.
7. Implement remote HTTPS URL policy and manual redirect validation.
8. Implement bounded Node.js remote raster fetch -> canonical data URL.
9. Implement async asset-manifest cloning/preparation.
10. Add precedence, abort, redirect, mutation-safety, and SSRF-focused tests.

## Focused tests

### Canvas

- Wrapper dimensions equal definition dimensions.
- `definition.render` receives exact canonical props.
- Capture selector exists exactly once.
- Studio export ref points to the shared canvas root.
- Existing Studio download/copy tests still pass.

### Raster validation

- Valid PNG/JPEG/WebP/GIF signatures pass.
- MIME/signature mismatch fails.
- Empty, malformed, non-canonical base64 and oversized bytes fail.
- Existing development upload status behavior remains unchanged.

### Source parsing and remote fetch

- Canonical data URLs pass and are normalized.
- SVG, extra metadata, percent encoding, wrong signature, malformed padding, and
  oversized data URLs fail.
- Exact allowlisted HTTPS host passes.
- Host suffix tricks, credentials, IPs, non-default ports, HTTP, file URLs, and
  fragments fail before fetch.
- Every redirect is revalidated.
- Redirect to loopback/private IP/unallowlisted host is rejected.
- Redirect count is bounded.
- Non-2xx final response maps to `image_fetch_failed`.
- Unsupported/missing raster Content-Type fails safely.
- Remote `Content-Length` precheck works but is not the only byte limit.
- Chunked response exceeding 8 MB is canceled/rejected.
- Valid remote raster becomes one canonical data URL.
- Abort signal stops a pending remote fetch.
- Logs/errors do not contain full signed URLs or response bodies.

### Asset normalization

- Generated input assets are never mutated.
- Common image override enters `assets.common`.
- Variant image override enters only selected variant.
- Remote input URL is replaced by prepared data URL before render.
- Base64 is not duplicated in both `edits` and asset manifest.
- Omitted images preserve current variant/common/default behavior.
- Unknown fields fail before remote network work.
- Wrong non-image runtime type fails through canonical resolution/validation.

## Exit gate

Step 2 is complete when:

- Studio and a test consumer render through one exact canvas;
- current Studio export/upload behavior has no regression;
- request image sources are deterministically validated/prepared;
- remote images are fetched by Node under an exact allowlist and converted to
  canonical data URLs;
- dynamic image overrides preserve current resolver precedence without writing
  project files;
- all focused package tests, typecheck, and build pass without Playwright.
