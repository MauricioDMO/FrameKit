---
name: fk-setup
description: Set up a new FrameKit project or integrate FrameKit into an existing Next.js App Router project. Use for scaffolding, Studio routes, generated registries, commands, and setup failures.
---

# FrameKit Setup

Work from the project root. FrameKit scans `src/templates` and has no alternate templates path.

## New project

Run `pnpm dlx @mauriciodmo/create-framekit <directory>`. The target must not exist. Generated projects require Node.js 22.13.0+; use pnpm 11.14.0+ with pnpm, or choose npm in the creator.

## Existing project

1. Install `@mauriciodmo/framekit` and apply the Next.js, TypeScript, CSS, layout, editor route, and `/editor` redirect setup in [the integration reference](references/integration.md).
2. Run `framekit generate`. It writes the source-side registry to
   `src/generated/framekit/templates.ts`.

## Commands

- See [CLI and troubleshooting](references/cli-and-troubleshooting.md) for commands, discovery, and fixes.

Treat `src/generated/framekit/templates.ts` as generated source and do not edit
it manually. `.framekit/next/` is separate Next.js build output, while temporary
CLI directories may be created under `.framekit/`. Template assets are
synchronized under `public/__framekit/templates/` during generation.
