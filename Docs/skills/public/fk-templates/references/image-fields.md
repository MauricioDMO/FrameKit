# Image Fields

`fields.image` represents an image value. It can resolve a project-owned template asset or a root-relative image served from `public`.

```tsx
fields: {
  hero: fields.image({ label: 'Hero image' }),
  background: fields.image({ label: 'Background', scope: 'common' }),
  logo: fields.image({
    label: 'Logo',
    defaultValue: '/assets/logos/brand.svg',
  }),
}
```

## Asset Layout

Place an `assets` directory beside the template's `template.tsx`:

```text
src/templates/social-card/
├── template.tsx
└── assets/
    ├── common/
    │   └── background.webp
    ├── en/
    │   └── hero.webp
    └── es/
        └── hero.webp
```

For an asset to resolve to a field, its basename must match the image field key. Use the locale keys declared in `content` for variant directories; FrameKit validates the directory-name pattern, not locale membership. Existing project assets may use `.avif`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, or `.webp`; only one supported image should exist for a field key in a directory.

Use `assets/common` for an image shared by all locales. Use `assets/<locale>` for locale-specific images. `scope` defaults to `variant`:

- `scope: 'variant'` checks `assets/<locale>/<fieldKey>.*`, then falls back to `assets/common/<fieldKey>.*`.
- `scope: 'common'` checks only `assets/common/<fieldKey>.*`.

Project-wide files are separate. Put them below `public/assets/<category>` and reference them explicitly, for example `/assets/logos/brand.svg`; they are not automatically matched to image fields or included in the template asset manifest.

An image field may use that public path through `defaultValue` or a locale value:

```tsx
logo: fields.image({
  label: 'Logo',
  defaultValue: '/assets/logos/brand.svg',
})
```

Public files are served directly by the application. They are not discovered as common or variant assets. If Studio uploads a replacement for the same field, FrameKit writes a template-local asset and that asset takes precedence over the public value.

## Render Data And Manifest

`framekit generate` discovers template assets and exposes a manifest with `common` and `variants` URLs. The renderer receives both the manifest and image values in `data`:

```tsx
render({ data, assets }) {
  return (
    <>
      {data.hero && <img src={data.hero} alt="" />}
      {assets.common.background && <img src={assets.common.background} alt="" />}
    </>
  )
}
```

For `data[fieldKey]`, the resolved asset URL is applied after the ordinary default, locale-content, and saved-edit values. Therefore a discovered asset takes precedence for that image field. If no matching asset exists, a default, locale value, or saved edit can remain as the value.

Generated template assets are copied to an internal public path under `public/__framekit/templates/<template-slug>/...`. The source of truth remains `src/templates/**/assets`.

## Studio Uploads

When `framekit dev` is running, the image control previews the resolved value and offers a file picker. Studio sends the selected file to the local `POST /__framekit/assets` endpoint. The server:

1. Validates the JSON request and identifies the template, locale/common scope, and field key.
2. Accepts PNG, JPEG, WebP, or GIF files up to 8 MB.
3. Verifies that the declared MIME type matches the file signature.
4. Rejects unsafe field or locale keys and writes only below the resolved template's `assets` directory.
5. Removes the previous supported extension for that field, writes the new extension, regenerates the manifest, and reloads Studio.

Uploads replace the canonical source file in the project; they are not stored in `localStorage` or as object URLs. Production `build` and `start` serve existing assets but do not expose the upload endpoint. SVG files may be used as trusted project assets, but Studio does not accept SVG uploads.

## Missing And Invalid Assets

An image with no resolved value renders the template's empty-value behavior. A required empty image fails normal data validation during `framekit check` or export. If a resolved template or public image cannot load in Studio, the image control shows its load error, and browser export can fail when the image is unavailable.
