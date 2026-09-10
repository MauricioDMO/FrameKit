# Step 0.6 Task 2 Report

## Status

Complete. The package API layer is implemented without touching Step 0.6
codegen, consumer routes, or the pre-existing documentation and script changes.

## Implementation

- Added `withFrameKit(config?: NextConfig): NextConfig` in `src/next/config.ts`.
- Added the `src/next.ts` facade and `next` tsdown entry.
- Added owned `.framekit/next` and `standalone` validation and assignment.
- Added deferred redirect composition that preserves custom rules, appends the
  temporary root redirect, deduplicates only an equivalent exact root rule, and
  rejects conflicting root, `distDir`, and `output` settings.
- Kept the Next configuration JavaScript free of runtime imports and runtime
  initialization. `NextConfig` is imported only as a type from `next/types`.
- Added `createStudioPage` in `src/studio/page.tsx` and re-exported it through
  `src/studio-root.ts` without changing `FrameKitStudioRoot`.
- Added focused behavior tests and public type fixtures.
- Added the `./next` package export.

## Verification

- `pnpm install`: passed with pnpm 11.14.0; lockfile unchanged.
- Focused tests: 2 files, 9 tests passed.
- `pnpm --filter @mauriciodmo/framekit test`: 63 files, 646 tests passed.
- `pnpm --filter @mauriciodmo/framekit typecheck`: passed.
- `pnpm --filter @mauriciodmo/framekit build`: passed.
- `pnpm build`: passed for the creator, package, and Studio workspaces.
- `pnpm typecheck`: passed for all workspaces.
- `pnpm lint`: passed with one pre-existing warning at
  `packages/framekit/src/server/render-job.ts:113`.
- `pnpm test`: passed: 3 workspaces, 67 files, 680 tests.
- `pnpm check:runtime`: passed.
- Direct Node import of built `dist/next.js`: passed.
- Packed `@mauriciodmo/framekit/next` import: passed after isolated package
  installation.
- `git diff --check`: passed.

## Concerns

- The existing `_options` unused-parameter lint warning in
  `src/server/render-job.ts:113` remains unchanged.
- The initial packed smoke installation with `--offline` could not find the
  cached `chokidar` tarball; the online isolated installation completed and the
  packed public import passed.
- Codegen and consumer route migration remain intentionally deferred to the
  next Step 0.6 tasks.
