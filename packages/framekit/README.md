# @mauriciodmo/framekit

FrameKit provides the typed template contract, data resolution, validation,
Markdown rendering, and reusable editor components for React and Next.js.

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

`generate` discovers `src/templates/**/template.tsx` and writes
`.framekit/generated/templates.ts`. `check` validates every template before
`build` runs Next.js. Production uses Next.js standalone output under
`.framekit/next`.

## Inline templates

Use `defineTemplate` when the definition and renderer belong in one file. The
`render` callback infers `data` and `locale` from the fields and content keys:

```tsx
import { defineTemplate, fields } from '@mauriciodmo/framekit'

export default defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Title', required: true }),
  },
  content: {
    en: { language: 'English', title: 'Offer' },
  },
  render({ data, locale, width, height }) {
    return <article style={{ width, height }}>{data.title} ({locale})</article>
  },
})
```

Each template owns its locale keys through `content`. FrameKit does not limit
or import the application's interface locales. Every content entry requires
`language`, autocompletes the declared field keys, and rejects unknown keys.

Localized field values can be omitted. Resolution applies field defaults,
localized content, and user edits in that order before required values are
validated.

## Extracted artwork

For larger templates, keep the definition and component separate. Define the
contract with `defineTemplateBase`, then type the component with
`TemplateRenderProps<typeof templateBase>`:

```tsx
// definition.ts
import { defineTemplateBase, fields } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  width: 1200,
  height: 800,
  fields: { title: fields.text({ label: 'Title' }) },
  content: { en: { language: 'English', title: 'Offer' } },
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

## Public entry points

```tsx
import { defineTemplate, fields, Markdown } from '@mauriciodmo/framekit'
import { FrameKitEditor, FrameKitNavigation } from '@mauriciodmo/framekit/editor'
import '@mauriciodmo/framekit/styles.css'
```

The root entry also exports the public validators, resolvers, field descriptors,
and structured validation errors.
