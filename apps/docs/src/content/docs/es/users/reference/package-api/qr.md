---
title: API de códigos QR
description: Renderiza códigos QR dentro de plantillas de FrameKit con un wrapper fácil de posicionar y valores predeterminados seguros.
sidebar:
  order: 10
---

Importa el componente QR desde su entrypoint dedicado orientado al navegador:

```tsx
import { QRCode } from '@mauriciodmo/framekit/qr'
```

`QRCode` renderiza un `div` contenedor con un código QR SVG en su interior. FrameKit usa `qrcode.react` internamente, por lo que los consumidores no necesitan instalar ni importar directamente ese paquete de implementación.

## Usa datos QR en una plantilla

El contenido del QR sigue siendo texto normal dentro del contrato de la plantilla. Usa `field.text()` para el contenido editable y conviértelo en un QR únicamente al renderizar:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'
import { QRCode } from '@mauriciodmo/framekit/qr'

export default defineTemplate({
  meta: { title: 'Tarjeta QR' },
  width: 1080,
  height: 1080,
  fields: {
    qrValue: field.text({
      label: 'Contenido del QR',
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

No existe `field.qr()`. El valor almacenado es un string; el código QR es su representación visual.

## Estilos del wrapper y del SVG

`className`, `style`, `id`, `aria-*`, `data-*` y los demás atributos compatibles de `div` se reenvían al contenedor. Esto facilita el posicionamiento y la decoración con Tailwind o CSS normal:

```tsx
<QRCode
  value={data.qrValue}
  size={200}
  className="absolute bottom-10 right-10 rounded-2xl bg-white p-4 shadow-lg"
/>
```

Usa `qrClassName` únicamente cuando necesites modificar directamente el SVG generado:

```tsx
<QRCode
  value={data.qrValue}
  className="w-fit"
  qrClassName="block"
/>
```

`size` controla el ancho y alto en píxeles del SVG. Las clases del wrapper no sustituyen el prop `size`.

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

FrameKit usa de forma intencional el nivel de corrección `M` y una zona silenciosa de cuatro módulos como valores predeterminados. Puedes sobrescribir ambos cuando una plantilla tenga requisitos distintos.

Para PNG generados en el servidor no hace falta un endpoint separado para imágenes QR. El SVG se renderiza junto con el resto de la plantilla React y queda capturado por el pipeline de renderizado PNG que FrameKit ya utiliza.
