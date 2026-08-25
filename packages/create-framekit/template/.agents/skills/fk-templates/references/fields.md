# Template Fields

Fields describe the values a Studio user may edit. Define them in the template's `fields` object with the singular `field` export and read the resolved values from `data` in `render`.

## Shared Options

Every field requires a human-readable `label`. Text, number, color, and image
fields also accept:

- `placeholder` — hint text shown by the editor; it is not a value and does not satisfy a required field.
- `required` — whether an empty value is invalid. It defaults to `true`; use `required: false` for optional content.
- `defaultValue` — the initial string value when neither the selected variant nor a Studio edit provides one. Boolean fields use a boolean default and fall back to `false`.

Each `content` entry is a field-value-only object: its keys are declared field
names and values match their field type. String fields, including number fields,
remain strings; boolean fields use real `true`/`false` values. Do not add an
entry-level `language` property; it is rejected as an unknown content key. The
field name `language` is reserved and cannot be declared in `fields`.

## Field Kinds

| Kind | Studio control | Use for | Validation |
| --- | --- | --- | --- |
| `field.text` | Multiline textarea | Titles, labels, CTAs, and copy with newlines | Required fields cannot be blank after trimming; optional `minLength` and `maxLength` count the original characters. |
| `field.number` | Number input | Counts, prices, percentages, bounded values | The trimmed value must be finite and within `min` and `max` when declared. |
| `field.color` | Color picker and hex input | Editable solid colors | A non-empty value must match `#RRGGBB`; shorthand colors are not accepted. |
| `field.image` | Resolved image preview and upload control | Template-owned images or root-relative images from `public` | See [Image Fields](./image-fields.md). |
| `field.choice` | Native select | A closed set of ordered string options | `defaultValue` must match an option; undeclared values return `invalid_choice`. |
| `field.boolean` | Native checkbox | A binary decision | Omitted defaults resolve to `false`; non-boolean values return `invalid_boolean`. |

### Text

`field.text` is a string rendered with a native multiline textarea. Newlines are
preserved. `minLength` and `maxLength` are optional finite non-negative integers;
`minLength` cannot exceed `maxLength`. FrameKit does not automatically interpret
Markdown.

```tsx
title: field.text({
  label: 'Title',
  placeholder: 'Add a title',
  defaultValue: 'Your next story',
})
```

### Number

`field.number` uses a browser number control, but `data.count` remains a string. Parse it before arithmetic. `min` and `max` constrain validation as well as the editor control.

```tsx
count: field.number({ label: 'Count', min: 0, max: 100, defaultValue: '10' })
```

### Color

`field.color` accepts six hexadecimal digits with a leading `#`. The editor provides a native color picker and a text representation. Use the value directly as a CSS color after validation.

```tsx
accent: field.color({ label: 'Accent', defaultValue: '#b9f8d2' })
```

### Image

`field.image` is for image values. Template assets are resolved from the `assets` directory; a public image can be referenced with a root-relative default or variant value:

```tsx
hero: field.image({
  label: 'Hero image',
  defaultValue: '/assets/photos/hero.webp',
})
```

Files under `public/assets` are served directly by the application. They are not scanned into the template asset manifest and are not replaced by Studio uploads. A Studio upload creates a template-local asset that takes precedence over the public fallback.

### Choice

`field.choice` uses a native select and preserves the declared option order. The
`options` array must be non-empty, with unique non-empty string `value` and
`label` properties. `defaultValue` is required and must match an option. Choice
fields do not accept `required` or `control`, and values are never coerced.

```tsx
alignment: field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  defaultValue: 'center',
})
```

### Boolean

`field.boolean` uses a native checkbox and preserves real boolean values through
content, Studio edits, persistence, and render props. It has no `required`,
`control`, or coercion behavior. Use `field.choice` for tri-state values instead
of strings such as `'true'` and `'false'`.

```tsx
showLogo: field.boolean({ label: 'Show logo', defaultValue: true })
```

## Resolution And Validation

For ordinary fields, Studio resolves values in this order:

1. `defaultValue` from the field descriptor.
2. The selected variant's content entry.
3. The saved edit for that template and variant in browser `localStorage`.

`framekit check` validates definitions and resolved variant data without Studio edits. Export validates the final resolved data before capturing the PNG. Required values are checked after trimming whitespace.

Image fields have an additional asset-manifest step; see [Image Fields](./image-fields.md). A discovered image asset overrides the default, variant content, or saved edit for that image field.
