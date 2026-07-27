# 06. Assets and Image Field

## Objective

Treat images as project-owned template assets. The source files live in the repository, the generated asset manifest resolves them to browser URLs, and Studio can replace them while running in development.

This plan intentionally does not use IndexedDB, remote image URLs, object URLs, or portable binary document storage.

## Filesystem contract

Each template may contain an `assets` directory next to `template.tsx`:

```text
src/templates/social/instagram/post/
├── template.tsx
└── assets/
    ├── common/
    │   └── background.webp
    ├── es/
    │   └── hero.webp
    └── en/
        └── hero.webp
```

The `common` directory contains images shared by every content variant. Variant directories use the exact keys declared in `content`.

Variant-dependent files must use the field key as their filename:

```text
fields: {
  hero: fields.image({ label: 'Hero image' }),
}

assets/es/hero.webp
assets/en/hero.webp
```

The file extension may be `.avif`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, or `.webp`. Only one supported image may exist for a given key in a directory.

## Global public assets

Project-wide assets live below `public/assets` and are separated by category:

```text
public/assets/
└── logos/
    └── brand.svg
```

Templates reference them explicitly:

```tsx
<img src="/assets/logos/brand.svg" alt="" />
```

Global assets are not automatically matched to field keys and are not copied into template asset manifests. An image field may still reference one explicitly with a root-relative `defaultValue` such as `/assets/logos/brand.svg`.

## Image field

```tsx
fields: {
  backgroundImage: fields.image({
    label: 'Background image',
    scope: 'common',
  }),
  hero: fields.image({
    label: 'Hero image',
    scope: 'variant',
  }),
}
```

`scope` defaults to `variant`. A common field resolves `assets/common/<fieldKey>.*`; a variant field resolves `assets/<variant>/<fieldKey>.*` and falls back to the common asset when present.

The renderer receives a string URL, preserving the current data model:

```tsx
render({ data }) {
  return data.hero ? <img src={data.hero} alt="" /> : null
}
```

Common assets are also available through the render prop manifest:

```tsx
render({ assets }) {
  return <img src={assets.common.background} alt="" />
}
```

## Generated manifest

`framekit generate` scans every template asset directory and adds this metadata to the generated template registry:

```ts
type TemplateAssetManifest = {
  common: Record<string, string>
  variants: Record<string, Record<string, string>>
}
```

During development and production build, template assets are copied to an internal generated public path. The source of truth remains the template's `assets` directory.

Generated template assets are not user-facing global assets and are stored below:

```text
public/__framekit/templates/<template-slug>/...
```

## Studio upload

The image control shows the resolved image and provides a file picker while `framekit dev` is running.

Uploads use a local development endpoint and replace the canonical file:

```text
POST /__framekit/assets
```

The server writes to one of these locations:

```text
src/templates/<template>/assets/common/<fieldKey>.<ext>
src/templates/<template>/assets/<variant>/<fieldKey>.<ext>
```

The old supported extension for the same field is removed, the manifest is regenerated, and Studio reloads the template. Production `build` and `start` serve existing assets but do not expose the upload endpoint.

## Upload restrictions

- Maximum size: 8 MB.
- Accepted uploads: PNG, JPEG, WebP, and GIF.
- The server verifies the declared MIME type against the file signature.
- Field keys and variant keys cannot contain path separators.
- SVG files are trusted project assets only and cannot be uploaded through Studio.
- The upload endpoint only writes below the resolved template directory.

## Resolution order

For image fields:

1. A matching variant asset, when the scope is `variant`.
2. A matching common asset, when available.
3. A persisted edit, if present.
4. Locale content, if present.
5. The declared `defaultValue`, if present.
6. An empty string.

Missing required images fail `framekit check` through normal field validation and are reported by Studio when the image cannot load.

## Watch and build behavior

- Adding, removing, or changing a template asset regenerates the registry.
- `framekit check` resolves image fields with the discovered manifest.
- `framekit build` copies generated public assets beside the standalone server.
- `public/assets` is served directly by Next.js and is available to every template.

## Out of scope

- Remote image URLs in `fields.image`.
- IndexedDB or localStorage binary asset repositories.
- Cloud asset libraries.
- Automatic upload of global `public/assets` files.
- SVG sanitization or user SVG uploads.
- Image editing, cropping, filters, and destructive transforms.
- Internal backup history. Git restores replaced source assets.

## Completion criteria

- A template can resolve a common image from `assets/common`.
- A template can resolve a variant image from `assets/<variant>/<fieldKey>.*`.
- `data[key]` contains a usable browser URL.
- Common assets can be reused without variant duplication.
- Public assets are available through `/assets/<category>/<file>`.
- Studio can replace a template image during `framekit dev`.
- Missing and invalid image assets fail clearly.
- Generated projects include the documented asset directories.
