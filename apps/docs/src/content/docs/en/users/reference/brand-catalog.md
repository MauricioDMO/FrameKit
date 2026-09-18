---
title: Brand catalog reference
description: Reference brand discovery, generated catalog modules, loaders, and the empty-catalog behavior.
sidebar:
  order: 3
---

FrameKit discovers reusable brand components below `src/brand/` and generates catalog metadata and preview loaders for project consumers. This is a source and code-generation contract; it is separate from the [template registry](/en/users/concepts/templates/generated-registry).

## Discovery contract

The scanner recursively visits `src/brand/`:

```text
src/brand/
└── <segment>/...
    ├── component.tsx
    ├── preview.tsx
    └── README.md
```

The exact rules are:

- If `src/brand/` does not exist, discovery returns `[]`.
- Files are ignored during traversal.
- Directories beginning with `.` or `_` are skipped.
- Every other visited directory segment must match `^[a-z0-9]+(?:-[a-z0-9]+)*$`. An invalid visible segment fails discovery.
- A directory containing `component.tsx` is a leaf. It must also contain `preview.tsx` and `README.md`, and discovery does not recurse below it.
- The leaf `README.md` is read as UTF-8. Each input line is trimmed before processing, and the first paragraph of ordinary lines is joined with spaces. Blank lines, headings, list markers (`- `, `* `, or an ordered marker such as `1. `), and lines whose trimmed content begins with triple backticks end the paragraph. This is a triple-backtick prefix check, not support for arbitrary Markdown fence forms. Later content is ignored.
- Before storing the description, `[text](url)` becomes `text`, backticks and `*`, `_`, and `~` are removed, and the result is trimmed. A missing description fails discovery.
- `slug` is the slash-separated path, `segments` is the original array, and the final segment is humanized for `title` by capitalizing each hyphen-separated word.
- Discovered entries are sorted by `slug.localeCompare(...)`.

Discovery checks the required paths and README description. It does not execute or validate the implementation of `component.tsx`; the generated loader expects the preview module's default export to be usable as a React component.

## Generated brand module

The shared generator writes:

```text
src/generated/framekit/brands.ts
```

The generated module exports the following current shapes:

```ts
type BrandLoader = () => Promise<{ default: unknown }>

export const brands: Array<{
  slug: string
  title: string
  segments: string[]
  description: string
  load: BrandLoader
}>

export const brandManifest: Array<{
  slug: string
  title: string
  segments: string[]
  description: string
}>

export const brandRegistry: Record<string, BrandLoader>
```

Each `brands` entry's `load` function dynamically imports the leaf's `preview.tsx` module. `brandManifest` contains the same metadata without `load`. `brandRegistry` maps each slug to its preview loader. The generated file is disposable: change `src/brand/` and regenerate instead of editing it.

The shared generation command still requires at least one discovered template. If a project has templates but no `src/brand/` directory or no brand leaves, generation succeeds and produces an empty module:

```ts
brands // []
brandManifest // []
brandRegistry // {}
```

## Consume the generated catalog

The generated module can be consumed through the project's generated-module path. Its entries match the published `FrameKitStudioBrand` contract, and each entry can be looked up and loaded independently:

```tsx
import type { FrameKitStudioBrand } from '@mauriciodmo/framekit/studio'
import { brandRegistry, brands } from '@/generated/framekit/brands'

export function findBrand (slug: string): FrameKitStudioBrand | undefined {
  return brands.find((brand) => brand.slug === slug)
}

export async function loadBrandPreview (slug: string): Promise<unknown | undefined> {
  const load = brandRegistry[slug]
  return load === undefined ? undefined : (await load()).default
}
```

For a selected brand entry, the consumer loads the preview through `load`. The catalog uses the generated title and README description and renders the loaded default export as the preview. The catalog does not create an editable prop contract for the brand component.

## Brand output versus template output

Both modules are written under `src/generated/framekit/`, but they represent different contracts:

| Output | Source boundary | Entries and loader |
| --- | --- | --- |
| `brands.ts` | A leaf directory containing `component.tsx` | `slug`, `title`, `segments`, `description`, and a loader for `preview.tsx` |
| `templates.ts` | A directory containing `template.tsx` | `TemplateRegistryEntry` metadata, dimensions, variants, assets, and a loader for `template.tsx` |

Brand catalog entries are not template definitions and are not part of template rendering or template asset manifests.
