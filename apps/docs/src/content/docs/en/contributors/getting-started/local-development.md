---
title: Local development
description: Install, build, and run the FrameKit workspaces from the repository root.
---

# Local development

Run repository commands from the checkout root unless a command explicitly targets a workspace. The shortest clean-checkout path is:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

## Why `pnpm dev` runs at the root

The root `package.json` defines `pnpm dev` as:

```bash
pnpm --filter @mauriciodmo/framekit build && pnpm --filter studio dev
```

The public `@mauriciodmo/framekit` package exports built files from `dist/`, while `apps/studio` consumes that package through its workspace link. Building the package first makes those exports available before Studio starts. Running `pnpm dev` inside a package skips this root-level order.

Studio's `framekit dev` command generates the current template modules before starting the Next.js development server and watches the template and brand source paths for changes.

## Workspace ownership

| Workspace | Owns |
| --- | --- |
| `apps/studio/` | The private first-party Next.js application, including its routes, application integration, templates, and assets. |
| `apps/docs/` | The private Astro and Starlight documentation site under `src/content/docs/`. |
| `packages/framekit/` | The public reusable runtime, editor and Studio components, server and development tooling, CLI, and code generation. |
| `packages/create-framekit/` | The public project-scaffolding CLI and its canonical generated consumer template. |

`Docs/Plans/` and `Docs/skills/` are operational repository knowledge outside the published workspaces.

## Focused commands

Run the commands below from the repository root. They are scripts defined by the corresponding workspace manifests.

| Workspace | Useful focused commands |
| --- | --- |
| `@mauriciodmo/framekit` | `pnpm --filter @mauriciodmo/framekit build`; `pnpm --filter @mauriciodmo/framekit lint`; `pnpm --filter @mauriciodmo/framekit test`; `pnpm --filter @mauriciodmo/framekit typecheck` |
| `studio` | `pnpm --filter studio dev`; `pnpm --filter studio check`; `pnpm --filter studio lint`; `pnpm --filter studio test`; `pnpm --filter studio typecheck`; `pnpm --filter studio build`; `pnpm --filter studio start` |
| `@mauriciodmo/create-framekit` | `pnpm --filter @mauriciodmo/create-framekit build`; `pnpm --filter @mauriciodmo/create-framekit lint`; `pnpm --filter @mauriciodmo/create-framekit test`; `pnpm --filter @mauriciodmo/create-framekit typecheck` |
| `docs` | `pnpm --filter docs build`; `pnpm --filter docs preview` |

For a fresh checkout, build `@mauriciodmo/framekit` before focused Studio tests, type checks, or other commands that execute the FrameKit CLI. `studio start` requires a successful production build first.

To run the docs development server, follow `apps/docs/AGENTS.md` and use `astro dev --background`; manage it with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Do not edit generated output

Regenerate outputs from their maintained sources instead of changing them by hand:

- `packages/framekit/dist/` is the built public package output.
- In the canonical consumer, `src/generated/framekit/` contains generated registries and client bindings, `public/framekit/` contains copied generated assets, and `.framekit/` including `.framekit/next/` contains temporary or production build output.
- `apps/docs/dist/` is the built docs site and `apps/docs/.astro/` contains Astro-generated files.

These paths are ignored build or generated output. The root ignore rules cover the corresponding `**/dist/`, `**/build/`, `**/out/`, and `.framekit` paths; the docs app also ignores its `dist/` and `.astro/` output. Change maintained source such as templates, brand components, package source, or Markdown pages, then run the relevant command again.

## Skill synchronization

`Docs/skills/` is the canonical source for the repository's internal and public skills. Run:

```bash
pnpm sync:skills
```

The sync script copies internal skills to `.agents/skills/` and public skills to `packages/create-framekit/template/.agents/skills/`. Edit only `Docs/skills/`; do not edit either synchronized copy directly.

## Continue

Read the [architecture guide](/en/contributors/architecture) before making a cross-workspace change. Then use the [development guide](/en/contributors/development) and its links to testing, distribution, releases, and documentation instead of duplicating those procedures here. Consumer-facing contracts belong in the [user documentation](/en/users/).
