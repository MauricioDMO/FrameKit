# Template Authoring

A template is a directory under `src/templates/` that contains a `template.tsx` file with a default export. FrameKit discovers templates by scanning the `src/templates/` directory and registering every directory that has a `template.tsx` file.

## Directory Conventions

Templates live in directories under `src/templates/`. Each directory name must follow the pattern:

```
^[a-z0-9]+(?:-[a-z0-9]+)*$
```

This means lowercase letters, numbers, and hyphens only — no uppercase, no underscores, no special characters. For example: `blog-banner`, `social-card`, `email-header`.

**Ignored directories:** Directories starting with `.` or `_` are skipped during discovery. Use these prefixes for private or auxiliary directories that should not be treated as templates.

**Template boundaries:** When FrameKit finds a `template.tsx` inside a directory, it treats that directory as a template boundary. Any subdirectories inside it are part of the template's private structure and are not scanned for additional templates. This lets you organize helper files, components, and assets alongside your template without creating nested templates.

Template images belong in an `assets` directory beside `template.tsx`. Put shared images in `assets/common`; put variant images in a directory named after the content key and use the field key as the filename. Project-wide files belong in `public/assets/<category>` and use explicit `/assets/...` URLs.

## Slug Generation

The slug is the path from `src/templates/` to the template directory, with segments joined by slashes. Example: `src/templates/social-cards/instagram/post` becomes `social-cards/instagram/post`.

Titles shown in the Studio UI are derived from directory names by splitting on hyphens and capitalizing each word. For example, `social-cards` becomes "Social Cards" and `instagram-post` becomes "Instagram Post".

The generated template registry is sorted alphabetically by slug. In the Studio UI, templates and folders are sorted alphabetically by their humanized titles.

## Authoring Forms

FrameKit supports two forms for defining templates. Both produce the same end result; pick the form that fits the complexity of your template.

### Inline Template

For straightforward templates, define everything in a single `template.tsx` file:

```tsx
import { defineTemplate, fields, Markdown } from '@mauriciodmo/framekit'

export default defineTemplate({
  width: 1200,
  height: 800,
  fields: {
    title: fields.text({ label: 'Title', required: true }),
    accentColor: fields.color({ label: 'Accent Color', defaultValue: '#b9f8d2' }),
  },
  content: {
    en: {
      language: 'English',
      title: 'Your next story starts here',
    },
    es: {
      language: 'Español',
      title: 'Tu próxima historia empieza aquí',
    },
  },
  render({ data, locale, width, height }) {
    return (
      <article
        style={{
          width,
          height,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: 72,
          background: 'linear-gradient(135deg, #10271f, #39775f)',
          color: '#f5fff8',
        }}
      >
        <Markdown value={data.title} style={{ fontSize: 72 }} />
      </article>
    )
  },
})
```

### Extracted Definition

For templates with complex rendering logic, separate the definition from the React component using `defineTemplateBase`. This lets you place artwork components, helpers, and assets in private subdirectories without affecting template discovery.

```tsx
// definition.ts
import { defineTemplateBase, fields } from '@mauriciodmo/framekit'
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Title' }),
    accentColor: fields.color({ label: 'Accent', defaultValue: '#b9f8d2' }),
  },
  content: {
    aurora: { language: 'Aurora', title: 'Northern light' },
    desert: { language: 'Desert', title: 'Open horizon' },
  },
})

export type ArtworkProps = TemplateRenderProps<typeof templateBase>
```

```tsx
// artwork.tsx
import type { ArtworkProps } from './definition'

export function Artwork({ data, locale, width, height }: ArtworkProps) {
  return (
    <article lang={locale} style={{ width, height, color: data.accentColor }}>
      {data.title}
    </article>
  )
}
```

```tsx
// template.tsx
import { defineTemplate } from '@mauriciodmo/framekit'
import { Artwork } from './artwork'
import { templateBase } from './definition'

export default defineTemplate({
  ...templateBase,
  render: Artwork,
})
```

## Template Definition Structure

Every template definition requires five properties:

- `width` — a positive integer specifying the template output width in pixels
- `height` — a positive integer specifying the template output height in pixels
- `fields` — a record where each key is a field name and each value is a field descriptor (text, textarea, number, color, or image)
- `content` — a record with at least one locale entry, where each entry contains a `language` string and partial field values
- `render` — a function that receives typed props and returns a React node

## Content and Locales

Locale keys are arbitrary strings. They are not restricted to language tags — you can use any identifier that makes sense for your template, such as `en`, `es`, `moon`, `fjord`, or `variant-a`. Each locale entry must include a `language` property with a human-readable label, and may include values for any of the fields defined in the template. Fields not present in a locale start with their `defaultValue` if declared, otherwise remain empty. The complete render-time precedence is documented in [Data Resolution Order](../reference/template-contract.md#data-resolution-order): defaults -> locale content -> user edits.

The `language` key inside each locale entry is reserved. It is used only as a display label in the Studio UI and is never included in the `data` object passed to `render`.

```tsx
content: {
  fjord: { language: 'Fjordic', title: 'Offer' },
  moon: { language: 'Lunar', title: 'Oferta' },
}
```

In this example, the `locale` type is `'fjord' | 'moon'`, not a global language union.

## Render Props

The `render` function receives a single object with five properties:

- `data` — an object containing all field keys as strings after resolution. In Studio, values are applied in this order: field defaults, locale content, then user edits.
- `locale` — the key of the currently selected locale, typed as a union of all content keys.
- `width` — the template width as a literal type.
- `height` — the template height as a literal type.
- `assets` — generated URLs for common and variant template assets.

An image field resolves to a browser URL string. Variant fields use `assets/<locale>/<field-key>.*`; common fields use `assets/common/<field-key>.*`. A public image can be referenced with a root-relative value such as `/assets/logos/brand.svg` in `defaultValue` or locale content. Public files are not scanned into the template asset manifest.

```tsx
fields: {
  hero: fields.image({ label: 'Hero image' }),
  background: fields.image({ label: 'Background', scope: 'common' }),
},
```

```text
src/templates/social-card/assets/
├── common/background.webp
└── en/hero.webp
```

```tsx
logo: fields.image({
  label: 'Brand logo',
  defaultValue: '/assets/logos/brand.svg',
})
```

## Auto-Regeneration

When running `framekit dev`, FrameKit watches `src/` for changes that affect the generated template and brand registries:

- Under `src/templates/`, adding or removing directories, or adding, removing, or changing a `template.tsx` file or a file under an `assets` directory, triggers regeneration. Changes to other template source files do not trigger regeneration through this watcher; Next.js HMR can still update the running instance.
- Under `src/brand/`, adding, removing, or changing files or directories triggers regeneration. Brand components are discovered recursively, and each component directory must follow the `src/brand` contract described in the [Brand Components](./brand-components.md) guide.

For one-off regeneration, run `framekit generate`. The shared generation command requires at least one template; it discovers both templates and brand components, then writes `src/generated/framekit/templates.ts` and `src/generated/framekit/brands.ts`.

## Reserved Keys

The key `language` is reserved inside `fields` and cannot be used as a field name. FrameKit rejects this at both build time and runtime. Each entry in `content` must contain a `language` string property.

---

[English](./template-authoring.md) · [Español](../../es/guides/template-authoring.md)
