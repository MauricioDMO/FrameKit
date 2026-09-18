---
title: Template rendering
description: Use the typed data, asset manifest, variant, and fixed dimensions supplied to a template renderer.
sidebar:
  order: 7
---

The `render` function is the boundary between a template definition and its React output. FrameKit calls it with exactly these inputs:

```tsx
render({ data, assets, variant, width, height }) {
  return (
    <article style={{ width, height }}>
      {data.title}
    </article>
  )
}
```

- `data` contains every field key after resolution, with the value type inferred from that field;
- `assets` is the generated manifest with `common` and variant-keyed maps;
- `variant` is the selected content key, typed as the union of keys in `content`;
- `width` and `height` are the literal numeric dimensions from the definition.

The renderer should use `width` and `height` for the fixed output canvas. They are positive finite integers validated in the definition, not suggestions for a responsive size.

## Typed render data

The public `TemplateRenderProps` type describes the render boundary:

```tsx
import type { TemplateRenderProps } from '@mauriciodmo/framekit'

type Props = TemplateRenderProps<typeof template>
```

Text, color, image, and choice data are strings. Number data is finite numeric data, boolean data is boolean, and choice data is narrowed to the declared option values. Temporary malformed number input is not committed render data.

Field values are resolved from defaults, then the selected variant's content, then edits. An applicable discovered image asset is applied for an image field according to its scope and the asset precedence described in [template assets](/en/users/concepts/templates/assets).

The renderer is independent of editor-only state. It receives resolved values and the asset manifest; it does not receive a field descriptor, an edit object, or a UI locale. For the full contract, see [content and variants](/en/users/concepts/templates/content-and-variants) and the [template reference](/en/users/reference/template).
