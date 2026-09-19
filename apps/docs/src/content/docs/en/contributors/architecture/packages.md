---
title: Package architecture
description: See what each FrameKit workspace owns and which public package entrypoints form its contract.
---

# Package architecture

The repository separates reusable runtime code from first-party application
code, scaffolding, and documentation. The package manifests are the authority
for ownership, binaries, dependencies, and public exports.

## Workspace responsibilities

| Workspace | Responsibility | Public status |
| --- | --- | --- |
| `packages/framekit/` | Shared template model, Editor, Studio components, server/access runtime, codegen, development server, and `framekit` CLI. | Public as `@mauriciodmo/framekit`. |
| `packages/create-framekit/` | `create-framekit` project creator, package-manager integration, skills update command, and canonical generated consumer template. | Public as `@mauriciodmo/create-framekit`. |
| `apps/studio/` | First-party Next.js integration, application routes, templates, and assets. | Private application. |
| `apps/docs/` | Astro, Starlight, Mermaid integration, and published documentation content. | Private workspace. |

The canonical template is part of `packages/create-framekit/`, but the runtime
it uses is the public `@mauriciodmo/framekit` package. The first-party Studio
uses the same public package through the workspace dependency.

## `@mauriciodmo/framekit` boundary

The manifest publishes the reusable runtime as an ESM package with the
`framekit` binary. The [user-facing package API reference](/en/users/reference/package-api)
lists its supported entrypoints and responsibilities; this page focuses on
ownership and import boundaries.

Node-only APIs belong to server and tooling entrypoints; client entrypoints do
not import the server facade. The generated Studio client uses the Studio
entrypoint, while the generated render client uses the client entrypoint.

## `@mauriciodmo/create-framekit`

This package publishes the `create-framekit` binary and the canonical
`template/` directory. Its implementation:

- validates the Node.js runtime and, when selected, the pnpm version;
- copies the template into a new directory and renames its `_gitignore`;
- removes `pnpm-workspace.yaml` when npm is selected;
- optionally installs dependencies, runs pnpm approval, and generates the
  initial catalog; and
- optionally initializes Git and updates the official template skills.

The generated project imports FrameKit from its package entrypoints and imports
its generated registries through the project alias
`@framekit/generated/*`. This keeps consumer code independent of the package's
internal source tree. See [project structure](/en/users/getting-started/project-structure)
for the generated consumer layout and [the creator reference](/en/users/reference/cli/create-framekit)
for its user-facing command contract.
