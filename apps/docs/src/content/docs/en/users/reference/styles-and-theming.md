---
title: Styles and theming
description: Import FrameKit's public stylesheet and use its published design tokens and theme behavior.
sidebar:
  order: 4
---

## Public stylesheet

Import the single supported CSS entrypoint from the application's global stylesheet:

```css
@import '@mauriciodmo/framekit/styles.css';
```

The export is shared CSS for the application. Import it once; do not import a package `src/` stylesheet.

## Design tokens

The stylesheet publishes FrameKit's palette as Tailwind theme colors. The token names and current values are:

| Token | Value |
| --- | --- |
| `--color-fk-forest-100` | `#304a3e` |
| `--color-fk-forest-200` | `#243c31` |
| `--color-fk-forest-300` | `#173d31` |
| `--color-fk-forest-400` | `#10271f` |
| `--color-fk-mint-100` | `#e5f2e9` |
| `--color-fk-mint-200` | `#c8f7d9` |
| `--color-fk-mint-300` | `#77c99a` |
| `--color-fk-sage-100` | `#e6eee9` |
| `--color-fk-sage-200` | `#b8c8be` |
| `--color-fk-sage-300` | `#91ae9f` |
| `--color-fk-sage-400` | `#59665f` |
| `--color-fk-ivory-100` | `#faf9f5` |
| `--color-fk-ivory-200` | `#f0eee7` |
| `--color-fk-ivory-300` | `#d9d7cf` |
| `--color-fk-ivory-400` | `#cbd5ce` |

These names are available as Tailwind color utilities after the stylesheet is imported, for example `bg-fk-forest-400` and `text-fk-mint-200`.

## Light and dark theme

`FrameKitStudioRoot` applies the `dark` class to the document from the `theme` cookie or the user's `prefers-color-scheme` preference. FrameKit's stylesheet defines the `dark` variant for that class. Components can provide both forms of a utility, for example:

```tsx
<main className="bg-fk-ivory-200 text-fk-forest-400 dark:bg-fk-forest-400 dark:text-fk-sage-100">
  Content
</main>
```

For the integration point, see [the existing-project guide](/en/users/getting-started/existing-project). For the stylesheet package entrypoint, see [stylesheet package API](/en/users/reference/package-api/styles).
