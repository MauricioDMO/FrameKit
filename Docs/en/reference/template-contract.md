# Template Contract

This document describes the versionless template contract: the field system, variant data handling, render boundary, and validation rules used by the current browser-based Studio.

## Canonical Definition

Every template uses one public shape. `meta` and `variants` are required;
`meta` is an exact metadata object, and `variants.default` selects one of the
field-only `content` entries. `variants.default` is a required non-empty string;
`labels` is optional and maps content keys to non-empty display labels.

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Square promotion',
    description: 'A promotional image for discounts and product offers',
    marketingDescription: 'Present the offer, show its price, and motivate the customer to buy',
    tags: ['social', 'promotion'],
  },
  width: 1200,
  height: 630,
  fields: { title: field.text({ label: 'Title' }) },
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
receives only `data`, `assets`, `variant`, `width`, and `height`. Studio invokes
it in the browser; server-side frame rendering is not currently implemented.

The `render` props are typed from the definition:

- `data` is inferred from `fields`: text, color, and image values are strings;
  number values are numbers; boolean values are booleans; and choice values are
  the union of the declared option values.
- `assets` is a `TemplateAssetManifest` with `common` and variant-keyed asset
  maps.
- `variant` is one of the keys in `content`.
- `width` and `height` retain the definition's numeric types.

## Template Metadata

`meta.title` is required and must be a non-empty string. The optional
`description` explains what the template is for; `marketingDescription` explains
the concrete communication goal; and `tags` is an array of strings. These are the
only accepted metadata properties. `revision`, `status`, `keywords`, `order`, and
other properties are rejected. A definition without a valid `meta.title` fails
validation instead of deriving a title from its directory name.

The exact variant contract is defined by [GitHub issue #4](https://github.com/MauricioDMO/FrameKit/issues/4).

## Field Kinds

Templates define fields using the singular `field` object exported from `@mauriciodmo/framekit`. The definition property remains `fields`. Each field has a `kind` that determines its behavior and the options it accepts.

### Base Options

Text, color, and image fields share a common set of options:

- `label` (string, required): A human-readable name for the field.
- `placeholder` (string, optional): Placeholder text shown in empty inputs.
- `required` (boolean, default: `true`): Whether the field must have a non-empty value. See Requiredness below.
- `defaultValue` (string, optional): A default value used when no other value is available.

### `text`

A multiline text input backed by a native `<textarea>`. Newlines are preserved in
the field value. It accepts the base options plus:

- `minLength` (non-negative integer, optional): The minimum number of characters.
- `maxLength` (non-negative integer, optional): The maximum number of characters.

Length limits are finite integers and `minLength` cannot exceed `maxLength`.

```typescript
field.text({ label: 'Description', placeholder: 'Write something...', minLength: 1, maxLength: 240 })
```

### `choice`

A closed-set string field edited with a native `<select>`. `options` must be a
non-empty ordered array of objects with unique, non-empty string `value` and
`label` properties. `defaultValue` is required and must match one of the option
values. Choice fields do not accept `required`, `control`, or `step`, and values
are not trimmed or coerced.

```typescript
field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  defaultValue: 'center',
})
```

Content and edits should use one of the declared option values. The typed
`field.choice` builder infers that option-value union; at runtime,
`validateTemplateData` reports an undeclared value as
`{ code: 'invalid_choice' }`.

### `boolean`

A binary field edited with a native `<input type="checkbox">`. It accepts only
`label` and an optional boolean `defaultValue`; omitting `defaultValue` resolves
to `false`. Boolean fields do not accept `required`, `control`, or string
coercion. Content, edits, resolved data, and render props must use real
booleans, so `'true'`, `'false'`, and numeric truthy/falsy values are invalid.

```typescript
showLogo: field.boolean({
  label: 'Show logo',
  defaultValue: true,
})
```

A wrong runtime type returns `{ code: 'invalid_boolean' }` during data
validation. Use a `choice` field when a value needs more than two states.

### `number`

A numeric field with finite numeric values at every committed data boundary. It
accepts `label`, an optional `placeholder`, and these number-specific options:

- `defaultValue` (finite number, required): The initial value for the field.
- `min` (finite number, optional): The minimum acceptable value.
- `max` (finite number, optional): The maximum acceptable value.
- `step` (finite positive number, optional, default: `1`): The increment used by
  the native numeric and range controls.
- `control` (`'input' | 'slider'`, optional, default: `'input'`): The native
  editing control to use.

Number fields do not accept `required`; their required finite numeric
`defaultValue` means they are always present. If both bounds are supplied,
`min` must be less than or equal to `max`. `input` uses a native
`<input type="number">`. `slider` uses a native `<input type="range">`,
displays the current value, retains native keyboard behavior, and requires
explicit finite `min` and `max` bounds. Values and defaults must satisfy the
declared bounds and `step` using native numeric/range semantics.

Content values, user edits, resolved data, and render props for a number field
are finite numbers. Numeric strings such as `'10'` are rejected; FrameKit does
not coerce them. Definition validation checks numeric content against the
declared constraints, and `validateTemplateData` checks resolved data. While an
input is empty or temporarily malformed, Studio keeps that local draft separate
from committed numeric data. The draft is not render data; the renderer
receives only committed finite numbers.

```typescript
count: field.number({ label: 'Count', defaultValue: 10, min: 0, max: 100 })
opacity: field.number({
  label: 'Opacity',
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 1,
  control: 'slider',
})
```

### `color`

A color picker field. Accepts only the base options. Non-empty values must be a six-digit hexadecimal color in the form `#RRGGBB`.

```typescript
field.color({ label: 'Background Color' })
```

### `image`

An image field resolves a template asset or a root-relative image from `public`
to a browser URL string. The default scope is `variant`; use `scope: 'common'`
for an image shared by every content variant. A public image can be provided as
the field `defaultValue` or as a variant value, for example
`/assets/logos/brand.svg`.

```typescript
field.image({ label: 'Hero image' })
field.image({ label: 'Background', scope: 'common' })
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

Text, color, and image fields are **required by default**. Setting
`required: false` makes one of those fields optional. Number fields always have
a required finite numeric `defaultValue` and do not accept `required`. Choice
fields always have a valid `defaultValue` and do not accept `required`; boolean
fields are always valid booleans and do not participate in requiredness.

- For fields that support `required`, an **optional field** (`required: false`)
  accepts an empty string, while a **required field** (the default) rejects an
  empty string after trimming whitespace.

Boolean fields use `false` when `defaultValue` is omitted. Number fields use
their required finite numeric default; the other fields use the requiredness
defaults described above.

## Data Resolution Order

When a template renders, field values are resolved through a specific order. This determines what the `data` object contains inside the `render` function:

1. **Field `defaultValue`**: The field's `defaultValue` option, or `''` for
   string fields and `false` for boolean fields if not set. Number fields always
   have their required finite numeric default.
2. **Content variant values**: Values from the template's `content` object for the selected variant.
3. **User edits**: Values the user has edited in the Studio editor, which override everything else.

For variant-scoped image fields, a matching variant asset takes precedence,
followed by a matching common asset. Common-scoped image fields use the matching
common asset. If no applicable project asset exists, the normal default, variant,
and user-edit resolution is used.

For fields without an applicable project asset, user edits take precedence over
variant content, which takes precedence over field defaults. An applicable image
asset overrides those resolved values for its image field.

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
// { fieldKey: string or finite number default, or false for boolean fields }
```

### Available Variants

`getVariants` returns the content variant keys defined in the template's `content` object:

```typescript
import { getVariants } from '@mauriciodmo/framekit'

const variants = getVariants(definition) // e.g., ['en', 'es']
```

These keys are arbitrary strings chosen by the template author. They are not restricted to language codes like `en` or `es`.

Studio stores editor overrides by variant in `localStorage` under
`framekit:<slug>:v2`. The loader reads only this current key; it does not read
or migrate `v1` state, and no `v1` compatibility is promised.

## Validation

FrameKit provides two validation functions that check different aspects of a template.

### Definition Validation

`validateTemplateDefinition` checks the structure of a template definition:

- `width` and `height` must be positive finite integers
- `meta` must be a plain object with only `title`, `description`, `marketingDescription`, and `tags`; `title` must be non-empty and `tags` must be an array of strings
- `variants` must be a plain object containing only `default` and optional `labels`; `variants.default` must name a content entry, and every label key must name a content entry
- `fields.language` is reserved and cannot be used
- `content` must have at least one entry
- Every content entry may contain only declared field keys, and values must
  match their field kind (`string` for string fields, finite `number` for number
  fields, and `boolean` for boolean fields); number values must also satisfy
  their declared `min`, `max`, and `step`
- Unsupported top-level properties such as `version` are rejected
- `render` must be a function
- Field options must have valid types and constraints (e.g., `min`/`max` only
  on `number` fields, `minLength`/`maxLength` only on `text` fields, and finite
  numbers only)

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
- `text` fields: non-empty values must satisfy `minLength` and `maxLength`; length is measured before trimming, so spaces and newlines count
- `number` fields: value must be a finite number, not a numeric string; it must
  satisfy the declared `min`/`max` bounds and `step` using native numeric/range semantics
- `color` fields: non-empty values, after trimming, must be six-digit hexadecimal colors in the form `#RRGGBB`
- `choice` fields: values must match one of the declared option values
- `boolean` fields: values must be real booleans; strings are not coerced

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
- `invalid_step`: Value does not match the declared `step`
- `text_too_short`: Value has fewer characters than `minLength`
- `text_too_long`: Value has more characters than `maxLength`
- `invalid_color`: Value is not a six-digit hexadecimal color in the form `#RRGGBB`
- `invalid_choice`: Value is not one of the declared choice option values
- `invalid_boolean`: Value is not a boolean

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

This canonical contract is implemented by [GitHub issue #1](https://github.com/MauricioDMO/FrameKit/issues/1). The exact
metadata contract is defined by [GitHub issue #3](https://github.com/MauricioDMO/FrameKit/issues/3). The exact
variant contract is defined by [GitHub issue #4](https://github.com/MauricioDMO/FrameKit/issues/4).
The semantic field contract is defined by [GitHub issue #5](https://github.com/MauricioDMO/FrameKit/issues/5).
The choice field contract is defined by [GitHub issue #6](https://github.com/MauricioDMO/FrameKit/issues/6).
The boolean field contract is defined by [GitHub issue #7](https://github.com/MauricioDMO/FrameKit/issues/7).
The number field contract is defined by [GitHub issue #8](https://github.com/MauricioDMO/FrameKit/issues/8).
The generated template registry contract is defined by [GitHub issue #12](https://github.com/MauricioDMO/FrameKit/issues/12).

---

[English](./template-contract.md) | [Español](../../es/reference/template-contract.md)
