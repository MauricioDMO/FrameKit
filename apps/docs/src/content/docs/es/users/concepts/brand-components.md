---
title: Componentes de marca
description: Comprende la estructura del código fuente, el contrato de descubrimiento y el modelo de vista previa de los componentes de marca reutilizables de FrameKit.
sidebar:
  order: 3
---

Los componentes de marca son componentes React reutilizables del código fuente del proyecto para un lenguaje visual o un patrón de comunicación. No son plantillas: un componente de marca no define un lienzo de exportación, campos editables, variantes ni metadatos de plantilla. Mantén esas decisiones en la plantilla que lo consume. Consulta la [definición de plantilla](/es/users/concepts/templates/definition) para conocer ese contrato separado.

## Estructura del código fuente

Los componentes de marca se descubren recursivamente debajo de `src/brand/`:

```text
src/brand/
├── README.md
└── <domain>/<component>/
    ├── README.md
    ├── component.tsx
    └── preview.tsx
```

Los nombres entre `src/brand/` y la hoja son segmentos de directorio. Cada segmento visible que no se ignore debe coincidir con `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Los directorios que comienzan con `.` o `_` se omiten. Un directorio que contiene `component.tsx` es una hoja; el descubrimiento no continúa por debajo de ella.

Si `src/brand/` no existe, el descubrimiento no devuelve componentes. Para cada hoja, el descubrimiento requiere `preview.tsx` y `README.md` junto a `component.tsx`. La ausencia de archivos o un segmento visible no válido hace que el descubrimiento falle.

Para una hoja descubierta:

- `slug` es la ruta de segmentos separados por barras;
- `segments` es el arreglo de segmentos original;
- `title` humaniza el segmento final, de modo que `social-card` se convierte en `Social Card`; y
- las entradas se ordenan por slug.

## Archivos del componente y de la vista previa

`component.tsx` contiene el componente reutilizable. Sus props describen el mensaje o patrón visual reutilizable, no un canal o una plantilla concretos. La importación pública actual del componente es:

```tsx
import { Markdown } from '@mauriciodmo/framekit'

export interface BrandHeroProps {
  eyebrow: string
  title: string
  description: string
  accentColor?: string
}
```

La implementación del componente puede usar `Markdown` y otras dependencias del proyecto. El escáner de descubrimiento no ejecuta ni valida las props del componente.

`preview.tsx` debe exportar por defecto un componente React. El cargador de marcas generado importa este módulo de vista previa y el catálogo renderiza su exportación por defecto. Una vista previa normalmente importa y renderiza el componente ubicado en el mismo directorio con props estáticas representativas:

```tsx
import { BrandHero } from './component'

export default function Preview () {
  return (
    <BrandHero
      eyebrow="NEW / FRAMEKIT"
      title="Design images with **React**"
      description="Reusable visual content for consistent templates."
    />
  )
}
```

El cargador no importa `component.tsx` directamente. Carga `preview.tsx`; la vista previa es responsable de componer el componente reutilizable.

## El README ubicado junto al componente

El `README.md` de la hoja es obligatorio y proporciona la descripción del catálogo. El descubrimiento recorta cada línea de entrada antes de procesarla, luego lee el primer párrafo de prosa y une sus líneas recortadas con espacios. Una línea vacía, un encabezado, un elemento de lista o una línea cuyo contenido recortado comienza con tres acentos graves termina ese párrafo; el contenido posterior no se usa. Esta es la comprobación específica del analizador para tres acentos graves, no una compatibilidad con formas arbitrarias de cercos Markdown. Los enlaces se reducen a su texto, y se eliminan los acentos graves y los caracteres `*`, `_` y `~`. Un resultado vacío hace que el descubrimiento falle.

Mantén útil el primer párrafo sin depender del resto del archivo; después documenta las entradas y restricciones:

```md
# Hero

Reusable editorial block for a brand message with an eyebrow, title, and description.

## Inputs

- `title`: headline text; Markdown is supported.
- `description`: supporting copy; Markdown lists are supported.
```

Los README de los directorios padre pueden describir la taxonomía, pero el escáner solo requiere el README de una hoja.

## El descubrimiento no es la creación de plantillas

Las plantillas se descubren en directorios que contienen `template.tsx` debajo de `src/templates/`, y luego se resumen en entradas del registro de plantillas. Las hojas de marca se descubren en directorios que contienen `component.tsx` y se representan mediante cargadores de vistas previas y metadatos del README. Un componente de marca se consume importando su código fuente del proyecto en una plantilla, no añadiendo campos de marca al registro de plantillas generado:

```tsx
import { BrandHero } from '@/brand/communication/hero/component'

// Inside a template render function:
return (
  <BrandHero
    eyebrow={data.eyebrow}
    title={data.title}
    description={data.description}
  />
)
```

La plantilla sigue siendo propietaria de sus dimensiones, campos, contenido, variantes, assets y composición circundante. Consulta la [guía para crear una plantilla](/es/users/guides/create-template) para conocer esas reglas.
