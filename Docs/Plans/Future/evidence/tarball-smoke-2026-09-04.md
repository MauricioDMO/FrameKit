# Pre-publication Tarball Smoke Evidence

## Result

- Requested pre-publication tarball smoke: PASS.
- Evidence recorded: 2026-09-04T12:04:08-06:00.
- Scope: local tarballs built from the current checkout, installed only from temporary paths outside the checkout.
- No package version, release tag, dist-tag, publish command, or npm registry smoke was selected or run.

## Runtime

- Node.js: v24.15.0.
- npm: 11.12.1.
- pnpm: 11.14.0.
- Current observed package versions: `@mauriciodmo/framekit` 0.8.1 and `@mauriciodmo/create-framekit` 0.8.3. These were read from the manifests and not chosen by this check.

## Temporary Layout

All paths below are anonymized. The actual temporary root was removed after the run.

- Tarball directory: `<tmp>/framekit-tarball-smoke-XXXX/`.
- Independent consumer: `<tmp>/framekit-tarball-smoke-XXXX/independent-consumer/`.
- Creator runner: `<tmp>/framekit-tarball-smoke-XXXX/creator-runner/`.
- Creator-generated consumer: `<tmp>/framekit-tarball-smoke-XXXX/creator-consumer/`.
- Observed tarballs: `<tmp>/.../mauriciodmo-framekit-0.8.1.tgz` and `<tmp>/.../mauriciodmo-create-framekit-0.8.3.tgz`.
- Cleanup: PASS. The default script mode removed the temporary root and stopped the standalone process before removal.

## Commands And Results

Entry point, exit code 0:

```text
node scripts/smoke-tarballs.mjs
```

The script ran these steps, all with exit code 0 unless stated otherwise:

```text
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm --filter @mauriciodmo/framekit pack --pack-destination <tmp>
pnpm --filter @mauriciodmo/create-framekit pack --pack-destination <tmp>
tar -tzf <tmp>/.../mauriciodmo-framekit-0.8.1.tgz
tar -xzf <tmp>/.../mauriciodmo-framekit-0.8.1.tgz -C <tmp>/.../inspect-core
tar -tzf <tmp>/.../mauriciodmo-create-framekit-0.8.3.tgz
tar -xzf <tmp>/.../mauriciodmo-create-framekit-0.8.3.tgz -C <tmp>/.../inspect-creator
```

The archive audit passed for both packages:

- Core archive contains `bin/framekit.js`, `dist/index.js`, `dist/styles.css`, `README.md`, and `LICENSE`.
- Creator archive contains `dist/cli.js`, `template/package.json`, `README.md`, and `LICENSE`.
- Every manifest target in `exports` and `bin` resolves to an in-package file.
- The `framekit` and `create-framekit` bin targets have Node shebangs.
- No source test directories, dependency directories, `.env` files, checkout paths, `workspace:`, `link:`, or local `file:` references were found.

Independent consumer, created directly rather than by creator:

```text
npm install --no-audit --no-fund
node --input-type=module -e "...import.meta.resolve(public exports)..."
npx --no-install framekit generate
npx --no-install framekit check
npx --no-install framekit build
```

Results:

- Clean npm installation from the core tarball: PASS.
- Installed `framekit` binary: PASS.
- Public export resolution for `.`, `./editor`, `./studio`, `./studio/root`, `./dev`, and `./styles.css`: PASS.
- `generate`, `check`, and production `build`: PASS.
- `src/generated/framekit/templates.ts`: PASS.

Creator-generated consumer:

```text
npm init -y
npm install --no-audit --no-fund <tmp>/.../mauriciodmo-create-framekit-0.8.3.tgz
npx --no-install create-framekit <tmp>/.../creator-consumer -n
npm install --no-audit --no-fund
npx --no-install framekit generate
npx --no-install framekit check
npx --no-install framekit build
HOSTNAME=127.0.0.1 PORT=<ephemeral> npx --no-install framekit start
node --input-type=module -e "fetch('http://127.0.0.1:<ephemeral>/editor')"
```

Results:

- Creator tarball installation and `create-framekit` binary: PASS.
- Non-interactive `-n` scaffold: PASS.
- Creator-declared FrameKit dependency observed before replacement: `0.8.1`.
- Generated consumer had no `node_modules` before its install: PASS.
- Core dependency replaced with the tarball and clean npm install completed: PASS.
- Installed core version matched the core tarball: PASS.
- Public export resolution and installed `framekit` binary: PASS.
- `generate`, `check`, and production `build`: PASS.
- `src/generated/framekit/templates.ts` exists: PASS.
- `.gitignore` ignores `src/generated/framekit`: PASS.
- Standalone `framekit start` served `/editor` with HTTP 200: PASS.
- Standalone process shutdown: PASS.

## Repository Checks

The versionless local gate also passed:

```text
node --check scripts/smoke-tarballs.mjs
git diff --check
pnpm check:runtime
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

Observed test results: FrameKit 233 tests in 24 files, creator 23 tests in 2 files, and Studio 2 tests in 1 file. Lint emitted the existing creator warning that React is not installed in that package's lint context; the command exited successfully.

## Changes Owned By This Run

- Added `scripts/smoke-tarballs.mjs`.
- Added this evidence file.
- No existing documentation or `package.json` was edited.
- No `.framekit`, `dist`, or generated output was manually edited.
- Existing unrelated worktree changes were preserved.

## Unverified Or Deferred

- Windows CI lane: FAIL in the [GitHub Actions run 33687196859](https://github.com/MauricioDMO/FrameKit/actions/runs/33687196859), at `Run discovery and codegen tests`; this local smoke did not execute Windows itself.
- Chromium E2E: UNVERIFIED in this run; the tarball smoke used HTTP readiness, not browser automation.
- Post-publication npm registry smoke: UNVERIFIED and intentionally not run because exact published specs and a dist-tag were not supplied. It remains a release handoff requirement after publication and before promotion.
- Publication, version selection, tagging, dist-tag mutation, and push: not performed.

## Final-state rerun

- Timestamp: `2026-09-04T13:51:07-06:00`.
- Command: `node scripts/smoke-tarballs.mjs`.
- Result: PASS for the independent consumer, creator-generated consumer,
  package inspection, lifecycle checks, HTTP readiness, and cleanup.
- Observed package versions remained `@mauriciodmo/framekit@0.8.1` and
  `@mauriciodmo/create-framekit@0.8.3`; these were read from the manifests, not
  selected for a release. The subsequent full local verification reports 235
  FrameKit tests; the original 233-test record above remains unchanged.
