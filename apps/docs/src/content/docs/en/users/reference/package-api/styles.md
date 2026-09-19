---
title: Stylesheet package API
description: Import FrameKit's supported global stylesheet entrypoint.
sidebar:
  order: 10
---

**Import:** `@mauriciodmo/framekit/styles.css`  
**Environment:** shared stylesheet; import it from the application's global CSS or layout.

The stylesheet is the package's published CSS entrypoint. It provides the base styles and published FrameKit palette used by Studio and editor surfaces.

## Minimal example

```css
@import '@mauriciodmo/framekit/styles.css';
```

## Bundle and runtime constraints

This entrypoint is CSS, not a JavaScript module. Import it once from the global stylesheet or layout that owns the application styles; do not import an internal `src/` stylesheet. The public package export is `styles.css`.

See [integrating an existing Next.js project](/en/users/getting-started/existing-project), [Use Studio](/en/users/guides/use-studio), and the [package API index](/en/users/reference/package-api).
