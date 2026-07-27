---
name: framekit-project-setup
description: Set up a new FrameKit project or integrate FrameKit into an existing Next.js App Router project. Use for scaffolding, Studio routes, generated registries, commands, and setup failures.
---

# FrameKit Project Setup

Work from the project root. FrameKit scans `src/templates`; it has no alternate templates directory or CLI configuration flag.

## New project

Run `pnpm dlx @mauriciodmo/create-framekit <directory>`. The target must not exist. Generated projects require Node.js 22.13.0+ and pnpm 11.14.0+.

## Existing project

1. Install `@mauriciodmo/framekit`.
2. Set `distDir: '.framekit/next'` and `output: 'standalone'` in Next.js.
3. Add `"@framekit/generated/*": ["./src/generated/framekit/*"]` to `compilerOptions.paths`, preserving existing aliases.
4. Import `@mauriciodmo/framekit/styles.css` in global CSS or the root layout.
5. Keep the App Router root layout as a server component and wrap `children` with `FrameKitStudioRoot` from `@mauriciodmo/framekit/studio/root`.
6. Add the client route `src/app/editor/[[...slug]]/page.tsx` with `FrameKitStudio` and `templates` from `@framekit/generated/templates`.
7. Redirect `src/app/page.tsx` to `/editor`.
8. Run `framekit generate`.

Read [the integration reference](references/integration.md) for exact snippets.

## Commands

- `framekit generate` writes `src/generated/framekit/templates.ts`.
- `framekit check` generates and validates definitions and resolved locale data; it does not typecheck rendering or export PNGs.
- `framekit dev` generates first, serves Studio, and watches template and asset changes.
- `framekit build` runs `check`, then the Next.js build and standalone asset preparation.
- `framekit start` requires a successful production build.

Read [CLI and troubleshooting](references/cli-and-troubleshooting.md) for discovery rules, ports, environment variables, and fixes.

Treat `src/generated/framekit/templates.ts` and `.framekit/` as generated output. Do not edit the registry manually.
