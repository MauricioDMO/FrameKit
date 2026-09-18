---
title: Template definition
description: Define the metadata, dimensions, fields, content, variants, and render function that make up a FrameKit template.
sidebar:
  order: 2
---

`defineTemplate` validates a complete template definition and preserves its types for the renderer. The public import is `@mauriciodmo/framekit`.

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Promotion card',
    description: 'A card for a promotion',
    marketingDescription: 'Present an offer clearly',
    tags: ['social', 'promotion']
  },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({ label: 'Title', required: true, minLength: 1, maxLength: 80 }),
    accentColor: field.color({ label: 'Accent', defaultValue: '#173d31' })
  },
  content: {
    default: { title: 'A clear offer' }
  },
  variants: {
    default: 'default',
    labels: { default: 'Default' }
  },
  render ({ data, width, height }) {
    return (
      <article style={{ width, height, color: data.accentColor }}>
        {data.title}
      </article>
    )
  }
})
```

## Required structure

A complete definition contains:

- `meta`, a plain metadata object;
- `width` and `height`, positive finite integers;
- `fields`, a record created with the singular `field` namespace;
- `content`, with at least one variant entry containing only declared field keys;
- `variants`, with a non-empty `default` content key and optional `labels`; and
- `render`, a function that returns a React node.

`meta.title` is required and must be non-empty. The only accepted metadata keys are `title`, `description`, `marketingDescription`, and `tags`; `tags`, when present, is an array of strings. The title comes from validated metadata, not from the template directory name.

`width` and `height` define the fixed output dimensions. The renderer receives those values, so the root artwork should use them as its canvas dimensions. Non-finite, non-integer, or non-positive dimensions fail definition validation.

## Where the file lives

Create `src/templates/<template-slug>/template.tsx`. Directory segments use lowercase letters, numbers, and single hyphens, matching `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Directories beginning with `.` or `_` are ignored. Once a directory contains `template.tsx`, it is a template boundary; files and subdirectories below it remain private to that template.

See [fields](/en/users/concepts/templates/fields), [content and variants](/en/users/concepts/templates/content-and-variants), and the [template reference](/en/users/reference/template) for the individual contracts.
