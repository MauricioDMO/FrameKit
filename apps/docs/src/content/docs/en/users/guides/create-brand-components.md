---
title: Create a brand component
description: Add, document, preview, generate, and consume a reusable FrameKit brand component.
sidebar:
  order: 2
---

Use a brand component when the same project-source visual or communication pattern belongs in more than one template. Keep one-use artwork in its template. Brand components and templates have different discovery and consumption contracts: a brand component is discovered from `component.tsx` and consumed through a preview or a direct project import; a template is discovered from `template.tsx` and owns the output definition. See the [template definition](/en/users/concepts/templates/definition) when the work is template-specific.

## 1. Create the directory

Create the leaf below `src/brand/` using the project layout expected by discovery:

```text
src/brand/communication/hero/
├── README.md
├── component.tsx
└── preview.tsx
```

See the [brand components concept](/en/users/concepts/brand-components) for the exact discovery and naming rules.

## 2. Write the component

The component should accept semantic, reusable inputs. Use the published package entry point for FrameKit components:

```tsx
// src/brand/communication/hero/component.tsx
import { Markdown } from '@mauriciodmo/framekit'

export interface BrandHeroProps {
  eyebrow: string
  title: string
  description: string
  accentColor?: string
}

export function BrandHero ({ eyebrow, title, description, accentColor = '#c8f7d9' }: BrandHeroProps) {
  return (
    <section>
      <Markdown value={eyebrow} style={{ color: accentColor }} />
      <Markdown value={title} lists />
      <Markdown value={description} lists />
    </section>
  )
}
```

Do not add template-owned dimensions, platform labels, export controls, or calls to action just to make the first consumer convenient. The consuming template supplies its canvas, fields, content, variants, assets, and surrounding layout.

## 3. Add the README

Add the required leaf `README.md` and put a standalone summary near the top so the generated catalog has a useful description:

```md
# Hero

Reusable editorial block for a brand message with an eyebrow, title, and description.

## Inputs

- `eyebrow`: short label.
- `title`: headline; Markdown is supported.
- `description`: supporting copy; Markdown lists are supported.
- `accentColor`: optional accent color.
```

See the [brand components concept](/en/users/concepts/brand-components) and [brand catalog reference](/en/users/reference/brand-catalog) for the exact README and description rules.

## 4. Add the preview

Add a preview that default-exports a React component and reuses the component with representative static props:

```tsx
// src/brand/communication/hero/preview.tsx
import { BrandHero } from './component'

export default function Preview () {
  return (
    <div>
      <BrandHero
        eyebrow="NEW / FRAMEKIT"
        title="Design images with **React**"
        description="Reusable visual content for consistent templates."
      />
    </div>
  )
}
```

See the [brand catalog reference](/en/users/reference/brand-catalog) for the generated loader and catalog contract.

## 5. Generate the catalog

From the project root, generate the disposable modules:

```bash
pnpm framekit generate
```

The command writes `src/generated/framekit/brands.ts` as part of the generated output. See the [brand catalog reference](/en/users/reference/brand-catalog) for the generated module contract.

Do not edit generated files. Fix the source component, preview, or README and run the command again.

## 6. Consume the component in a template

Import the project source through the project's `@/*` alias and keep template-specific decisions in `template.tsx`:

```tsx
import { BrandHero } from '@/brand/communication/hero/component'

render ({ data }) {
  return (
    <main>
      <BrandHero
        eyebrow={data.eyebrow}
        title={data.title}
        description={data.description}
        accentColor={data.accentColor}
      />
    </main>
  )
}
```

The template remains responsible for declaring those fields and for its dimensions, content, variants, assets, and outer composition. The [create a template guide](/en/users/guides/create-template) covers the complete template definition.

For the exact directory, README, generated-module, and loader rules, see the [brand components concept](/en/users/concepts/brand-components) and [brand catalog reference](/en/users/reference/brand-catalog). The `Markdown` formatting accepted by the example is documented in the [Markdown reference](/en/users/reference/markdown).
