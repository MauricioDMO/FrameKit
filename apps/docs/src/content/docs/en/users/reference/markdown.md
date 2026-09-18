---
title: Markdown reference
description: Reference the supported Markdown subset rendered by FrameKit's public Markdown component.
sidebar:
  order: 2
---

Import `Markdown` from the published root package:

```tsx
import { Markdown } from '@mauriciodmo/framekit'
```

## Props

```ts
interface MarkdownProps {
  value: string
  lists?: boolean
  className?: string
  style?: React.CSSProperties
}
```

- `value` is the string to render and is required.
- `lists` defaults to `false`. Set it to `true` to parse line blocks and lists.
- `className` is applied to the outer element.
- `style` is applied to the outer element.

With `lists` omitted or `false`, the component renders inline formatting inside a `span`. With `lists={true}`, it renders parsed blocks inside a `div`.

## Supported inline formatting

The parser recognizes these non-empty, same-line forms:

| Syntax | Result |
| --- | --- |
| `**text**` | `<strong>` |
| `*text*` | `<em>` |
| `_text_` | `<em>` |
| `~~text~~` | `<del>` |

All other text is rendered as text. The supported subset does not include links, headings, code spans, code fences, blockquotes, tables, or nested Markdown syntax.

```tsx
<Markdown value="A **strong** and *emphasized* ~~removed~~ message." />
```

## Lists and line blocks

List parsing is enabled explicitly:

```tsx
<Markdown
  lists
  value={'Choose one:\n- First option\n- Second option\n\n1. One\n2. Two'}
/>
```

The supported list markers are:

- unordered: `-` or `*`, followed by one or more whitespace characters and a non-empty item;
- ordered: one or more digits followed by `.` or `)`, then one or more whitespace characters and a non-empty item.

Consecutive list lines of the same kind are grouped into one list. Unordered lists render as `<ul>` and ordered lists as `<ol>`. Non-list lines are rendered with inline formatting, and parsed blocks are separated with `<br>` elements. Nested lists and other block-Markdown constructs are not supported.

`Markdown` is a renderer for this limited input contract, not a general Markdown parser. Use only the forms described here when content must render consistently in a template or brand component.
