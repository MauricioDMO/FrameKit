# FrameKit Markdown

`Markdown` is a small, escaped formatter for editable copy. It is a render component, not a field kind: `text` and `textarea` values remain plain strings until the template passes them to `Markdown`.

```tsx
import { Markdown } from '@mauriciodmo/framekit'

<Markdown value={data.description} />
```

## Props

- `value` — the string to format.
- `lists` — when `true`, parses consecutive ordered or unordered list lines. Defaults to `false`.
- `className` — class applied to the root `span` or `div`.
- `style` — inline styles applied to the root element.

Without `lists`, the component renders a `span`. Inline formatting supports:

- `**strong**` for `<strong>`.
- `*emphasis*` and `_emphasis_` for `<em>`.
- `~~deletion~~` for `<del>`.

With `lists={true}`, consecutive lines using `- item` or `* item` render as an unordered list, and lines using `1. item` or `1) item` render as an ordered list. The root element is a `div`; non-list lines retain line breaks.

The parser escapes content instead of rendering arbitrary HTML. It does not support HTML, links, headings, tables, code blocks, nested lists, or escape syntax.
