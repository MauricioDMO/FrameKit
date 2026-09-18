---
title: Use image assets
description: Add common, variant, and public images to a FrameKit template.
sidebar:
  order: 3
---

Use `field.image` for an image value. Template-local images belong under the template's `assets` directory, beside `template.tsx`.

```text
src/templates/social-card/
├── assets/
│   ├── common/
│   │   └── logo.svg
│   └── moon/
│       └── hero.webp
└── template.tsx
```

## Match the field scope to the directory

The default image scope is `variant`. A variant-scoped field first uses the selected variant directory and then falls back to the common directory. Use `scope: 'common'` when the same image belongs to every variant.

```tsx
fields: {
  hero: field.image({ label: 'Hero image' }),
  logo: field.image({ label: 'Logo', scope: 'common' })
}
```

The asset basename must match the field key. For the fields above, use `assets/moon/hero.webp` and `assets/common/logo.svg`. The variant key in the asset path is an asset directory name; it should match the content variant you intend to render.

## Add variant content

Content can provide a fallback string for an image field:

```tsx
content: {
  moon: {
    hero: '/assets/fallbacks/moon-hero.png'
  },
  fjord: {
    hero: '/assets/fallbacks/fjord-hero.png'
  }
},
variants: {
  default: 'moon',
  labels: { moon: 'Moon', fjord: 'Fjord' }
}
```

When a matching discovered asset exists, FrameKit supplies its generated URL in `assets` and applies it to the image field. Without one, the image follows the normal default, content, and edit precedence.

## Use a public image

Files under `public` are not part of the template asset scan. Reference them with a root-relative URL in `defaultValue` or content:

```tsx
logo: field.image({
  label: 'Brand logo',
  scope: 'common',
  defaultValue: '/assets/logos/brand.svg'
})
```

## Validate and regenerate

Keep source images in the template asset directories, match each basename to its image field, and regenerate after changing them:

```bash
pnpm framekit generate
```

Do not edit the generated manifest or copied files. See [template assets](/en/users/concepts/templates/assets) and the [template reference](/en/users/reference/template) for the manifest, scope, and generated URL contract.
