# Brand Components

Brand components are reusable visual-language and brand-communication blocks for a FrameKit project. They are not complete templates, generic UI, or Studio controls. This guide describes the current `src/brand` convention and the discovery path used by Studio.

## Where code belongs

- `src/components/` — UI that is independent of the brand.
- `src/brand/` — reusable brand patterns and communication blocks.
- `src/templates/<template>/` — layout or content used by one template.

Extract a block into `src/brand` when it represents a reusable brand decision. Keep the template responsible for output dimensions, platform or channel details, field resolution, assets, surrounding layout, and template-specific content.

## Brand directory layout

The current layout is organized by semantic purpose rather than by distribution channel:

```text
src/brand/
├── README.md
└── <semantic-domain>/
    ├── README.md
    └── <communication-intent>/
        ├── README.md
        └── <component>/
            ├── README.md
            ├── component.tsx
            └── preview.tsx
```

For example, the repository currently contains `communication/hero`, a channel-neutral hero block. Parent `README.md` files are a documentation convention: they describe their immediate children and clarify the taxonomy. A component README should explain purpose, inputs, constraints, when to use the component, and when to choose a sibling.

### Runtime-enforced discovery rules

These are the rules enforced by brand discovery, not just naming advice:

- FrameKit scans `src/brand` recursively. If that directory does not exist, no brand components are found.
- Every traversed, non-hidden directory segment must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Use lowercase letters, numbers, and hyphens only.
- Directories beginning with `.` or `_` are skipped.
- A directory containing `component.tsx` is a leaf component. Its `preview.tsx` and `README.md` must also exist; child directories are not scanned below that leaf.
- A leaf README must contain a non-empty prose paragraph. That paragraph becomes the catalog description. Headings, list items, and fenced-code lines are skipped by the description reader, and basic Markdown punctuation is stripped.

Parent READMEs, the semantic names of directories, the component's prop types, and the fact that a preview actually reuses the component are not separately validated by discovery. They remain part of the authoring contract. The generated Studio loader expects `preview.tsx` to provide a default React component; the current loader casts the default export rather than validating its shape.

Directory segments become the slash-separated slug, and the final segment is humanized for the Studio title. For example, `communication/hero` becomes the slug `communication/hero` and the title `Hero`.

## The README, component, and preview contract

### `README.md`

Use the nearest parent README to document the classification, and the leaf README to document the component's decision boundary. Keep the first prose paragraph useful on its own because it is shown as the component description in the catalog.

### `component.tsx`

Put the reusable component here. Its props should describe the message or visual pattern, not the first channel that consumes it. For example, the current `BrandHero` accepts semantic text and an optional accent color:

```tsx
import { Markdown } from '@mauriciodmo/framekit'

export interface BrandHeroProps {
  eyebrow: string
  title: string
  description: string
  accentColor?: string
}
```

The current component does not accept a platform, export size, background, or CTA prop.

### `preview.tsx`

Render a representative, static example and reuse `component.tsx`:

```tsx
import { BrandHero } from './component'

export default function Preview() {
  return (
    <div className="w-[720px] bg-[#10271f] p-14 text-[#f5f7ee]">
      <BrandHero
        eyebrow="NEW / FRAMEKIT"
        title="Design images with **React**"
        description="Reusable visual content, ready to export."
      />
    </div>
  )
}
```

The catalog renders this default preview component; it does not provide an editing contract for brand props. Use a static representative preview unless the project adds such a contract explicitly.

## Current `BrandHero`

`BrandHero` has the following props and default:

```tsx
BrandHero({
  eyebrow: string,
  title: string,
  description: string,
  accentColor = '#c8f7d9',
})
```

It composes:

1. An eyebrow rendered with `Markdown`, colored with `accentColor`.
2. A title rendered with `Markdown` and `lists={true}`.
3. A three-pixel, 56-pixel-wide accent rule followed by a description rendered with `Markdown` and `lists={true}`.

The outer section is capped at `720px`; the title uses the current `76px` typography and the description is capped at `570px`. The component owns this editorial composition, but not its surrounding background, export dimensions, platform label, or call to action. See the [Markdown reference](../reference/markdown.md) for the supported formatting.

## How a brand component is consumed

During `framekit dev`, changes anywhere under `src/brand` request regeneration. For a one-off generation, run:

```sh
framekit generate
```

Generation discovers the leaves and writes `src/generated/framekit/brands.ts` alongside the template registry. The shared generation command still requires at least one template. The Studio brand route receives the generated brand entries and `FrameKitStudio` uses each entry's `load` function to import the preview. The selected preview is then rendered by the brand catalog together with the generated title and the first README paragraph. The registry metadata includes `slug`, `title`, `segments`, `description`, and `load`; it does not define editable brand fields.

Templates consume the reusable component directly from project source. The current templates use the project alias, not a FrameKit package export:

```tsx
import { BrandHero } from '@/brand/communication/hero/component'

const accentColor = data.accentColor || '#c8f7d9'

return (
  <main className="my-auto">
    <BrandHero
      eyebrow={data.eyebrow}
      title={data.title}
      description={data.description}
      accentColor={accentColor}
    />
  </main>
)
```

The `que-es-framekit` template supplies the 1440×1440 canvas, dark artwork, header, decorative cards, footer, editable fields, and locale content around `BrandHero`. The Instagram square promotion supplies its background image, logo and channel-specific framing, plus its own CTA. Both reuse the same hero while keeping those template-specific decisions outside it.

## What is not currently provided

The current `src/brand` tree contains `communication/hero` only. There is no separate brand-token registry, token API, or centralized accent-color export in this workflow. `accentColor` is a component prop, and the current templates choose their own literal defaults (`#c8f7d9` and `#b9f8d2`). Do not document or import a token API that is not present.

For the broader template contract and field/content resolution, see [Template Authoring](./template-authoring.md) and [Template Contract](../reference/template-contract.md). For the Studio interface, see the [Studio User Guide](./studio.md).

---

[English](./brand-components.md) · [Español](../../es/guides/brand-components.md)
