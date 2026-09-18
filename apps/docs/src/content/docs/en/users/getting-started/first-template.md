---
title: Create your first template
description: Add a minimal valid FrameKit template and open it in Studio.
sidebar:
  order: 5
---

Templates are code-defined React components discovered under `src/templates/`. A minimal template needs metadata, positive dimensions, at least one field, content for a variant, a default variant, and a `render` function.

## Create the file

Create `src/templates/first-template/template.tsx`:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'First template',
    description: 'A minimal template for learning the FrameKit workflow.',
  },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({
      label: 'Title',
      required: true,
      minLength: 1,
      maxLength: 80,
    }),
  },
  content: {
    default: {
      title: 'Hello from FrameKit',
    },
  },
  variants: {
    default: 'default',
    labels: {
      default: 'Default',
    },
  },
  render({ data, width, height }) {
    return (
      <article
        className="flex items-center justify-center bg-[#10271f] p-16 text-center text-6xl text-white"
        style={{ width, height }}
      >
        {data.title}
      </article>
    )
  },
})
```

The directory name becomes part of the template slug. The default export from `template.tsx` is the discoverable template definition. `meta.title` is required; it is not inferred from the directory name.

## Understand the contract

- `fields` declares the editable data and its validation rules. The public constructor is the singular `field` namespace, so use `field.text`, `field.number`, `field.boolean`, `field.choice`, `field.color`, or `field.image`.
- `content` supplies values for each variant. Each entry should contain only field values.
- `variants.default` selects the initial content key. That key must exist in `content`.
- `render({ data, assets, variant, width, height })` returns the React output for the selected variant. The example only needs `data`, `width`, and `height`.
- `width` and `height` are positive export dimensions and are available to the renderer.

Variant keys belong to the template. They are not reserved language metadata; `default`, `en`, and `es` are all ordinary keys unless the template assigns them meaning.

## Validate and open Studio

From the project root, validate the definition:

```bash
pnpm framekit check
```

The check regenerates the registry before validating the template and every content variant. Start Studio after it passes:

```bash
pnpm dev
```

Open `http://localhost:3000/login`, sign in, and select the template from `/editor`. During development, changes under `src/templates/` trigger registry regeneration. `pnpm framekit generate` can regenerate it explicitly.

Do not edit `src/generated/framekit/templates.ts` to register the template. Discovery and code generation own that file.

Continue with [the project structure guide](/en/users/getting-started/project-structure) before adding assets or brand components.
