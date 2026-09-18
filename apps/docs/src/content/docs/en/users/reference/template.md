---
title: Template reference
description: Reference the current FrameKit template definition, fields, variants, assets, rendering, and validation contracts.
sidebar:
  order: 1
---

This is the current public template contract. Import template builders and types from `@mauriciodmo/framekit`.

## Definition

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Square promotion' },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({ label: 'Title' })
  },
  variants: {
    default: 'en',
    labels: { en: 'English' }
  },
  content: {
    en: { title: 'Hello' }
  },
  render ({ data, variant, width, height }) {
    return <article style={{ width, height }}>{data.title} ({variant})</article>
  }
})
```

The accepted top-level keys are `meta`, `width`, `height`, `fields`, `variants`, `content`, and `render`. Unsupported properties are rejected. `meta` and `variants` are required. `content` must have at least one entry, and `render` must be a function.

### Metadata

`meta.title` is required and must be a non-empty string. The only optional metadata keys are:

- `description`, a string describing the template;
- `marketingDescription`, a string describing the communication goal; and
- `tags`, an array of strings.

The directory name is not a metadata fallback. Invalid or missing `meta.title` fails validation.

### Dimensions

`width` and `height` must each be positive, finite integers. They define the fixed output size and are passed to `render` as typed values.

## Content and variants

`content` is a non-empty record of arbitrary, template-owned keys. Each entry is a partial record of values from `fields`; unknown field keys are invalid. `variants.default` is a required non-empty string and must name a content entry. `variants.labels` is optional, and each key must name a content entry with a non-empty string label.

The keys are not restricted to language codes. `language`, `en`, and `es` have no reserved template semantics. A template can use them as ordinary field or variant keys, or choose names such as `moon`, `fjord`, `desktop`, or `variant-a`.

At render time, values are applied in this order:

1. field defaults;
2. values from `content[variant]`; then
3. user edits.

String fields without a default begin as `''`, booleans without a default begin as `false`, and number fields require a finite numeric default. Values supplied by content or edits must already match the field's runtime type.

Use the public helpers when resolving data programmatically:

```tsx
import { getDefaultValues, getVariants, resolveTemplateData } from '@mauriciodmo/framekit'
import type { TemplateDefinition } from '@mauriciodmo/framekit'

declare const definition: TemplateDefinition

const defaults = getDefaultValues(definition.fields)
const variants = getVariants(definition)
const data = resolveTemplateData(definition, variants[0], {})
```

`resolveTemplateData` rejects an unknown variant, unknown field key, non-plain edits object, or value with the wrong runtime type.

## Fields

The definition property is named `fields`; the public builder namespace is singular, `field`. The six kinds are `text`, `number`, `boolean`, `choice`, `color`, and `image`.

### Shared string fields

Text, color, and image fields accept `label`, optional `placeholder`, optional string `defaultValue`, and optional `required`. They are required by default. `required: false` allows an empty string. A required empty value is checked after trimming.

### `text`

`field.text` preserves newlines. Optional `minLength` and `maxLength` must be finite non-negative integers, and `minLength` cannot exceed `maxLength`. Data validation measures length before trimming.

```tsx
field.text({
  label: 'Description',
  placeholder: 'Write something...',
  minLength: 1,
  maxLength: 240
})
```

### `number`

`field.number` requires a finite numeric `defaultValue` and does not accept `required`. It also accepts an optional string `placeholder`. Optional `min` and `max` are finite bounds and must be ordered when both are present. `step` is finite and positive and defaults to `1`. `control` is `'input'` by default or `'slider'` for a native range control. Slider fields require explicit finite `min` and `max` bounds.

Number defaults, content values, edits, resolved data, and render props must be finite numbers. Numeric strings are rejected. Values must satisfy the declared bounds and step. The `placeholder` is passed to the native number input; the slider control does not render a placeholder.

```tsx
field.number({
  label: 'Opacity',
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 1,
  control: 'slider'
})
```

### `boolean`

`field.boolean` accepts `label` and an optional boolean `defaultValue`. The default is `false`. Boolean values are not coerced from strings or numbers.

```tsx
field.boolean({ label: 'Show logo', defaultValue: true })
```

### `choice`

`field.choice` requires a non-empty ordered `options` array. Each option has a unique, non-empty string `value` and a non-empty string `label`; `defaultValue` must match an option value. Choice fields do not accept `required`, `control`, or `step`; values are not trimmed or coerced.

```tsx
field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ],
  defaultValue: 'center'
})
```

### `color`

Data validation trims the submitted string before checking it. After trimming, non-empty color values must match six-digit hexadecimal `#RRGGBB`, case-insensitively.

```tsx
field.color({ label: 'Background color', defaultValue: '#173d31' })
```

### `image`

`field.image` adds `scope: 'common' | 'variant'`, defaulting to `variant`. The value is a browser URL string after asset resolution. A variant-scoped field uses a matching variant asset before a matching common asset. A common-scoped field uses the matching common asset.

```tsx
field.image({ label: 'Hero image' })
field.image({ label: 'Background', scope: 'common' })
```

## Assets

Template-local images are direct files in `assets/common` or `assets/<variant>` beside `template.tsx`. Supported extensions are `.avif`, `.gif`, `.jpeg`, `.jpg`, `.png`, `.svg`, and `.webp`. Asset directories cannot contain subdirectories. Asset names must match `[A-Za-z0-9][A-Za-z0-9._-]*`, and the basename becomes the manifest key. Public files are not scanned and may be referenced with root-relative values such as `/assets/logos/brand.svg`.

The public `TemplateAssetManifest` shape is:

```ts
interface TemplateAssetManifest {
  common: Record<string, string>
  variants: Record<string, Record<string, string>>
}
```

## Render props

`render` receives `TemplateRenderProps` containing only:

- `data`, inferred from the declared fields;
- `assets`, the generated common and variant manifest;
- `variant`, one of the content keys;
- `width`, the definition width; and
- `height`, the definition height.

```tsx
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

type Props = TemplateRenderProps
```

The renderer returns a React node and should use the supplied fixed dimensions for its output canvas. It does not receive field descriptors, edits, or locale state.

## Discovery and generated registry

Templates are discovered recursively below `src/templates/`. Hidden directories and directories beginning with `_` are skipped. Other segments must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. A directory containing `template.tsx` is a template boundary. Its slash-separated path becomes `slug`, and discovered templates are sorted by slug.

Generation writes `src/generated/framekit/templates.ts` and copies discovered image files to `public/framekit/templates/`. Each `TemplateRegistryEntry` contains:

```ts
import type { TemplateAssetManifest, TemplateDefinition, TemplateMeta, TemplateVariants } from '@mauriciodmo/framekit'

interface TemplateRegistryEntry {
  slug: string
  segments: string[]
  meta: TemplateMeta
  width: number
  height: number
  variants: TemplateVariants
  variantKeys: string[]
  assets: TemplateAssetManifest
  load: () => Promise<{ default: TemplateDefinition }>
}
```

The `load` function is lazy. Generated registry files are disposable and must not be edited manually.

## Validation

`defineTemplate` runs definition validation. `validateTemplateDefinition` checks the top-level shape, metadata, dimensions, fields, variants, content, field types, numeric bounds and steps, and the render function. `validateTemplateData` checks resolved values.

Data validation reports structured error codes rather than localized strings:

```ts
import { validateTemplateData } from '@mauriciodmo/framekit'
import type { TemplateDefinition } from '@mauriciodmo/framekit'

declare const definition: TemplateDefinition
declare const data: Record<string, string | number | boolean>

const errors = validateTemplateData(definition, data)
```

Codes include `required`, `invalid_number`, `number_too_small`, `number_too_large`, `invalid_step`, `text_too_short`, `text_too_long`, `invalid_color`, `invalid_choice`, and `invalid_boolean`.

The CLI check validates every discovered template and every content variant:

```bash
pnpm framekit check
```

It generates first, resolves each variant with no edits, and validates the resolved data. `pnpm framekit dev`, `pnpm framekit check`, and `pnpm framekit build` generate automatically. `pnpm framekit start` reads existing build output and does not generate.
