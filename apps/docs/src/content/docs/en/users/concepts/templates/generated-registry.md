---
title: Generated template registry
description: Understand the generated template registry, its metadata, asset manifest, and lazy loaders.
sidebar:
  order: 6
---

FrameKit discovers templates and writes generated modules under `src/generated/framekit/`. The template registry is disposable output; change the source under `src/templates/` and regenerate instead of editing generated files.

## Registry entries

The generated `templates` array contains one `TemplateRegistryEntry` per discovered template. Each entry contains:

- `slug`, the slash-separated path from `src/templates/`;
- `segments`, the original path segments;
- validated `meta`;
- `width` and `height`;
- `variants` and `variantKeys`;
- the generated `assets` manifest; and
- `load`, a lazy function that imports the template definition.

The summary preserves the declared content-key order in `variantKeys`. Registry entries are sorted alphabetically by slug during discovery. The template definition loaded later must keep the same dimensions and content variant keys represented by the entry.

The generated template module has the public shape expected by `FrameKitStudio`:

```ts
import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

export const templates: TemplateRegistryEntry[] = [
  // generated entries
]
```

The generated source itself is not an authoring surface. Do not hand-edit `src/generated/framekit/templates.ts` or the copied files under `public/framekit/`.

## When generation runs

Use the one-off command when you need to regenerate explicitly:

```bash
pnpm framekit generate
```

The other lifecycle commands also generate:

- `pnpm framekit dev` generates before starting and watches source changes;
- `pnpm framekit check` generates before validating templates and resolved content;
- `pnpm framekit build` runs the check, which generates before the Next.js build; and
- `pnpm framekit start` reads existing production output and does not generate.

Generation requires at least one discovered template. It writes the template registry, asset copies, and generated clients; it may also write the brand registry when a project has brand components.

For the definition that produces each registry summary, see [template definition](/en/users/concepts/templates/definition). For the exact entry contract, see the [template reference](/en/users/reference/template).
