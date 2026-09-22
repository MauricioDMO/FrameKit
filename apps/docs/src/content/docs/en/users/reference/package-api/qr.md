---
title: QR code API
description: Render QR codes inside FrameKit templates with a layout-friendly wrapper.
sidebar:
  order: 10
---

Import `QRCode` from the dedicated entrypoint:

```tsx
import { QRCode } from '@mauriciodmo/framekit/qr'
```

`QRCode` renders an SVG QR code inside a `div` that you can position and style.

## Use a QR code in a template

Use `field.text()` when the QR content should be editable, then pass the value to `QRCode` when rendering:

```tsx
fields: {
  website: field.text({
    label: 'Website',
    required: true
  })
}
```

```tsx
<QRCode
  value={data.website}
  size={180}
  className="absolute bottom-8 right-8 rounded-xl bg-white p-3"
/>
```

## Positioning and styling

`className`, `style`, `id`, `aria-*`, `data-*`, and other supported `div` attributes are applied to the wrapper. Use `qrClassName` to style the generated SVG directly:

```tsx
<QRCode
  value={data.website}
  size={200}
  className="absolute bottom-10 right-10 rounded-2xl bg-white p-4"
  qrClassName="block"
/>
```

`size` controls the SVG width and height in pixels.

## Props

| Prop | Type | Default | Purpose |
| --- | --- | --- | --- |
| `value` | `string` | required | Text encoded into the QR code. |
| `size` | `number` | `128` | SVG width and height in pixels. |
| `level` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | Error-correction level. |
| `foreground` | `string` | `'#000000'` | QR foreground color. |
| `background` | `string` | `'#ffffff'` | QR background color. |
| `margin` | `number` | `4` | Quiet-zone size in QR modules. |
| `qrClassName` | `string` | — | Class name applied directly to the SVG. |
| `...divProps` | `div` attributes | — | Layout, styling, accessibility, and data attributes for the wrapper. |
