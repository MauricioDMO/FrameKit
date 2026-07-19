---
name: framekit-repository-development
description: Work safely in the FrameKit pnpm monorepo. Use for repository development, workspace commands, package build order, tests, type checks, tarball validation, generated artifacts, or diagnosing FrameKit development failures.
---

# FrameKit Repository Development

Work from the repository root. FrameKit is a private pnpm workspace containing:

- `apps/studio/`: the first-party Next.js application.
- `packages/framekit/`: the public `@mauriciodmo/framekit` package.
- `packages/create-framekit/`: the public scaffolding CLI.
- `examples/basic/`: a consumer-style distribution test harness.

Put reusable consumer-facing code in `packages/framekit/src/`; put Studio-only routes, i18n, assets, configuration, and integration tests in `apps/studio/src/`; put scaffolding CLI logic in `packages/create-framekit/src/`.

## Workflows

Install with `pnpm install --frozen-lockfile`. After changing any `package.json`, run `pnpm install` from the root, then `pnpm build`.

Use the root scripts for repository-wide work:

```bash
pnpm dev
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

`pnpm dev` builds `@mauriciodmo/framekit` before starting Studio. Preserve that order: workspace consumers import the package's built `dist/` files, so do not run `pnpm dev` inside a package directory.

For a single workspace, use a filter:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm --filter studio dev
pnpm --filter framekit-example-basic build
```

## Generated Outputs

Treat `.framekit/generated/templates.ts`, `.framekit/next/`, and `packages/framekit/dist/` as disposable ignored build output. Regenerate the template registry with `framekit generate` before a command that imports it.

The public package contract exposes only `.`, `./editor`, `./studio`, `./studio/root`, `./dev`, and `./styles.css`; do not treat `packages/framekit/src/*` imports as supported consumer imports.

## Verify Changes

Choose the narrowest relevant check first, then run repository-wide checks when the change crosses workspaces:

```bash
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
pnpm typecheck
pnpm lint
pnpm build
```

Read [references/testing-and-distribution.md](references/testing-and-distribution.md) for test coverage boundaries, packing, and the manual tarball smoke test.

## Diagnose Failures

Start with the exact command and output. For template discovery, generation, builds, dev-server ports, generated-project installation, production starts, or stale registries, read [references/troubleshooting.md](references/troubleshooting.md) and apply its specific remedy.
