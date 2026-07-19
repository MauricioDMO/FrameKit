# Markdown Component

[Back to index](../index.md)

`import { Markdown } from '@mauriciodmo/framekit'`

## Purpose

The `Markdown` component provides lightweight inline text formatting for template content. It is **not** a full CommonMark renderer — it supports a narrow subset of inline syntax and, optionally, basic list blocks.

## Without the `lists` prop

Renders as a `<span>`. Supports the following inline syntax:

| Result   | Syntax               |
| -------- | -------------------- |
| Strong   | `**text**`           |
| Emphasis | `*text*` or `_text_` |
| Deletion | `~~text~~`           |

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

## With `lists={true}`

Renders as a `<div>` with `<br>` between lines. Supports all inline syntax above plus consecutive list lines:

| Result         | Syntax                                     |
| -------------- | ------------------------------------------ |
| Unordered list | `- item` or `* item` (consecutive lines)   |
| Ordered list   | `1. item` or `1) item` (consecutive lines) |

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

## What is NOT supported

The component does **not** parse or render:

- HTML tags
- Links (`[text](url)`)
- Headings (`#`, `##`, etc.)
- Tables
- Code blocks (inline `` ` `` or fenced ``` ```)
- Nested lists
- Escaping syntax (`\*`, `\[`, etc.)

## Safety

The component does not parse arbitrary HTML. Content passed to `value` is escaped before rendering, which means there is no XSS risk from template content strings.

---

[English](./markdown.md) · [Español](./es/reference/markdown.md)
