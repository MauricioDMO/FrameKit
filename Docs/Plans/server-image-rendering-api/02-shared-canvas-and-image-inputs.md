# Step 2 - Shared Canvas and Image Inputs

## Goal

Create one exact-size template render boundary shared by Studio and the private
browser page, then add safe normalization for request-specific image values
without changing canonical template data or asset precedence.

This step does not launch Chromium or create HTTP routes.

## Depends on

- [Step 1](./01-contracts-and-server-boundary.md) server errors/config types.
- Current `FrameKitEditor`, `resolveTemplateData`, `validateTemplateData`, and
  development asset-upload behavior.

## Deliverables

- A small reusable `TemplateCanvas` component exported from
  `@mauriciodmo/framekit/editor`.
- `FrameKitEditor` migrated to that component without visual/export regression.
- Shared raster-byte validation used by development upload and server inputs.
- A pure image-input normalizer for base64, trusted root-relative assets, and
  exact-host allowlisted HTTPS URLs.
- A pure function that converts image field overrides into a temporary cloned
  `TemplateAssetManifest` and returns remaining ordinary edits.
- Unit/component tests for precedence and rejection paths.

## Part A - Shared template canvas

### Current boundary

`FrameKitEditor` currently owns this rendering directly:

```tsx
<div ref={exportRef} style={{ width: definition.width, height: definition.height }}>
  {definition.render({ data, assets, variant, width, height })}
</div>
```

The server page needs the same call but not the editor controls, preview zoom,
theme shell, or export cloning. Duplicating the call would make two places where
render props and wrapper behavior could diverge.

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

The exact React ref shape should follow the repository's React 19 conventions;
the semantic requirements are:

- output one wrapper with exact numeric `width` and `height` styles;
- invoke `definition.render` once with canonical props;
- preserve the caller-provided `assets` object;
- add a stable `data-framekit-render-root` selector to the wrapper;
- apply no scale, translation, shadow, background, or layout chrome;
- own no editor state, effects, browser readiness, validation, or download logic;
- remain usable inside the existing client editor and private client page.

The private render ready/error state belongs to Step 5, outside this component.
The root selector identifies what Playwright captures; it does not claim that
fonts or images have loaded.

### Studio migration

Replace only the direct wrapper/invocation in `FrameKitEditor`:

- keep `TemplatePreview` unchanged;
- preserve `exportRef` so `modern-screenshot` still receives the exact root;
- preserve validation before download/copy;
- preserve selected variant and asset object identity where behavior depends on
  them;
- preserve the existing exported filename and scale `1` behavior;
- do not route Studio's current Export button through the new server API.

## Part B - Shared raster validation

The development upload path already validates:

- encoded/decoded size;
- strict base64 round-trip;
- PNG signature;
- JPEG start marker;
- WebP RIFF/WEBP markers;
- GIF header;
- supported MIME mapping.

Move the format-agnostic byte checks into a shared internal helper rather than
copying them into the server API. Keep transport-specific errors in their owning
adapters:

- development upload keeps its current Spanish HTTP errors and raw base64 body;
- server image input maps failures to `unsupported_image` or
  `request_too_large`;
- neither path imports the other path's route handler.

Possible internal primitives:

```typescript
type RasterMimeType = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif'

decodeStrictBase64(value: string, maxBytes: number): Buffer
assertRasterSignature(mimeType: RasterMimeType, bytes: Uint8Array): void
```

Do not add an image parsing dependency for four signatures.

## Part C - API image source parsing

### Data URLs

Accept only this shape:

```text
data:<supported-raster-mime>;base64,<strict-base64>
```

Rules:

- MIME matching is case-insensitive during parsing and normalized afterward.
- Require the `;base64` marker.
- Do not accept extra metadata parameters initially.
- Decode with the shared strict helper.
- Enforce 8 MB decoded bytes per image and the global 12 MB encoded request
  limit in Step 6.
- Verify signature against normalized MIME.
- Return a canonical data URL rather than preserving alternate casing or
  formatting.
- Reject SVG, HTML, XML, text, octet-stream, empty bytes, percent-encoded data,
  and malformed padding.

The normalized data URL remains a string because image fields resolve to browser
URL strings.

### Remote HTTPS URLs

Parse with `new URL(value)` and require:

- scheme exactly `https:`;
- no username or password;
- no fragment;
- hostname normalized to lowercase;
- exact hostname membership in `allowedImageHosts`;
- no IP literal;
- default HTTPS port only in the initial implementation.

Preserve the URL path and query because signed CDN URLs may require them. Do not
log the full URL. Step 4 re-applies the destination policy to actual browser
requests and redirects; request-time validation alone is not sufficient.

### Root-relative project assets

Existing trusted template content can already contain root-relative values.
Request-specific values must not turn the browser into a same-origin API caller.
Accept only normalized paths under explicit public asset namespaces:

- `/assets/` for project public assets;
- `/__framekit/templates/` for generated template assets.

Reject protocol-relative values (`//host/...`), backslashes, dot segments after
URL normalization, query/fragment tricks that leave the namespace, and paths
under `/api/` or the private render route.

Callers normally omit packaged image fields and let the generated manifest
supply these paths. Explicit root-relative support exists for valid project
public assets, not arbitrary same-origin requests.

## Part D - Preserve image precedence

Current resolution gives discovered image assets precedence after ordinary
edits. Changing that global behavior would affect Studio and existing templates.
Instead, normalize API image overrides as temporary assets.

Proposed pure operation:

```typescript
normalizeRenderInputs({
  definition,
  variant,
  data,
  assets,
  allowedImageHosts,
}): {
  edits: Record<string, unknown>
  assets: TemplateAssetManifest
}
```

Algorithm:

1. Confirm `data` is a plain object.
2. Reject unknown keys before mutation.
3. Clone `assets.common`, `assets.variants`, and only nested maps that will be
   changed; never mutate the generated registry entry.
4. For each non-image field, retain the supplied value in `edits` for canonical
   type resolution/validation.
5. For each supplied image field, parse its source according to this step.
6. Remove that image key from ordinary edits.
7. If `field.scope === 'common'`, set `assets.common[key]`.
8. Otherwise create/clone `assets.variants[variant]` and set that key there.
9. Resolve complete data through `resolveTemplateData` with the temporary
   assets.
10. Run canonical validation and preserve structured field errors.

This yields these precedence rules for API rendering:

1. supplied validated API image override;
2. existing selected-variant asset for variant-scoped fields;
3. existing common asset;
4. normal edit/content/default behavior when no asset exists.

The API-specific first rule is implemented by constructing the temporary asset
manifest, not by changing the core resolver.

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

The shared raster helper path may differ. It must not be exported publicly unless
an actual consumer needs byte-level validation.

## Implementation sequence

1. Extract `TemplateCanvas` with the existing wrapper behavior unchanged.
2. Migrate `FrameKitEditor` and run its export/copy component tests.
3. Export the canvas from `./editor` and add a type fixture if its props are
   public.
4. Extract strict base64/signature primitives from development asset upload.
5. Rewire asset upload to the helper and prove no accepted/rejected input changed.
6. Implement data URL, HTTPS URL, and root-relative path parsers.
7. Implement asset-manifest cloning and image-field normalization.
8. Add precedence, mutation-safety, and security tests.

## Focused tests

### Canvas

- Wrapper dimensions equal definition dimensions.
- `definition.render` receives exact data/assets/variant/width/height.
- The capture selector exists once.
- Studio's export ref points to the shared canvas root.
- Existing browser download/copy tests still pass.

### Raster validation

- Valid PNG, JPEG, WebP, and GIF signatures pass.
- MIME/signature mismatch fails.
- Empty, malformed, non-canonical base64 and oversized bytes fail.
- Existing development upload status behavior remains unchanged.

### Source parsing

- Canonical data URLs pass and are normalized.
- SVG, extra metadata, percent encoding, bad padding, wrong signatures, and
  oversize content fail.
- Exact allowlisted HTTPS hostname passes.
- Hostname suffix tricks, credentials, IPs, non-default ports, HTTP, file URLs,
  and fragments fail.
- Accepted root-relative namespaces pass after normalization; protocol-relative,
  traversal, private route, and API paths fail.

### Asset normalization

- Generated input assets are not mutated.
- Common image override enters `assets.common`.
- Variant image override enters only the selected variant.
- Base64 appears once in the serialized result, not in both assets and edits.
- Omitted image preserves existing variant/common/default behavior.
- Unknown field and wrong non-image runtime type fail through canonical paths.

## Exit gate

Step 2 is complete when:

- Studio and a test-only headless consumer can render through one canvas;
- current Studio export/upload behavior has no regression;
- API image sources have deterministic pure validation and normalization;
- dynamic images preserve resolver semantics without writing project files;
- all focused package tests, typecheck, and build pass without Playwright.
