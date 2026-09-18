---
title: Template assets
description: Add discoverable template images, choose common or variant scope, and understand generated asset URLs.
sidebar:
  order: 5
---

Template-local images live in an `assets` directory beside `template.tsx`. Place shared files in `assets/common` and variant-specific files in `assets/<variant>`.

```text
src/templates/social-card/
├── assets/
│   ├── common/
│   │   └── logo.svg
│   └── moon/
│       └── hero.webp
└── template.tsx
```

The basename becomes the asset key. An image field named `hero` therefore uses `assets/moon/hero.webp` for the `moon` variant. Use `scope: 'common'` for an image shared by all variants; image fields default to `scope: 'variant'`.

## Asset discovery rules

FrameKit scans only direct files inside `common` or a variant directory. Asset subdirectories are rejected. Hidden entries are skipped. Supported image extensions are `.avif`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, and `.webp`. Asset names must match `[A-Za-z0-9][A-Za-z0-9._-]*`, and two files in one directory cannot produce the same basename key.

The `common` directory is reserved for shared assets. Other asset directory names must begin with a letter or number and may contain letters, numbers, underscores, and hyphens. The directory name does not create a template variant by itself; it supplies a manifest entry for that key.

## Public images

Files in `public` are not scanned into the template asset manifest. Reference them with a root-relative URL from a field default or content value:

```tsx
logo: field.image({
  label: 'Brand logo',
  defaultValue: '/assets/logos/brand.svg'
})
```

## Generated manifest

The generator copies discovered template files to `public/framekit/templates/` and creates a `TemplateAssetManifest` with this shape:

```ts
{
  common: {
    logo: '/framekit/templates/social-card/common/logo.svg'
  },
  variants: {
    moon: {
      hero: '/framekit/templates/social-card/moon/hero.webp'
    }
  }
}
```

The generated URL is based on the template slug and asset path. The `assets` render prop receives this manifest. For image resolution, a variant-scoped field uses its selected variant asset before a common asset; a common-scoped field uses the common asset. See [content and variants](/en/users/concepts/templates/content-and-variants) and [use image assets](/en/users/guides/use-image-assets).
