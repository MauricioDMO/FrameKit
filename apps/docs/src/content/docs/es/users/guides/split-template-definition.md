---
title: Separar la definición de una plantilla
description: Separa la definición de datos validada de un componente complejo de renderización de React.
sidebar:
  order: 2
---

Mantén una plantilla sencilla en línea. Cuando la renderización crezca hasta incluir componentes de artwork o funciones auxiliares, usa `defineTemplateBase` para la definición validada y conserva la llamada final a `defineTemplate` en el `template.tsx` detectable.

## Define la forma de los datos

Crea `definition.ts` junto a `template.tsx`:

```tsx
import { defineTemplateBase, field } from '@mauriciodmo/framekit'
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  meta: {
    title: 'Extracted social card',
    description: 'A reusable definition for a social card'
  },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Title' }),
    accentColor: field.color({ label: 'Accent', defaultValue: '#b9f8d2' })
  },
  content: {
    aurora: { title: 'Northern light' },
    desert: { title: 'Open horizon' }
  },
  variants: {
    default: 'aurora',
    labels: { aurora: 'Aurora', desert: 'Desert' }
  }
})

export type ArtworkProps = TemplateRenderProps<typeof templateBase>
```

`defineTemplateBase` valida la parte de la definición que comparte el renderizador. No añade `render`; la definición final proporciona esa función.

## Crea el componente de renderizado

Coloca el componente de React en `artwork.tsx`:

```tsx
import type { ArtworkProps } from './definition'

export function Artwork ({ data, variant, width, height }: ArtworkProps) {
  return (
    <article
      data-variant={variant}
      style={{ width, height, color: data.accentColor }}
    >
      {data.title}
    </article>
  )
}
```

Las props tipadas mantienen conectadas con la definición las claves de los campos, los valores de las opciones, las claves de las variantes y las dimensiones. El componente sigue siendo responsable de la salida de React; no sustituye el contrato de la plantilla.

## Conserva el punto de entrada detectable

Termina con `template.tsx`:

```tsx
import { defineTemplate } from '@mauriciodmo/framekit'

import { Artwork } from './artwork'
import { templateBase } from './definition'

export default defineTemplate({
  ...templateBase,
  render: Artwork
})
```

El directorio se detecta porque contiene `template.tsx`. Una vez encontrado, el directorio es un límite de plantilla, por lo que sus funciones auxiliares y subdirectorios no se analizan como plantillas independientes. Usa esta separación cuando mejore la división entre la definición de datos y el renderizado; una definición en línea sigue siendo la opción más pequeña para plantillas sencillas.

Consulta el [renderizado de plantillas](/es/users/concepts/templates/rendering) y la [referencia de plantillas](/es/users/reference/template) para conocer los tipos públicos y las restricciones.
