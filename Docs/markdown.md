# Markdown en campos de texto

[Volver al índice](README.md)

Los valores de campos `text` y `textarea` guardan Markdown como texto literal. Para mostrarlo en el PNG y la vista previa, la plantilla debe renderizar ese valor con el componente `Markdown`.

## Sintaxis compatible

| Resultado | Sintaxis |
| --- | --- |
| Negrita | `**texto**` |
| Cursiva | `*texto*` o `_texto_` |
| Tachado | `~~texto~~` |
| Salto de línea | Nueva línea en un `textarea` |
| Lista no ordenada | `- elemento` o `* elemento` en un `textarea` |
| Lista ordenada | `1. elemento` o `1) elemento` en un `textarea` |

No se interpreta HTML, enlaces, encabezados, tablas ni listas anidadas. React escapa el contenido sin formato, por lo que no se inyecta HTML del usuario.

## Renderizar en una plantilla

Cuando el paquete esté extraído, importa el componente desde `@mauriciodmo/framekit` y pásale el valor del campo:

```tsx
import { Markdown } from '@mauriciodmo/framekit'

<Markdown
  value={data.eyebrow}
  className="text-sm uppercase tracking-[0.2em]"
/>

<Markdown
  value={data.description}
  lists
  className="text-2xl leading-relaxed"
/>
```

Sin `lists`, `Markdown` produce un `span` con formato en línea. Con `lists`, produce un `div` que reconoce listas y saltos de línea; úsalo como bloque, no dentro de un `p` o un encabezado.

La negrita se representa como `font-semibold` dentro del componente. No añadas selectores como `[&_strong]:...` en cada plantilla salvo que un diseño necesite una excepción deliberada.

## Cuándo usarlo

- Usa `Markdown` para cada valor de `data` cuyo campo sea `text` o `textarea` y deba admitir formato.
- Añade `lists` solo a valores de `textarea` que deban admitir listas o saltos de línea.
- Conserva los valores `url`, `color` y `number` como datos directos; no los envíes a `Markdown`.
