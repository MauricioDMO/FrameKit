---
title: Brand components
description: Understand the source layout, discovery contract, and preview model for reusable FrameKit brand components.
sidebar:
  order: 3
---

Brand components are reusable project-source React components for a visual language or communication pattern. They are not templates: a brand component does not define an export canvas, editable fields, variants, or template metadata. Keep those decisions in the consuming template. See the [template definition](/en/users/concepts/templates/definition) for that separate contract.

## Source layout

Brand components are discovered recursively below `src/brand/`:

```text
src/brand/
├── README.md
└── <domain>/<component>/
    ├── README.md
    ├── component.tsx
    └── preview.tsx
```

The names between `src/brand/` and the leaf are directory segments. Each non-ignored segment must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Directories beginning with `.` or `_` are skipped. A directory containing `component.tsx` is a leaf; discovery does not recurse below it.

If `src/brand/` does not exist, discovery returns no components. For every leaf, discovery requires `preview.tsx` and `README.md` beside `component.tsx`. Missing files or an invalid visible segment fail discovery.

For a discovered leaf:

- `slug` is the slash-separated segment path;
- `segments` is the original segment array;
- `title` humanizes the final segment, so `social-card` becomes `Social Card`; and
- entries are sorted by slug.

## Component and preview files

`component.tsx` contains the reusable component. Its props describe the reusable message or visual pattern, not a particular channel or template. The current public component import is:

```tsx
import { Markdown } from '@mauriciodmo/framekit'

export interface BrandHeroProps {
  eyebrow: string
  title: string
  description: string
  accentColor?: string
}
```

The component implementation can use `Markdown` and other project dependencies. The discovery scanner does not execute or validate the component's props.

`preview.tsx` must default-export a React component. The generated brand loader imports this preview module, and the catalog renders its default export. A preview normally imports and renders the colocated component with representative static props:

```tsx
import { BrandHero } from './component'

export default function Preview () {
  return (
    <BrandHero
      eyebrow="NEW / FRAMEKIT"
      title="Design images with **React**"
      description="Reusable visual content for consistent templates."
    />
  )
}
```

The loader does not import `component.tsx` directly. It loads `preview.tsx`; the preview is responsible for composing the reusable component.

## The colocated README

The leaf `README.md` is required and supplies the catalog description. Discovery trims each input line before processing it, then reads the first prose paragraph and joins its trimmed lines with spaces. A blank line, heading, list item, or a line whose trimmed content begins with triple backticks ends that paragraph; later content is not used. This is the parser's specific triple-backtick check, not support for arbitrary Markdown fence forms. Links are reduced to their text, and backticks plus `*`, `_`, and `~` are removed. An empty result fails discovery.

Keep the first paragraph useful without the rest of the file, then document inputs and constraints below it:

```md
# Hero

Reusable editorial block for a brand message with an eyebrow, title, and description.

## Inputs

- `title`: headline text; Markdown is supported.
- `description`: supporting copy; Markdown lists are supported.
```

Parent README files can describe the taxonomy, but only a leaf README is required by the scanner.

## Discovery is not template authoring

Templates are discovered from directories containing `template.tsx` under `src/templates/`, then summarized into template registry entries. Brand leaves are discovered from `component.tsx` directories and represented by preview loaders and README metadata. A brand component is consumed by importing its project source into a template, not by adding brand fields to the generated template registry:

```tsx
import { BrandHero } from '@/brand/communication/hero/component'

// Inside a template render function:
return (
  <BrandHero
    eyebrow={data.eyebrow}
    title={data.title}
    description={data.description}
  />
)
```

The template still owns its dimensions, fields, content, variants, assets, and surrounding layout. Follow the [create a template guide](/en/users/guides/create-template) for those rules.
