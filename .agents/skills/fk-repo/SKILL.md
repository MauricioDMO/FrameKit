---
name: fk-repo
description: Work safely in the FrameKit pnpm monorepo. Use for repository development, workspace commands, package build order, tests, type checks, tarball validation, generated artifacts, or diagnosing FrameKit development failures.
---

# FrameKit Repo

Work from the repository root. This private pnpm workspace contains the Studio app, the public `@mauriciodmo/framekit` and `@mauriciodmo/create-framekit` packages, and `examples/basic/`.

Keep reusable runtime code in `packages/framekit/src/`, Studio-only code in `apps/studio/src/`, and scaffolding logic in `packages/create-framekit/src/`.

## Commands

Install with `pnpm install --frozen-lockfile`. After changing a `package.json`, run `pnpm install` and `pnpm build` from the root.

Use these root commands:

```bash
pnpm dev
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

`pnpm dev` builds `@mauriciodmo/framekit` before Studio. Do not run it inside a package directory. Use `pnpm --filter <workspace> <command>` for focused work.

## Generated Outputs

Treat `src/generated/framekit/templates.ts`, `.framekit/next/`, and `packages/framekit/dist/` as disposable ignored output. Run `framekit generate` before commands that import the registry.

The public package contract exposes only `.`, `./editor`, `./studio`, `./studio/root`, `./dev`, and `./styles.css`; do not treat `packages/framekit/src/*` imports as supported consumer imports.

## Verify Changes

Start with the narrowest relevant check, then run repository-wide checks when a change crosses workspaces:

```bash
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
pnpm typecheck
pnpm lint
pnpm build
```

Read [testing and distribution](references/testing-and-distribution.md) for coverage boundaries and packaging checks.

## Diagnose Failures

Start with the exact command and output. For template discovery, generation, builds, dev-server ports, generated-project installation, production starts, or stale registries, read [references/troubleshooting.md](references/troubleshooting.md) and apply its specific remedy.
