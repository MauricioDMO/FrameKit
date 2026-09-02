# Testing And Distribution

## Commands

Run these from the repository root:

```bash
pnpm test
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
pnpm check:runtime
pnpm typecheck
pnpm lint
pnpm build
```

Vitest runs across workspaces. Core package tests normally run in Node, with jsdom for editor tests requiring DOM or localStorage. Studio tests run `framekit generate` before Vitest. `pnpm typecheck` includes positive and negative type fixtures for templates.

Coverage includes template discovery and code generation, navigation, data resolution, definition and field validation, editor state, CLI behavior, and type fixtures.

Browser E2E is covered by `tests/e2e/studio.spec.ts` in Chromium. Do not infer coverage for visual regression, a complete Studio user flow beyond this E2E, asset copying, broad Windows/macOS support, or watcher behavior from the automated suite. Production build/start is covered separately by the manual tarball smoke; the Windows CI consumer smoke is also separate from the browser E2E.

## Pack And Smoke Test

For tarball creation and the external consumer test, follow the distribution
skill's [release gate](../../fk-release/SKILL.md) and
[Tarball Smoke Test](../../fk-release/references/tarball-smoke-test.md).
