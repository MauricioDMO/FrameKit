---
title: Repository architecture
description: Understand the FrameKit monorepo layout, workspace ownership, operational knowledge, and source boundaries.
---

# Repository architecture

FrameKit is a private pnpm monorepo. The root `pnpm-workspace.yaml` includes
`apps/*` and `packages/*`, so commands that coordinate workspaces start at the
repository root.

## Repository map

```text
FrameKit/
├── apps/
│   ├── docs/                         # Astro and Starlight site
│   └── studio/                       # private first-party Next.js app
├── packages/
│   ├── framekit/                     # public runtime and tooling package
│   └── create-framekit/              # public creator and canonical template
├── Docs/
│   ├── Plans/                        # operational plans and phase records
│   └── skills/                       # canonical skill sources
├── tooling/                          # repository-maintenance scripts
├── e2e/                              # Playwright system tests
├── package.json                      # root commands and runtime contract
└── pnpm-workspace.yaml               # workspace and pnpm settings
```

The four workspaces have separate owners:

| Path | Owns |
| --- | --- |
| `apps/studio/` | First-party routes, app integration, templates, and assets. |
| `apps/docs/` | Documentation configuration and content under `src/content/docs/`. |
| `packages/framekit/` | Reusable consumer-facing runtime and its Editor, Studio, server, codegen, development server, and CLI implementation. |
| `packages/create-framekit/` | The public project-scaffolding CLI and the template copied into new consumer projects. |

`Docs/Plans/` and `Docs/skills/` remain outside these published workspaces.
Only the two `@mauriciodmo/*` packages are public package publications; the
root workspace and `apps/studio` are private.

## Root command order

The root `pnpm dev` script builds `@mauriciodmo/framekit` and then starts
`studio`. Studio resolves the workspace package through its built `dist/`
files, so starting only the app can leave the package entrypoints unavailable
in a clean checkout. Use the [local development guide](/en/contributors/getting-started/local-development)
for the focused commands.

The package-level lifecycle has a similar dependency order:

1. `framekit generate` creates the project-local registry and bindings.
2. `framekit check` generates first, then validates every template and content
   variant.
3. `framekit build` runs `check`, then runs the Next.js build and prepares the
   standalone output.
4. `framekit start` runs the existing standalone server and does not generate
   or validate source.

The root scripts `lint`, `test`, `typecheck`, and `build` recurse through
workspaces that define those scripts. Repository maintenance scripts live under
`tooling/`; package-specific build and codegen logic stays with its package.

## Source and output boundaries

Consumer and generated-project code imports the package through published
entrypoints such as `@mauriciodmo/framekit`,
`@mauriciodmo/framekit/editor`, `@mauriciodmo/framekit/studio/root`, and
`@mauriciodmo/framekit/server`. A consumer must not import
`packages/framekit/src/**` directly.

The maintained and generated sides are deliberately separate:

- Maintained template and brand source lives under a consumer project's
  `src/templates/` and optional `src/brand/`.
- `src/generated/framekit/`, `public/framekit/`, `.framekit/`, and
  `.framekit-data/` are generated, temporary, or runtime data paths.
- `packages/framekit/dist/`, `apps/docs/dist/`, and `apps/docs/.astro/` are
  build output.

Regenerate output from source rather than fixing it by hand. See [Generated
code](/en/contributors/architecture/generated-code) for the exact files and
triggers.

## Skills synchronization

`Docs/skills/` is the canonical skill source. The repository synchronizes its
internal skills to `.agents/skills/` and its public skills to
`packages/create-framekit/template/.agents/skills/`. Change the source under
`Docs/skills/`, then run `pnpm sync:skills`; do not edit either synchronized
copy directly.
