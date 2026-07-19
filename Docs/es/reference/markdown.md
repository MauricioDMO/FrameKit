# Componente Markdown

[Volver al índice](../README.md)

`import { Markdown } from '@mauriciodmo/framekit'`

```tsx
Markdown(props: {
  value: string
  lists?: boolean
  className?: string
  style?: React.CSSProperties
}): React.ReactElement
```

La implementación no usa APIs exclusivas del navegador ni tiene la directiva `use client`, por lo que puede renderizarse en un componente de servidor o en código React del cliente cuando el límite del framework lo permita.

## Propósito

El componente `Markdown` proporciona formato de texto en línea ligero para contenido de plantillas. **No** es un renderizador completo de CommonMark — soporta un subconjunto limitado de sintaxis en línea y, opcionalmente, bloques de lista básicos.

## Sin la prop `lists`

Renderiza como un `<span>`. Soporta la siguiente sintaxis en línea:

| Resultado | Sintaxis              |
| --------- | --------------------- |
| Negrita   | `**texto**`           |
| Énfasis   | `*texto*` o `_texto_` |
| Tachado   | `~~texto~~`           |

```tsx
function render() {
  return (
    <Markdown
      value={data.eyebrow}
      className="text-sm uppercase tracking-[0.2em]"
    />
  )
}
```

## Con `lists={true}`

Renderiza como un `<div>`. Las líneas que no son de lista se renderizan seguidas de un `<br>` salvo que sean el bloque final. Soporta toda la sintaxis en línea anterior además de líneas de lista consecutivas:

| Resultado       | Sintaxis                                            |
| --------------- | --------------------------------------------------- |
| Lista sin orden | `- elemento` o `* elemento` (líneas consecutivas)   |
| Lista ordenada  | `1. elemento` o `1) elemento` (líneas consecutivas) |

```tsx
function render() {
  return (
    <Markdown
      value={data.description}
      lists
      className="text-2xl leading-relaxed"
    />
  )
}
```

## Lo que NO está soportado

El componente **no** parsea ni renderiza:

- Etiquetas HTML
- Enlaces (`[texto](url)`)
- Encabezados (`#`, `##`, etc.)
- Tablas
- Bloques de código (inline `` ` `` o cercados ``` ```)
- Listas anidadas
- Sintaxis de escape (`\*`, `\[`, etc.)

## Seguridad

El componente no parsea HTML arbitrario. El contenido pasado a `value` se escapa antes de renderizar, lo que significa que no hay riesgo de XSS desde cadenas de contenido de plantilla.

---

[English](../../en/reference/markdown.md) · [Español](./markdown.md)
