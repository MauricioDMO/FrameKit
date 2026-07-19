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

Create package tarballs:

```bash
pnpm --filter @mauriciodmo/framekit pack
pnpm --filter @mauriciodmo/create-framekit pack
```

Before publishing, validate outside this repository:

1. Create an isolated basic consumer project and install the FrameKit tarball.
2. Run `pnpm check` and `pnpm build` there.
3. Install the create-framekit tarball and run `create-framekit <new-directory>` outside the repository.
4. In the generated project, replace its FrameKit workspace dependency with the local tarball; run `pnpm install`, `pnpm check`, and `pnpm build`.
5. Confirm `.framekit/generated/templates.ts` was generated and ignored, and neither tarball refers to the original workspace.

Both tarballs must install and generate without errors before publishing.
