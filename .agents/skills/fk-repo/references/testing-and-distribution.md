# Testing And Distribution

## Commands

Run these from the repository root:

```bash
pnpm test
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
pnpm test:e2e
pnpm smoke:docker -- <exact-published-framekit-version>
pnpm check:runtime
pnpm typecheck
pnpm lint
pnpm build
```

Vitest runs across workspaces. Core package tests normally run in Node, with jsdom for editor tests requiring DOM or localStorage. Studio tests run `framekit generate` before Vitest. `pnpm typecheck` includes positive and negative type fixtures for templates.

Coverage includes template discovery and code generation, navigation, data resolution, definition and field validation, editor state, CLI behavior, and type fixtures.

Browser E2E is covered by `tests/e2e/studio.spec.ts` and `tests/e2e/image-api.spec.ts` in Chromium against a production Studio build. Do not infer coverage for visual regression, a complete Studio user flow, asset copying, broad Windows/macOS support, or watcher behavior from the automated suite. Generated-consumer build/start is covered by the manual tarball smoke; the registry-backed Docker build/run and local-asset PNG are covered by the focused `smoke:docker` release gate.

## Pack And Smoke Test

For tarball creation and the external consumer test, follow the distribution
skill's [release gate](../../fk-release/SKILL.md) and
[Tarball Smoke Test](../../fk-release/references/tarball-smoke-test.md).
