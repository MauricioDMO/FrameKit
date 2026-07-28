# Testing And Distribution

## Commands

Run these from the repository root:

```bash
pnpm test
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
pnpm typecheck
pnpm lint
pnpm build
```

Vitest runs across workspaces. Core package tests normally run in Node, with jsdom for editor tests requiring DOM or localStorage. Studio tests run `framekit generate` before Vitest. `pnpm typecheck` includes positive and negative type fixtures for templates.

Coverage includes template discovery and code generation, navigation, data resolution, definition and field validation, editor state, CLI behavior, and type fixtures.

Do not infer coverage for browser E2E, visual regression, a complete Studio user flow, production build/start, asset copying, Windows/macOS, or watcher behavior; these are not covered by the current suite.

## Pack And Smoke Test

For tarball creation and the external consumer test, follow the distribution
skill's [release gate](../../fk-release/SKILL.md) and
[Tarball Smoke Test](../../fk-release/references/tarball-smoke-test.md).
