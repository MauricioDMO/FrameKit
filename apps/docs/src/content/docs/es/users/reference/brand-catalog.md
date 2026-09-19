---
title: Referencia del catálogo de marcas
description: Consulta el descubrimiento de marcas, los módulos de catálogo generados, los cargadores y el comportamiento de un catálogo vacío.
sidebar:
  order: 3
---

FrameKit descubre componentes de marca reutilizables debajo de `src/brand/` y genera metadatos del catálogo y cargadores de vistas previas para los consumidores del proyecto. Este es un contrato de código fuente y generación de código; es independiente del [registro de plantillas](/es/users/concepts/templates/generated-registry).

## Contrato de descubrimiento

El escáner visita recursivamente `src/brand/`:

```text
src/brand/
└── <segment>/...
    ├── component.tsx
    ├── preview.tsx
    └── README.md
```

Las reglas exactas son:

- Si `src/brand/` no existe, el descubrimiento devuelve `[]`.
- Los archivos se ignoran durante el recorrido.
- Se omiten los directorios cuyo nombre comienza por `.` o `_`.
- Cada otro segmento de directorio visitado debe coincidir con `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Un segmento visible no válido hace que el descubrimiento falle.
- Un directorio que contiene `component.tsx` es una hoja. También debe contener `preview.tsx` y `README.md`, y el descubrimiento no continúa por debajo de ella.
- El `README.md` de la hoja se lee como UTF-8. Cada línea de entrada se recorta antes de procesarla, y el primer párrafo de líneas ordinarias se une con espacios. Las líneas en blanco, los encabezados, los marcadores de lista (`- `, `* ` o un marcador ordenado con un número seguido de `. ` o `) `) y las líneas cuyo contenido recortado comienza con tres acentos graves terminan el párrafo. Esta es una comprobación de prefijo de tres acentos graves, no una compatibilidad con formas arbitrarias de cercos Markdown. El contenido posterior se ignora.
- Antes de guardar la descripción, `[text](url)` se convierte en `text`, se eliminan los acentos graves y `*`, `_` y `~`, y el resultado se recorta. La ausencia de una descripción hace que el descubrimiento falle.
- `slug` es la ruta separada por barras, `segments` es el arreglo original y el segmento final se convierte en texto legible para humanos para `title`, capitalizando cada palabra separada por guiones.
- Las entradas descubiertas se ordenan mediante `slug.localeCompare(...)`.

Las comprobaciones de descubrimiento verifican las rutas requeridas y la descripción del README. No ejecutan ni validan la implementación de `component.tsx`; el cargador generado espera que la exportación predeterminada del módulo de vista previa se pueda usar como componente de React.

## Módulo de marca generado

El generador compartido escribe:

```text
src/generated/framekit/brands.ts
```

El módulo generado exporta las siguientes formas actuales:

```ts
type BrandLoader = () => Promise<{ default: unknown }>

export const brands: Array<{
  slug: string
  title: string
  segments: string[]
  description: string
  load: BrandLoader
}>

export const brandManifest: Array<{
  slug: string
  title: string
  segments: string[]
  description: string
}>

export const brandRegistry: Record<string, BrandLoader>
```

La función `load` de cada entrada de `brands` importa dinámicamente el módulo `preview.tsx` de la hoja. `brandManifest` contiene los mismos metadatos sin `load`. `brandRegistry` asigna cada slug a su cargador de vista previa. El archivo generado es desechable: cambia `src/brand/` y vuelve a generar en lugar de editarlo.

El comando de generación compartido sigue requiriendo al menos una plantilla descubierta. Si un proyecto tiene plantillas pero no tiene el directorio `src/brand/` o no tiene hojas de marca, la generación se realiza correctamente y produce un módulo vacío:

```ts
brands // []
brandManifest // []
brandRegistry // {}
```

## Consumir el catálogo generado

El módulo generado se puede consumir mediante la ruta del módulo generado del proyecto. Sus entradas coinciden con el contrato publicado `FrameKitStudioBrand`, y cada entrada se puede buscar y cargar de forma independiente:

```tsx
import type { FrameKitStudioBrand } from '@mauriciodmo/framekit/studio'
import { brandRegistry, brands } from '@/generated/framekit/brands'

export function findBrand (slug: string): FrameKitStudioBrand | undefined {
  return brands.find((brand) => brand.slug === slug)
}

export async function loadBrandPreview (slug: string): Promise<unknown | undefined> {
  const load = brandRegistry[slug]
  return load === undefined ? undefined : (await load()).default
}
```

Para una entrada de marca seleccionada, el consumidor carga la vista previa mediante `load`. El catálogo usa el título generado y la descripción del README, y renderiza la exportación predeterminada cargada como vista previa. El catálogo no crea un contrato editable de props para el componente de marca.

## Salida de marca frente a salida de plantilla

Ambos módulos se escriben en `src/generated/framekit/`, pero representan contratos diferentes:

| Salida | Límite de origen | Entradas y cargador |
| --- | --- | --- |
| `brands.ts` | Un directorio hoja que contiene `component.tsx` | `slug`, `title`, `segments`, `description` y un cargador para `preview.tsx` |
| `templates.ts` | Un directorio que contiene `template.tsx` | Metadatos `TemplateRegistryEntry`, dimensiones, variantes, assets y un cargador para `template.tsx` |

Las entradas del catálogo de marcas no son definiciones de plantillas ni forman parte del renderizado de plantillas o de los manifiestos de assets de plantilla.
