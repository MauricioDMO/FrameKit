---
title: API de códigos QR
description: Renderiza códigos QR dentro de plantillas de FrameKit con un wrapper fácil de posicionar.
sidebar:
  order: 10
---

Importa `QRCode` desde su entrypoint dedicado:

```tsx
import { QRCode } from '@mauriciodmo/framekit/qr'
```

`QRCode` renderiza un código QR SVG dentro de un `div` que puedes posicionar y estilizar.

## Usa un código QR en una plantilla

Usa `field.text()` cuando el contenido del QR deba ser editable y pasa el valor a `QRCode` al renderizar:

```tsx
fields: {
  website: field.text({
    label: 'Sitio web',
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

## Posicionamiento y estilos

`className`, `style`, `id`, `aria-*`, `data-*` y los demás atributos compatibles de `div` se aplican al contenedor. Usa `qrClassName` para estilizar directamente el SVG generado:

```tsx
<QRCode
  value={data.website}
  size={200}
  className="absolute bottom-10 right-10 rounded-2xl bg-white p-4"
  qrClassName="block"
/>
```

`size` controla el ancho y alto del SVG en píxeles.

## Props

| Prop | Tipo | Predeterminado | Uso |
| --- | --- | --- | --- |
| `value` | `string` | requerido | Texto codificado dentro del QR. |
| `size` | `number` | `128` | Ancho y alto del SVG en píxeles. |
| `level` | `'L' \| 'M' \| 'Q' \| 'H'` | `'M'` | Nivel de corrección de errores. |
| `foreground` | `string` | `'#000000'` | Color frontal del QR. |
| `background` | `string` | `'#ffffff'` | Color de fondo del QR. |
| `margin` | `number` | `4` | Tamaño de la zona silenciosa en módulos QR. |
| `qrClassName` | `string` | — | Clase aplicada directamente al SVG. |
| `...divProps` | atributos de `div` | — | Layout, estilos, accesibilidad y atributos de datos del wrapper. |
