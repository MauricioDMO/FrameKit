# @mauriciodmo/framekit

FrameKit provides the typed template contract, data resolution, validation,
Markdown rendering, and reusable editor components for React and Next.js.

## Compatibility

- Node.js `>=22.13.0`
- pnpm `>=11.14.0` when using pnpm
- npm 10 or later when using npm

## CLI

FrameKit uses the current directory as the application root:

```json
{
  "scripts": {
    "dev": "framekit dev",
    "build": "framekit build",
    "start": "framekit start",
    "check": "framekit check"
  }
}
```

`generate` discovers `src/templates/**/template.tsx`, scans each template's
`assets` directory, and writes `src/generated/framekit/templates.ts`.
`check` validates every template before `build` runs Next.js. Production uses
Next.js standalone output under `.framekit/next`.

## Inline templates

Use `defineTemplate` when the definition and renderer belong in one file. The
`render` callback infers `data` and `variant` from the fields and content keys:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Offer card',
    description: 'A card for presenting a product offer',
    marketingDescription: 'Highlight the offer and motivate a purchase',
    tags: ['social', 'promotion'],
  },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Title', required: true }),
  },
  content: {
    en: { title: 'Offer' },
  },
  variants: { default: 'en', labels: { en: 'English' } },
  render({ data, variant, width, height }) {
    return <article style={{ width, height }}>{data.title} ({variant})</article>
  },
})
```

Each template owns its variant keys through `content`. FrameKit does not limit
or import the application's interface language. Content entries contain only
declared field values, and unknown keys are rejected.

Variant field values can be omitted. Resolution applies field defaults, variant
content, and user edits in that order before required values are
validated.

## Extracted artwork

For larger templates, keep the definition and component separate. Define the
contract with `defineTemplateBase`, then type the component with
`TemplateRenderProps<typeof templateBase>`:

```tsx
// definition.ts
import { defineTemplateBase, field } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  meta: {
    title: 'Extracted offer',
    description: 'A reusable offer-card definition',
    marketingDescription: 'Make the offer and next action clear',
    tags: ['promotion'],
  },
  width: 1200,
  height: 800,
  fields: { title: field.text({ label: 'Title' }) },
  content: { en: { title: 'Offer' } },
  variants: { default: 'en', labels: { en: 'English' } },
})
```

```tsx
// artwork.tsx
import type { TemplateRenderProps } from '@mauriciodmo/framekit'
import type { templateBase } from './definition'

export function Artwork({ data, width, height }: TemplateRenderProps<typeof templateBase>) {
  return <article style={{ width, height }}>{data.title}</article>
}
```

```tsx
// template.tsx
import { defineTemplate } from '@mauriciodmo/framekit'
import { Artwork } from './artwork'
import { templateBase } from './definition'

export default defineTemplate({ ...templateBase, render: Artwork })
```

Only `template.tsx` is discovered by the registry scanner. Neighboring modules,
components, and assets remain private to that template directory.

Use `field.choice()` for ordered closed-set string selects; its `defaultValue`
must match an option and undeclared values return `invalid_choice`. Use
`field.image()` for images. Variant files use the field key as their
filename under `assets/<variant>`; shared files live under `assets/common`.
Images under `public/assets` can be referenced with a root-relative
`defaultValue` such as `/assets/logos/brand.svg`. Studio can replace template
images through `framekit dev`; public files remain application assets.

## Public entry points

```tsx
import { defineTemplate, field, Markdown } from '@mauriciodmo/framekit'
import { FrameKitEditor, FrameKitNavigation } from '@mauriciodmo/framekit/editor'
import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'
import '@mauriciodmo/framekit/styles.css'
```

The root entry also exports the public validators, resolvers, field descriptors,
structured validation errors, and the exact `TemplateMeta` type. Metadata
requires a non-empty `title`; only `description`, `marketingDescription`, and
`tags` are optional additions. There is no slug fallback for missing metadata.

`FrameKitStudioRoot` and `FrameKitStudio` provide the complete editor interface,
including navigation, variant and theme controls. Pass the generated `templates`
array to `FrameKitStudio` from a client page under `/editor`.

## Full documentation

- [Documentation](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/README.md)
- [Documentación](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/es/README.md)
- [Template Authoring Guide](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/guides/template-authoring.md)
- [CLI Reference](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/reference/cli.md)
- [Public API Reference](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/reference/public-api.md)
