---
title: Generated files
description: Understand FrameKit's generated registries, copied assets, and disposable build output.
sidebar:
  order: 3
---

FrameKit generates project-local files from the maintained source under `src/templates/` and, when present, `src/brand/`. Generated output is disposable: change the source and run generation instead of editing generated files.

## Generated registry and clients

`framekit generate` writes these files under `src/generated/framekit/`:

```text
src/generated/framekit/
├── brands.ts
├── render-client.tsx
├── studio-client.tsx
└── templates.ts
```

`templates.ts` exports the generated `templates` array. Each registry entry contains the template slug and path segments, validated metadata, dimensions, variants, declaration-ordered variant keys, an asset manifest, and a lazy `load` function for the template definition. `brands.ts` is generated from the project's brand components. The two client files bind the generated catalogs to the public Studio and client entrypoints.

The generated registry is an integration surface for the generated project, not a template-authoring surface. Do not hand-edit files under `src/generated/framekit/`; update source templates or brand components and regenerate.

## Copied template assets

Generation removes and recreates `public/framekit/templates/`, then copies discovered files from template-local asset directories into it. Assets are discovered from direct files under `src/templates/<slug>/assets/common/` and `assets/<variant>/`; the generated manifest maps those files to URLs such as:

```ts
{
  common: {
    logo: '/framekit/templates/social-card/common/logo.svg'
  },
  variants: {
    moon: {
      hero: '/framekit/templates/social-card/moon/hero.webp'
    }
  }
}
```

Public files outside those template asset directories are not added to the manifest. They remain application files and can be referenced with a supported root-relative URL such as `/assets/logos/brand.svg`. See [template assets](/en/users/concepts/templates/assets) for discovery and naming rules.

## Build and validation output

The generated project reserves these paths:

| Path | Contents |
| --- | --- |
| `.framekit/next/` | Next.js standalone production output created by the FrameKit Next.js configuration. |
| `.framekit/` | Temporary FrameKit output, including the temporary directory used while `framekit check` validates templates. |
| `.framekit-data/` | The default SQLite database directory when `FRAMEKIT_DATABASE_PATH` is not set. |
| `public/framekit/` | Copied generated assets. |
| `src/generated/framekit/` | Generated registries and client bindings. |

These paths are ignored by the repository template and can be regenerated as applicable. `framekit start` reads existing production output; it does not generate the registry.

For the commands that produce these files, see [the FrameKit CLI reference](/en/users/reference/cli/framekit). For the source layout, see [project structure](/en/users/getting-started/project-structure).
