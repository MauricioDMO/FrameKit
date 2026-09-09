# Task 1 Report: Step 0.5 Final Review Fixes

## Status

PASS

The smoke script now follows the JavaScript graph reachable from
`dist/client.js`, including static imports, re-exports, and literal dynamic
imports. It scans only reachable modules for forbidden client-boundary imports;
server artifacts are not scanned as a separate directory root.

The three requested public documentation files now describe the client entry,
the `createRenderClient(templates)` consumer-local `'use client'` adapter, and
the private render job/page handoff separately from the future public image API.

## Commit Hashes

- Implementation: `aa582fee19c09c0a87ea73b9081de91a0f9166bd`

## Files Changed

- `scripts/smoke-tarballs.mjs`
- `packages/framekit/README.md`
- `Docs/en/reference/public-api.md`
- `Docs/es/reference/public-api.md`
- `.superpowers/sdd/final-fixes-plan/task-1-report.md`

No generated output or unrelated files were changed. The report is committed
separately from the implementation commit.

## Commands and Results

- `pnpm --filter @mauriciodmo/framekit build` - passed; JavaScript, CSS, and `check-dist` completed.
- `node --check scripts/smoke-tarballs.mjs` - passed.
- `git diff --check` - passed with no output.
- `pnpm --filter @mauriciodmo/framekit test` - passed; 61 test files and 637 tests.
- `pnpm --filter @mauriciodmo/framekit typecheck` - passed; both configured TypeScript checks completed.
- `pnpm --filter @mauriciodmo/create-framekit test` - passed; 2 test files and 30 tests.
- `pnpm check:runtime` - passed; runtime contract reported Node.js `>=22.13.0` and pnpm `>=11.14.0`.
- `node scripts/smoke-tarballs.mjs` - passed; both tarballs packed, independent and generated consumers installed, generated, checked, built, and started; the production route, HTTP readiness, and Map handoff checks passed.
- Commit hook `pnpm -r --if-present lint` - passed with zero errors; one existing warning remains at `packages/framekit/src/server/render-job.ts:113` for unused `_options`.
- Commit hook `node scripts/sync-skills.mjs` - passed.

## Concerns

- The production smoke remains HTTP-only. It does not perform browser automation,
  pixel checks, or later image API validation; this is the intentional residual
  risk outside this fix.
