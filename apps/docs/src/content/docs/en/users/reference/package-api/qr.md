---
title: QR code API
description: Render QR codes inside FrameKit templates with a layout-friendly wrapper and safe defaults.
sidebar:
  order: 10
---

Import the QR component from the dedicated browser-facing entrypoint:

```tsx
import { QRCode } from '@mauriciodmo/framekit/qr'
```

`QRCode` renders a `div` wrapper containing an SVG QR code. FrameKit uses `qrcode.react` internally, so consumers do not install or import that implementation package directly.

## Use QR data in a template

QR content remains ordinary text in the template contract. Use `field.text()` for editable content and convert it to a QR code only when rendering:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'
import { QRCode } from '@mauriciodmo/framekit/qr'

export default defineTemplate({
  meta: { title: 'QR card' },
  width: 1080,
  height: 1080,
  fields: {
    qrValue: field.text({
      label: 'QR content',
      required: true
    })
  },
  content: {
    default: {
      qrValue: 'https://example.com'
    }
  },
  variants: { default: 'default' },
  render ({ data }) {
    return (
      <div className="relative h-full w-full">
        <QRCode
          value={data.qrValue}
          size={180}
          className="absolute bottom-8 right-8 rounded-xl bg-white p-3"
        />
      </div>
    )
  }
})
```

There is no `field.qr()`. The stored value is a string; the QR code is its visual representation.

## Wrapper and SVG styling

`className`, `style`, `id`, `aria-*`, `data-*`, and the other supported `div` attributes are forwarded to the wrapper. This makes positioning and decoration straightforward with Tailwind or regular CSS:

```tsx
<QRCode
  value={data.qrValue}
  size={200}
  className="absolute bottom-10 right-10 rounded-2xl bg-white p-4 shadow-lg"
/>
```

Use `qrClassName` only when you need to target the generated SVG itself:

```tsx
<QRCode
  value={data.qrValue}
  className="w-fit"
  qrClassName="block"
/>
```

`size` controls the SVG's pixel width and height. Wrapper classes do not replace the `size` prop.

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

FrameKit intentionally defaults to error-correction level `M` and a four-module quiet zone. You can override both when a template has different requirements.

For server-generated PNGs, no separate QR image endpoint is needed. The QR SVG is rendered with the rest of the React template and is captured by FrameKit's existing PNG rendering pipeline.
