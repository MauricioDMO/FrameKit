---
title: Crear un componente de marca
description: Añade, documenta, crea una vista previa, genera y consume un componente de marca reutilizable de FrameKit.
sidebar:
  order: 2
---

Usa un componente de marca cuando el mismo patrón visual o de comunicación del código fuente del proyecto pertenece a más de una plantilla. Conserva los elementos gráficos de un solo uso en su plantilla. Los componentes de marca y las plantillas tienen contratos de descubrimiento y consumo distintos: un componente de marca se descubre desde `component.tsx` y se consume mediante una vista previa o una importación directa del proyecto; una plantilla se descubre desde `template.tsx` y es propietaria de la definición de salida. Consulta la [definición de plantilla](/es/users/concepts/templates/definition) cuando el trabajo sea específico de una plantilla.

## 1. Crea el directorio

Crea el directorio hoja debajo de `src/brand/` usando la estructura del proyecto que espera el descubrimiento:

```text
src/brand/communication/hero/
├── README.md
├── component.tsx
└── preview.tsx
```

Consulta el [concepto de componentes de marca](/es/users/concepts/brand-components) para conocer las reglas exactas de descubrimiento y nombres.

## 2. Escribe el componente

El componente debe aceptar entradas semánticas y reutilizables. Usa el punto de entrada publicado del paquete para los componentes de FrameKit:

```tsx
// src/brand/communication/hero/component.tsx
import { Markdown } from '@mauriciodmo/framekit'

export interface BrandHeroProps {
  eyebrow: string
  title: string
  description: string
  accentColor?: string
}

export function BrandHero ({ eyebrow, title, description, accentColor = '#c8f7d9' }: BrandHeroProps) {
  return (
    <section>
      <Markdown value={eyebrow} style={{ color: accentColor }} />
      <Markdown value={title} lists />
      <Markdown value={description} lists />
    </section>
  )
}
```

No añadas dimensiones propias de la plantilla, etiquetas de plataforma, controles de exportación ni llamadas a la acción solo para facilitar el primer consumidor. La plantilla consumidora proporciona su canvas, campos, contenido, variantes, assets y composición circundante.

## 3. Añade el README

Añade el `README.md` requerido en el directorio hoja e incluye cerca del principio un resumen independiente para que el catálogo generado tenga una descripción útil:

```md
# Hero

Bloque editorial reutilizable para un mensaje de marca con una etiqueta breve, un título y una descripción.

## Entradas

- `eyebrow`: etiqueta breve.
- `title`: titular; se admite Markdown.
- `description`: texto de apoyo; se admiten listas de Markdown.
- `accentColor`: color de acento opcional.
```

Consulta el [concepto de componentes de marca](/es/users/concepts/brand-components) y la [referencia del catálogo de marcas](/es/users/reference/brand-catalog) para conocer las reglas exactas del README y la descripción.

## 4. Añade la vista previa

Añade una vista previa que exporte por defecto un componente de React y reutilice el componente con props estáticas representativas:

```tsx
// src/brand/communication/hero/preview.tsx
import { BrandHero } from './component'

export default function Preview () {
  return (
    <div>
      <BrandHero
        eyebrow="NUEVO / FRAMEKIT"
        title="Diseña imágenes con **React**"
        description="Contenido visual reutilizable para plantillas coherentes."
      />
    </div>
  )
}
```

Consulta la [referencia del catálogo de marcas](/es/users/reference/brand-catalog) para conocer el contrato del cargador y del catálogo generados.

## 5. Genera el catálogo

Desde la raíz del proyecto, genera los módulos desechables:

```bash
pnpm framekit generate
```

El comando escribe `src/generated/framekit/brands.ts` como parte de la salida generada. Consulta la [referencia del catálogo de marcas](/es/users/reference/brand-catalog) para conocer el contrato del módulo generado.

No edites los archivos generados. Corrige el componente fuente, la vista previa o el README y vuelve a ejecutar el comando.

## 6. Consume el componente en una plantilla

Importa el código fuente del proyecto mediante el alias `@/*` del proyecto y conserva las decisiones específicas de la plantilla en `template.tsx`:

```tsx
import { BrandHero } from '@/brand/communication/hero/component'

render ({ data }) {
  return (
    <main>
      <BrandHero
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
        accentColor={data.accentColor}
      />
    </main>
  )
}
```

La plantilla sigue siendo responsable de declarar esos campos y sus dimensiones, contenido, variantes, assets y composición circundante. La [guía para crear una plantilla](/es/users/guides/create-template) cubre la definición completa de la plantilla.

Para conocer las reglas exactas de directorios, README, módulos generados y cargadores, consulta el [concepto de componentes de marca](/es/users/concepts/brand-components) y la [referencia del catálogo de marcas](/es/users/reference/brand-catalog). El formato `Markdown` aceptado por el ejemplo se documenta en la [referencia de Markdown](/es/users/reference/markdown).
