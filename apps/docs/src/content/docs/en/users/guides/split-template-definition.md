---
title: Split a template definition
description: Separate a template's validated data definition from a complex React rendering component.
sidebar:
  order: 2
---

Keep a simple template inline. When rendering grows into artwork components or helpers, use `defineTemplateBase` for the validated definition and keep the final `defineTemplate` call in the discoverable `template.tsx`.

## Define the data shape

Create `definition.ts` beside `template.tsx`:

```tsx
import { defineTemplateBase, field } from '@mauriciodmo/framekit'
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  meta: {
    title: 'Extracted social card',
    description: 'A reusable definition for a social card'
  },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Title' }),
    accentColor: field.color({ label: 'Accent', defaultValue: '#b9f8d2' })
  },
  content: {
    aurora: { title: 'Northern light' },
    desert: { title: 'Open horizon' }
  },
  variants: {
    default: 'aurora',
    labels: { aurora: 'Aurora', desert: 'Desert' }
  }
})

export type ArtworkProps = TemplateRenderProps<typeof templateBase>
```

`defineTemplateBase` validates the portion shared by the renderer. It does not add `render`; the final definition supplies that function.

## Create the rendering component

Put the React component in `artwork.tsx`:

```tsx
import type { ArtworkProps } from './definition'

export function Artwork ({ data, variant, width, height }: ArtworkProps) {
  return (
    <article
      data-variant={variant}
      style={{ width, height, color: data.accentColor }}
    >
      {data.title}
    </article>
  )
}
```

The typed props keep field keys, choice values, variant keys, and dimensions connected to the definition. The component remains responsible for React output; it does not replace the template contract.

## Keep the discoverable entry point

Finish with `template.tsx`:

```tsx
import { defineTemplate } from '@mauriciodmo/framekit'

import { Artwork } from './artwork'
import { templateBase } from './definition'

export default defineTemplate({
  ...templateBase,
  render: Artwork
})
```

The directory is discovered because it contains `template.tsx`. Once found, the directory is a template boundary, so its helpers and subdirectories are not scanned as separate templates. Use this split when it improves the boundary between data definition and rendering; an inline definition is still the smaller option for straightforward templates.

See [template rendering](/en/users/concepts/templates/rendering) and the [template reference](/en/users/reference/template) for the public types and constraints.
