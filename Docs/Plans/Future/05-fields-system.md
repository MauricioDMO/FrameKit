# 05. Fields System

## Objective

Build a small field system based on data meaning and editing intent instead of creating a new field kind for every HTML control.

## Core rule

A new field kind should exist only when at least one of the following is true:

1. It represents a different runtime value type.
2. It requires unique validation.
3. It has a clearly different editing workflow.
4. It requires special serialization or persistence.
5. It cannot be expressed correctly through options on an existing field.

A different visual control is not enough to justify a different field kind.

## Separation of concerns

### `kind`

Describes what the value means.

### `control`

Describes how Studio edits that value.

Example:

```tsx
fields.number({
  label: 'Opacity',
  min: 0,
  max: 100,
  control: 'slider',
})
```

`slider` is not a field kind. It is a control for a numeric value.

## Proposed canonical field kinds

| Kind | Purpose | Resolved value |
|---|---|---|
| `text` | Textual content | `string` |
| `number` | Mathematical or measurable value | `number` |
| `choice` | One value from a closed set | `string` |
| `boolean` | Binary condition | `boolean` |
| `color` | Validated color value | `string` |
| `image` | Image source and presentation data | `ImageValue` |

Convenience factories such as `fields.textarea()` and `fields.url()` may remain public, but they should normalize internally to `text`.

---

## `text`

### Objective

Represent textual content whose final value must remain a string.

Examples:

- Titles.
- Descriptions.
- Names.
- Product codes.
- Formatted prices.
- Messages.
- URLs.
- Markdown.
- Text that includes leading zeroes.

### Proposed configuration

```tsx
fields.text({
  label: 'Title',
  multiline: false,
  format: 'plain',
  minLength: 1,
  maxLength: 80,
  placeholder: 'Enter a title',
})
```

### Editing modes

```text
multiline: false
multiline: true
```

This removes the need for `textarea` as a separate internal kind.

### Formats

Initial formats:

```text
plain
url
markdown
```

`url` adds validation and an appropriate control while preserving a string runtime value.

`markdown` may provide editing assistance, but the stored and resolved value remains a string.

### Convenience factories

```tsx
fields.textarea(options)
```

Normalizes to:

```tsx
fields.text({
  ...options,
  multiline: true,
})
```

```tsx
fields.url(options)
```

Normalizes to:

```tsx
fields.text({
  ...options,
  format: 'url',
})
```

### When to use text instead of number

Use `text` when exact formatting matters:

```text
"00125"
"$10.99"
"50% OFF"
"1,000 units"
```

These values look numeric but should not be converted or used mathematically.

### Possible future formats

Do not create these as separate kinds initially:

- `email`
- `phone`
- `date`
- `time`
- `slug`

They can be introduced as `text.format` values when a real use case and validation contract exist.

---

## `number`

### Objective

Represent a value that is used mathematically or requires numeric constraints.

Examples:

- Opacity.
- Size.
- Spacing.
- Quantity.
- Rotation.
- Scale.
- Percentage.
- Border width.

### Resolved value

The renderer should receive a number, not a string.

```tsx
render({ data }) {
  return <div style={{ opacity: data.opacity / 100 }} />
}
```

### Proposed configuration

```tsx
fields.number({
  label: 'Opacity',
  min: 0,
  max: 100,
  step: 1,
  unit: '%',
  control: 'slider',
})
```

### Controls

```text
input
slider
```

`range` should not exist as a separate kind.

### What number replaces

The following should be numeric field configurations, not kinds:

- Range.
- Spacing.
- Opacity.
- Font size.
- Rotation.
- Scale.
- Border radius.
- Line height.

### Rules

- `min` and `max` must be finite.
- `step` must be positive.
- Resolved values must be finite.
- Units affect presentation and documentation, not the stored numeric value.
- A formatted number should remain `text`.

---

## `choice`

### Objective

Represent one selection from a set of values defined by the template author.

Examples:

- Alignment.
- Visual style.
- Font token.
- Layout variant.
- Position.
- Theme.
- Shape.
- Badge style.

### Proposed configuration

```tsx
fields.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  control: 'segmented',
})
```

### Controls

```text
select
radio
segmented
swatches
```

These are presentation choices, not field kinds.

### Font selection

A separate `font` kind is unnecessary when the template author provides a fixed set of allowed fonts:

```tsx
fields.choice({
  label: 'Typography',
  options: [
    {
      value: 'inter',
      label: 'Inter',
      preview: { fontFamily: 'Inter' },
    },
    {
      value: 'editorial',
      label: 'Editorial',
      preview: { fontFamily: 'Georgia' },
    },
  ],
})
```

### Alignment

A separate `alignment` kind is unnecessary. Alignment is a closed token set.

### Rules

- Every option value must be unique.
- The selected value must exist in the options.
- Labels may be translated.
- Values must remain stable when labels change.
- Visual previews are optional metadata.
- Dynamic options should not be added until persistence and validation behavior are defined.

---

## `boolean`

### Objective

Represent a real binary decision.

Examples:

- Show logo.
- Show previous price.
- Enable shadow.
- Use transparent background.
- Show discount badge.

### Proposed configuration

```tsx
fields.boolean({
  label: 'Show logo',
  defaultValue: true,
  control: 'switch',
})
```

### Controls

```text
switch
checkbox
```

### Why not use choice

A two-option choice can visually represent yes and no, but a boolean field provides:

- Correct runtime typing.
- Clear intent.
- Direct conditional rendering.
- Simpler validation.
- More natural controls.

### Rules

- The resolved value is always `boolean`.
- Boolean fields do not need `required`.
- Absence resolves through `defaultValue`.
- Tri-state values should be a `choice`, not a boolean.

---

## `color`

### Objective

Represent a color with validation and a visual editing control.

Examples:

- Background.
- Text.
- Accent.
- Border.
- Simple shadow color.

### Proposed configuration

```tsx
fields.color({
  label: 'Background color',
  defaultValue: '#ffffff',
  allowAlpha: false,
})
```

### Initial value format

Use a predictable format:

```text
#RRGGBB
```

Alpha may later use:

```text
#RRGGBBAA
```

### Why color remains separate from text

Although the runtime value is a string, color requires:

- Visual picker.
- Specific validation.
- Preview.
- Normalization.
- Optional alpha support.
- Possible palette restrictions.

### Optional palette

A field may restrict values:

```tsx
fields.color({
  label: 'Brand color',
  palette: ['#112233', '#445566', '#ffffff'],
  control: 'swatches',
})
```

This remains a color field because the value is still a color, not an arbitrary choice token.

### Not included initially

- Gradients.
- CSS color functions.
- Theme token resolution.
- Complex shadow editors.

A gradient is a compound value and should be evaluated separately.

---

## `image`

### Objective

Allow Studio users to replace a project-owned image without reducing the workflow to a plain URL input.

Examples:

- Product photograph.
- Logo.
- Background image.
- Avatar.
- Illustration.

### Runtime value

The renderer receives a resolved browser URL as a `string`:

```tsx
render({ data }) {
  return data.productImage ? <img src={data.productImage} alt="" /> : null
}
```

The source file is selected by the field key and the template asset layout:

```tsx
fields.image({ label: 'Product image', scope: 'variant' })
```

See [06. Assets and image field](./06-assets-and-image-field.md) for the
filesystem, manifest, and upload contract.

### Why image must be its own field

Images require:

- File selection.
- Preview.
- MIME validation.
- Dimensions.
- Loading state.
- Error state.
- Project asset resolution.
- Source file replacement during development.
- Asset manifest generation.

A URL text input cannot provide these guarantees.

### Initial feature set

The first image field should support:

- Common and variant project assets.
- Local file selection during `framekit dev`.
- Replace.
- Git-based restoration.
- Load and export error reporting.

Destructive cropping can remain out of scope initially.

---

## Structures that are not fields

### Group

A group organizes controls in Studio but produces no runtime value.

It belongs under UI metadata.

### Array or repeater

A collection of repeated values is a compound structure with its own contract.

It should not be introduced with the basic fields.

### Computed value

A derived value belongs in template code or helper functions.

It is not editable and should not appear as a field.

### Hidden value

A value not exposed to Studio should come from metadata, defaults, or code.

It is not a control.

## Type inference

The contract should infer the runtime value from the descriptor.

```ts
type InferFieldValue<Field> =
  Field extends TextFieldDescriptor ? string
  : Field extends NumberFieldDescriptor ? number
  : Field extends ChoiceFieldDescriptor ? string
  : Field extends BooleanFieldDescriptor ? boolean
  : Field extends ColorFieldDescriptor ? string
  : Field extends ImageFieldDescriptor ? string
  : never
```

```ts
type InferTemplateData<Fields> = {
  [Key in keyof Fields]: InferFieldValue<Fields[Key]>
}
```

Example:

```tsx
render({ data }) {
  data.title
  // string

  data.opacity
  // number

  data.showLogo
  // boolean

  data.productImage
  // string URL
}
```

## Normalized internal descriptors

Convenience APIs should normalize before validation and rendering.

For example:

```tsx
fields.textarea(...)
fields.url(...)
```

may produce an internal text descriptor with `multiline` or `format`.

This keeps the public API friendly while reducing editor and validator duplication.

## Migration from the current contract

During the 0.x line:

- `fields.textarea` remains available.
- `fields.url` remains available.
- Their internal descriptors normalize to `text`.
- Existing string-based number data receives a documented migration.
- `framekit migrate` may update field definitions.
- The 1.0 contract should not expose duplicate internal kinds.

Changing numbers from strings to numbers is a breaking contract change and must be handled explicitly.

## Completion criteria

- `kind` represents semantics.
- `control` represents Studio presentation.
- Textarea and URL behavior normalize to text.
- Slider behavior is implemented by number.
- Select, radio, segmented controls, and swatches can use choice.
- Font and alignment can use choice.
- Boolean resolves to `boolean`.
- Number resolves to `number`.
- Image resolves to a project asset URL string.
- Renderer data types are inferred correctly.
- Studio uses a registry rather than a large central switch.
