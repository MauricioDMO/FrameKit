# Template Fields

Fields describe the values a Studio user may edit. Define them in the template's `fields` object and read the resolved values from `data` in `render`.

## Shared Options

Every field requires a human-readable `label`. All fields also accept:

- `placeholder` — hint text shown by the editor; it is not a value and does not satisfy a required field.
- `required` — whether an empty value is invalid. It defaults to `true`; use `required: false` for optional content.
- `defaultValue` — the initial string value when neither the selected locale nor a Studio edit provides one.

The `language` property in each content entry is reserved and never appears in `data`. Values in `data` are always strings, including numbers.

## Field Kinds

| Kind | Studio control | Use for | Validation |
| --- | --- | --- | --- |
| `fields.text` | Single-line text input | Titles, labels, CTAs, short copy | Required fields cannot be blank after trimming. |
| `fields.textarea` | Resizable multiline textarea | Paragraphs and long copy | Required fields cannot be blank after trimming. |
| `fields.number` | Number input | Counts, prices, percentages, bounded values | The trimmed value must be finite and within `min` and `max` when declared. |
| `fields.color` | Color picker and hex input | Editable solid colors | A non-empty value must match `#RRGGBB`; shorthand colors are not accepted. |
| `fields.url` | URL text input | Links, external images, and explicit public paths | Only `http://`, `https://`, and root-relative paths beginning with `/` are accepted. |
| `fields.image` | Resolved image preview and upload control | Template-owned images | See [Image Fields](./image-fields.md). |

### Text

`fields.text` is a plain single-line string. FrameKit does not impose a length limit or automatically interpret Markdown.

```tsx
title: fields.text({
  label: 'Title',
  placeholder: 'Add a title',
  defaultValue: 'Your next story',
})
```

### Textarea

`fields.textarea` keeps newlines and is intended for paragraphs or longer copy. It is not automatically rendered as Markdown; pass its value to [`Markdown`](./markdown.md) when formatting is desired.

```tsx
description: fields.textarea({
  label: 'Description',
  required: false,
})
```

### Number

`fields.number` uses a browser number control, but `data.count` remains a string. Parse it before arithmetic. `min` and `max` constrain validation as well as the editor control.

```tsx
count: fields.number({ label: 'Count', min: 0, max: 100, defaultValue: '10' })
```

### Color

`fields.color` accepts six hexadecimal digits with a leading `#`. The editor provides a native color picker and a text representation. Use the value directly as a CSS color after validation.

```tsx
accent: fields.color({ label: 'Accent', defaultValue: '#b9f8d2' })
```

### URL

`fields.url` is for values that are intentionally URL-shaped. It accepts absolute HTTP(S) URLs and root-relative paths such as `/assets/logo.svg`; other protocols and relative paths are invalid.

```tsx
link: fields.url({ label: 'Link', required: false })
```

## Resolution And Validation

For ordinary fields, Studio resolves values in this order:

1. `defaultValue` from the field descriptor.
2. The selected locale's content entry.
3. The saved edit for that template and locale in browser `localStorage`.

`framekit check` validates definitions and resolved locale data without Studio edits. Export validates the final resolved data before capturing the PNG. Required values are checked after trimming whitespace.

Image fields have an additional asset-manifest step; see [Image Fields](./image-fields.md). A discovered image asset overrides the default, locale content, or saved edit for that image field.
