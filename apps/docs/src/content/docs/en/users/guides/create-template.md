---
title: Create a template
description: Create, validate, and regenerate a complete FrameKit template definition.
sidebar:
  order: 1
---

Create a directory under `src/templates/` with a lowercase kebab-case name and add a default-exporting `template.tsx`. The following is a complete valid template:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Social card',
    description: 'A square card for social posts',
    marketingDescription: 'Present the message and motivate an action',
    tags: ['social', 'promotion']
  },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({
      label: 'Title',
      required: true,
      minLength: 1,
      maxLength: 80
    }),
    accentColor: field.color({
      label: 'Accent color',
      defaultValue: '#173d31'
    })
  },
  content: {
    default: {
      title: 'Your next story starts here'
    }
  },
  variants: {
    default: 'default',
    labels: {
      default: 'Default'
    }
  },
  render ({ data, width, height }) {
    return (
      <article
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 72,
          background: '#10271f',
          color: data.accentColor,
          fontSize: 72
        }}
      >
        {data.title}
      </article>
    )
  }
})
```

## Check the definition

Run the project check from the project root:

```bash
pnpm framekit check
```

The check regenerates the registry, validates the definition, resolves every content variant with no edits, and validates the resulting data. It catches invalid metadata, dimensions, field options, content values, and numeric constraints before the template is used.

## Regenerate during development

For a one-off registry update, run:

```bash
pnpm framekit generate
```

`pnpm framekit dev` generates before starting and watches changes under `src/`. `pnpm framekit build` also generates through its check step. `pnpm framekit start` is read-only with respect to generation and expects an existing production build.

Keep generated files out of the authoring change. Edit `src/templates/<name>/template.tsx`, then regenerate. The [template definition](/en/users/concepts/templates/definition), [fields](/en/users/concepts/templates/fields), and [template reference](/en/users/reference/template) explain the individual contracts.
