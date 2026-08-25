# Template Contract

This document describes the versionless template contract: the field system, variant data handling, render boundary, and validation rules shared by Studio and future server rendering.

## Canonical Definition

Every template uses one public shape. `meta` is an exact metadata object, and
`variants.default` selects one of the field-only `content` entries.

```tsx
export default defineTemplate({
  meta: {
    title: 'Square promotion',
    description: 'A promotional image for discounts and product offers',
    marketingDescription: 'Present the offer, show its price, and motivate the customer to buy',
    tags: ['social', 'promotion'],
  },
  width: 1200,
  height: 630,
  fields: { title: fields.text({ label: 'Title' }) },
  variants: {
    default: 'en',
    labels: { en: 'English', es: 'Español' },
  },
  content: {
    en: { title: 'Hello' },
    es: { title: 'Hola' },
  },
  render({ data, assets, variant, width, height }) {
    return <article style={{ width, height }}>{data.title} ({variant})</article>
  },
})
```

The definition has no version property or editor-only alternate shape. `render`
receives only `data`, `assets`, `variant`, `width`, and `height`, so the same
definition can cross a future server-rendering boundary.

## Template Metadata

`meta.title` is required and must be a non-empty string. The optional
`description` explains what the template is for; `marketingDescription` explains
the concrete communication goal; and `tags` is an array of strings. These are the
only accepted metadata properties. `revision`, `status`, `keywords`, `order`, and
other properties are rejected. A definition without a valid `meta.title` fails
validation instead of deriving a title from its directory name.

The exact variant contract is defined by [Future Plan #4](../../Plans/Future/issue-04-content-variants.md)
and [GitHub issue #4](https://github.com/MauricioDMO/FrameKit/issues/4).

## Field Kinds

Templates define fields using the `fields` object exported from `@mauriciodmo/framekit`. Each field has a `kind` that determines its behavior and the options it accepts.

### Base Options

All field kinds share a common set of options:

- `label` (string, required): A human-readable name for the field.
- `placeholder` (string, optional): Placeholder text shown in empty inputs.
- `required` (boolean, default: `true`): Whether the field must have a non-empty value. See Requiredness below.
- `defaultValue` (string, optional): A default value used when no other value is available.

### `text`

A single-line text input. Accepts only the base options.

```typescript
fields.text({ label: 'Title', placeholder: 'Enter a title' })
```

### `textarea`

A multi-line text input. Accepts the same options as `text`.

```typescript
fields.textarea({ label: 'Description', placeholder: 'Write something...' })
```

### `number`

A numeric input. Accepts the base options plus:

- `min` (number, optional): The minimum acceptable value. Must be a finite number.
- `max` (number, optional): The maximum acceptable value. Must be a finite number.

**Important:** Despite being a `number` field, the value stored in template data is always a **string**. The `min` and `max` constraints validate the numeric interpretation of that string.

```typescript
fields.number({ label: 'Count', min: 0, max: 100 })
```

### `color`

A color picker field. Accepts only the base options. Non-empty values must be a six-digit hexadecimal color in the form `#RRGGBB`.

```typescript
fields.color({ label: 'Background Color' })
```

### `image`

An image field resolves a template asset or a root-relative image from `public`
to a browser URL string. The default scope is `variant`; use `scope: 'common'`
for an image shared by every content variant. A public image can be provided as
the field `defaultValue` or as a variant value, for example
`/assets/logos/brand.svg`.

```typescript
fields.image({ label: 'Hero image' })
fields.image({ label: 'Background', scope: 'common' })
```

Variant files use the field key as their basename:

```text
src/templates/social-card/assets/en/hero.webp
src/templates/social-card/assets/common/background.webp
```

Public files are served directly by the application. They are not discovered as
common or variant assets. If Studio uploads a replacement for the same field,
FrameKit creates a template-local asset and that asset takes precedence.

## Requiredness

Fields are **required by default**. Setting `required: false` makes a field optional.

- **Optional fields** (`required: false`): An empty string passes validation.
- **Required fields** (default): An empty string after trimming whitespace fails validation.

The default value is `true`, not `false`. This is a deliberate default because missing required data is a more common error than accidental over-requiredness.

## Data Resolution Order

When a template renders, field values are resolved through a specific order. This determines what the `data` object contains inside the `render` function:

1. **Field `defaultValue`**: The field's `defaultValue` option, or `''` if not set.
2. **Content variant values**: Values from the template's `content` object for the selected variant.
3. **User edits**: Values the user has edited in the Studio editor, which override everything else.

For image fields, a matching variant asset takes precedence, followed by a
matching common asset. If no project asset exists, the normal default, variant,
and user-edit resolution is used.

This means user edits take precedence over variant content, which takes precedence over field defaults.

### Resolving Data Programmatically

Use `resolveTemplateData` to apply this resolution order:

```typescript
import { resolveTemplateData } from '@mauriciodmo/framekit'

const data = resolveTemplateData(definition, variant, edits)
```

- `definition`: The template definition.
- `variant`: The content variant key to use. Unknown variants and unknown edit keys fail with an actionable error.
- `edits`: An object of field values edited by the user (empty object `{}` for no edits).

### Default Values

`getDefaultValues` returns only the field defaults (step 1), without applying variant content or edits:

```typescript
import { getDefaultValues } from '@mauriciodmo/framekit'

const defaults = getDefaultValues(definition.fields)
// { fieldKey: definition.fields[fieldKey].defaultValue ?? '' }
```

### Available Variants

`getVariants` returns the content variant keys defined in the template's `content` object:

```typescript
import { getVariants } from '@mauriciodmo/framekit'

const variants = getVariants(definition) // e.g., ['en', 'es']
```

These keys are arbitrary strings chosen by the template author. They are not restricted to language codes like `en` or `es`.

## Validation

FrameKit provides two validation functions that check different aspects of a template.

### Definition Validation

`validateTemplateDefinition` checks the structure of a template definition:

- `width` and `height` must be positive finite integers
- `meta` must be a plain object with only `title`, `description`, `marketingDescription`, and `tags`; `title` must be non-empty and `tags` must be an array of strings
- `variants` must be a plain object containing only `default` and optional `labels`; `variants.default` must name a content entry, and every label key must name a content entry
- `fields.language` is reserved and cannot be used
- `content` must have at least one entry
- Every content entry may contain only declared field keys, and every value must be a string
- Unsupported top-level properties such as `version` are rejected
- `render` must be a function
- Field options must have valid types (e.g., `min`/`max` only on `number` fields, finite numbers only)

```typescript
import { validateTemplateDefinition } from '@mauriciodmo/framekit'

const result = validateTemplateDefinition(definition)
if (!result.success) {
  console.error(result.error)
}
```

### Data Validation

`validateTemplateData` checks field values against their constraints:

- Required fields: empty string (after trim) fails
- `number` fields: value must parse to a finite number; must fall within `min`/`max` bounds
- `color` fields: non-empty values must be six-digit hexadecimal colors in the form `#RRGGBB`

Errors are returned as structured objects with machine-readable codes, not localized strings:

```typescript
import { validateTemplateData } from '@mauriciodmo/framekit'

const errors = validateTemplateData(definition, data)
// {
//   title: { code: 'required' },
//   count: { code: 'number_too_small', min: 10 },
// }
```

Possible error codes:

- `required`: Field is required and value is empty
- `invalid_number`: Value is not a finite number
- `number_too_small`: Value is less than the `min` constraint
- `number_too_large`: Value is greater than the `max` constraint
- `invalid_color`: Value is not a six-digit hexadecimal color in the form `#RRGGBB`

### The `check` CLI Command

The `check` command validates every template in a project:

```
framekit check
```

It performs the following steps for each template:

1. Runs `validateTemplateDefinition` to ensure structural validity.
2. Resolves data for every content variant using `resolveTemplateData` with no user edits.
3. Runs `validateTemplateData` on the resolved values to catch missing or invalid defaults.

This command helps catch configuration errors before running the Studio.

## Studio UI Language

FrameKit separates template content variants from the language used by Studio's
own interface.

### Template Content Variants

These are the keys in the template's `content` object. They are arbitrary strings chosen by the template author. A template might use keys like `en`, `es`, `fr`, or entirely different identifiers like `desktop`, `mobile`, `newsletter`.

### Studio UI Language

The Studio interface (labels, buttons, messages) uses one of two languages: Spanish (`es`) or English (`en`). This is resolved in the following order:

1. The `locale` cookie
2. The browser's `Accept-Language` header
3. Fallback to Spanish (`es`)

This separation means template content variants and Studio UI language are independent concerns.

This canonical contract is implemented by [Future Plan #1](../../Plans/Future/issue-01-canonical-template-contract.md)
and [GitHub issue #1](https://github.com/MauricioDMO/FrameKit/issues/1). The exact
metadata contract is defined by [Future Plan #3](../../Plans/Future/issue-03-template-metadata.md)
and [GitHub issue #3](https://github.com/MauricioDMO/FrameKit/issues/3). The exact
variant contract is defined by [Future Plan #4](../../Plans/Future/issue-04-content-variants.md)
and [GitHub issue #4](https://github.com/MauricioDMO/FrameKit/issues/4).

---

[English](./template-contract.md) | [Español](../../es/reference/template-contract.md)
