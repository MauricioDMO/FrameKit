---
title: Referencia de Markdown
description: Consulta el subconjunto de Markdown compatible que renderiza el componente público Markdown de FrameKit.
sidebar:
  order: 2
---

Importa `Markdown` desde el paquete raíz publicado:

```tsx
import { Markdown } from '@mauriciodmo/framekit'
```

## Propiedades

```ts
interface MarkdownProps {
  value: string
  lists?: boolean
  className?: string
  style?: React.CSSProperties
}
```

- `value` es la cadena que se renderiza y es obligatoria.
- `lists` tiene `false` como valor predeterminado. Establécelo en `true` para analizar bloques de líneas y listas.
- `className` se aplica al elemento externo.
- `style` se aplica al elemento externo.

Si `lists` se omite o es `false`, el componente renderiza el formato en línea dentro de un `span`. Con `lists={true}`, renderiza los bloques analizados dentro de un `div`.

## Formato en línea compatible

El analizador reconoce estas formas no vacías en una misma línea:

| Sintaxis | Resultado |
| --- | --- |
| `**text**` | `<strong>` |
| `*text*` | `<em>` |
| `_text_` | `<em>` |
| `~~text~~` | `<del>` |

El resto del texto se renderiza como texto. El subconjunto compatible no incluye enlaces, encabezados, fragmentos de código, bloques de código, citas, tablas ni sintaxis Markdown anidada.

```tsx
<Markdown value="A **strong** and *emphasized* ~~removed~~ message." />
```

## Listas y bloques de líneas

El análisis de listas se habilita explícitamente:

```tsx
<Markdown
  lists
  value={'Choose one:\n- First option\n- Second option\n\n1. One\n2. Two'}
/>
```

Los marcadores de lista compatibles son:

- listas no ordenadas: `-` o `*`, seguidos de uno o más caracteres de espacio en blanco y un elemento no vacío;
- listas ordenadas: uno o más dígitos seguidos de `.` o `)`, después uno o más caracteres de espacio en blanco y un elemento no vacío.

Las líneas consecutivas del mismo tipo se agrupan en una sola lista. Las listas no ordenadas se renderizan como `<ul>` y las ordenadas como `<ol>`. Las líneas que no son listas se renderizan con formato en línea y, si no son el último bloque, van seguidas de un elemento `<br>`. No se admiten listas anidadas ni otras construcciones Markdown de bloque.

`Markdown` es un renderizador para este contrato de entrada limitado, no un analizador Markdown general. Usa únicamente las formas descritas aquí cuando el contenido deba renderizarse de forma consistente en una plantilla o un componente de marca.
