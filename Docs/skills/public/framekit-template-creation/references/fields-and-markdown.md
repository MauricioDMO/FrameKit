# Fields And Markdown

## Fields

Every field requires `label`. Optional shared options are `placeholder`, `required`, and `defaultValue`. Fields are required by default; use `required: false` to allow an empty value.

| Kind | Input | Additional constraints |
| --- | --- | --- |
| `fields.text` | Single-line text | None |
| `fields.textarea` | Multi-line text | None |
| `fields.number` | Numeric input | `min` and `max` are finite numbers; resolved data remains a string |
| `fields.color` | Color picker | Non-empty value must be `#RRGGBB` |
| `fields.url` | URL input | HTTP(S) absolute URL or root-relative `/path` only |

Use `fields.number({ label: 'Count', min: 0, max: 100 })` for bounded numeric input. Parse the string in `data` when rendering needs numeric arithmetic.

## Markdown

```tsx
import { Markdown } from '@mauriciodmo/framekit'
```

`<Markdown value={data.copy} />` renders a `span` with inline `**strong**`, `*emphasis*` or `_emphasis_`, and `~~deletion~~`.

Use `lists` for consecutive `- item`/`* item` lines or `1. item`/`1) item` lines. It renders a `div`; non-list lines end in a line break except the last one.

Markdown does not support HTML, links, headings, tables, code, nested lists, or escaping syntax. It escapes content strings rather than rendering arbitrary HTML.
