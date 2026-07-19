# Template Contract

This document describes the template contract: the field system, data handling, and validation rules that define how FrameKit templates work.

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

A color picker field. Accepts only the base options. No runtime CSS-format validation is performed beyond checking requiredness.

```typescript
fields.color({ label: 'Background Color' })
```

### `url`

A URL input field. Accepts the base options. The value is validated as:

- An absolute URL using the `http:` or `https:` protocol
- A root-relative path starting with `/`

Relative paths and other URL schemes (e.g., `ftp://`, `javascript:`) are rejected.

```typescript
fields.url({ label: 'Link URL', placeholder: 'https://example.com' })
```

## Requiredness

Fields are **required by default**. Setting `required: false` makes a field optional.

- **Optional fields** (`required: false`): An empty string passes validation.
- **Required fields** (default): An empty string after trimming whitespace fails validation.

The default value is `true`, not `false`. This is a deliberate default because missing required data is a more common error than accidental over-requiredness.

## Data Resolution Order

When a template renders, field values are resolved through a specific order. This determines what the `data` object contains inside the `render` function:

1. **Field `defaultValue`**: The field's `defaultValue` option, or `''` if not set.
2. **Content locale values**: Values from the template's `content` object for the selected locale.
3. **User edits**: Values the user has edited in the Studio editor, which override everything else.

This means user edits take precedence over locale content, which takes precedence over field defaults.

### Resolving Data Programmatically

Use `resolveTemplateData` to apply this resolution order:

```typescript
import { resolveTemplateData } from '@mauriciodmo/framekit'

const data = resolveTemplateData(definition, locale, edits)
```

- `definition`: The template definition.
- `locale`: The content locale key to use.
- `edits`: An object of field values edited by the user (empty object `{}` for no edits).

### Default Values

`getDefaultValues` returns only the field defaults (step 1), without applying locale content or edits:

```typescript
import { getDefaultValues } from '@mauriciodmo/framekit'

const defaults = getDefaultValues(definition.fields)
// { fieldKey: definition.fields[fieldKey].defaultValue ?? '' }
```

### Available Locales

`getLocales` returns the locale keys defined in the template's `content` object:

```typescript
import { getLocales } from '@mauriciodmo/framekit'

const locales = getLocales(definition) // e.g., ['en', 'es']
```

These keys are arbitrary strings chosen by the template author. They are not restricted to language codes like `en` or `es`.

## Validation

FrameKit provides two validation functions that check different aspects of a template.

### Definition Validation

`validateTemplateDefinition` checks the structure of a template definition:

- `width` and `height` must be positive finite integers
- `fields.language` is reserved and cannot be used
- `content` must have at least one entry
- Every content entry must have a `language` property
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
- `url` fields: must be an HTTP(S) absolute URL or root-relative path

Errors are returned as structured objects with machine-readable codes, not localized strings:

```typescript
import { validateTemplateData } from '@mauriciodmo/framekit'

const errors = validateTemplateData(definition, data)
// {
//   title: { code: 'required' },
//   count: { code: 'number_too_small', min: 10 },
//   link: { code: 'invalid_url' },
// }
```

Possible error codes:

- `required`: Field is required and value is empty
- `invalid_number`: Value is not a finite number
- `number_too_small`: Value is less than the `min` constraint
- `number_too_large`: Value is greater than the `max` constraint
- `invalid_url`: Value is not a valid HTTP(S) URL or root-relative path

### The `check` CLI Command

The `check` command validates every template in a project:

```
framekit check
```

It performs the following steps for each template:

1. Runs `validateTemplateDefinition` to ensure structural validity.
2. Resolves data for every content locale using `resolveTemplateData` with no user edits.
3. Runs `validateTemplateData` on the resolved values to catch missing or invalid defaults.

This command helps catch configuration errors before running the Studio.

## Locale System

FrameKit separates two concerns that both use the word "locale":

### Template Content Locales

These are the keys in the template's `content` object. They are arbitrary strings chosen by the template author. A template might use locale keys like `en`, `es`, `fr`, or entirely different identifiers like `desktop`, `mobile`, `newsletter`.

### Studio UI Language

The Studio interface (labels, buttons, messages) uses one of two languages: Spanish (`es`) or English (`en`). This is resolved in the following order:

1. The `lang` cookie
2. The browser's `Accept-Language` header
3. Fallback to Spanish (`es`)

This separation means template content locales and Studio UI language are independent concerns.

---

[English](/en/reference/template-contract.md) | [Español](/es/reference/template-contract.md)
