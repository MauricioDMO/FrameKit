---
title: Template fields
description: Configure text, number, boolean, choice, color, and image fields with the current FrameKit contract.
sidebar:
  order: 4
---

Declare editable values under `fields` with the singular `field` export from `@mauriciodmo/framekit`. The six field kinds are `text`, `number`, `boolean`, `choice`, `color`, and `image`.

All field descriptors require a non-empty `label`. Content, edits, resolved data, and render props keep their runtime types: strings for text, color, image, and choice; finite numbers for number; and booleans for boolean.

## Text

`field.text` creates a multiline text field. It accepts `label`, optional `placeholder`, optional `defaultValue`, optional `required`, and optional `minLength` and `maxLength`.

```tsx
title: field.text({
  label: 'Title',
  placeholder: 'Write a title',
  defaultValue: 'Your title',
  required: true,
  minLength: 1,
  maxLength: 80
})
```

Text is required by default and otherwise starts as `''`. `minLength` and `maxLength` must be finite non-negative integers, and `minLength` cannot exceed `maxLength`. Required validation trims only to decide whether the value is empty; length is measured on the original value, including spaces and newlines.

## Number

`field.number` requires a finite numeric `defaultValue`. It accepts an optional string `placeholder`, optional finite `min` and `max` bounds, an optional positive finite `step` (default `1`), and `control: 'input' | 'slider'` (default `'input'`). Number fields do not accept `required`.

```tsx
count: field.number({
  label: 'Count',
  placeholder: 'Enter a count',
  defaultValue: 10,
  min: 0,
  max: 100,
  step: 5
}),
opacity: field.number({
  label: 'Opacity',
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 1,
  control: 'slider'
})
```

The default `input` control is a native number input and uses `placeholder` when provided. `slider` is a native range input; it does not render a placeholder and requires explicit finite `min` and `max` bounds. When both bounds are provided, `min` must not exceed `max`; values and defaults must satisfy the bounds and step. Committed values must be finite numbers. Numeric strings are invalid, not coerced.

## Boolean

`field.boolean` accepts only `label` and an optional boolean `defaultValue`. If omitted, the default is `false`.

```tsx
showLogo: field.boolean({
  label: 'Show logo',
  defaultValue: true
})
```

Boolean values remain booleans in content, edits, resolved data, and render props. Use `field.choice` when a value needs more than two states.

## Choice

`field.choice` creates a closed set of string values. Its `options` array must be non-empty and ordered. Every option must have a unique, non-empty string `value` and `label`. `defaultValue` is required and must match an option value.

```tsx
alignment: field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ],
  defaultValue: 'center'
})
```

Choice fields do not accept `required`, `control`, or `step`. Content and edits must use one of the declared option values.

## Color

`field.color` uses the same `label`, `placeholder`, `required`, and `defaultValue` options as other string fields. Data validation trims the submitted string before checking it, so surrounding whitespace is ignored for this check. After trimming, non-empty values must be six-digit hexadecimal colors in `#RRGGBB` form, case-insensitively.

```tsx
accentColor: field.color({
  label: 'Accent color',
  defaultValue: '#173d31'
})
```

Color fields are required by default. Set `required: false` to allow an empty string.

## Image

`field.image` accepts the string-field options plus `scope: 'common' | 'variant'`. The default scope is `variant`.

```tsx
hero: field.image({ label: 'Hero image' }),
background: field.image({ label: 'Background', scope: 'common' })
```

A variant-scoped image looks for the selected variant's asset first and then a common asset. A common-scoped image uses the common asset. Without a matching asset, the field follows the normal string-value resolution order. See [use image assets](/en/users/guides/use-image-assets).

## Requiredness and validation

Text, color, and image fields are required by default; `required: false` permits an empty string. Number and choice fields have required defaults, while boolean fields always resolve to a boolean. Definition validation checks the shape and field options. Data validation checks resolved values and reports structured codes such as `required`, `invalid_number`, `invalid_choice`, `invalid_color`, and `invalid_boolean`, plus number and text constraint codes.

For the complete validation contract, see the [template reference](/en/users/reference/template).
