---
name: fk-release
description: Validate FrameKit packages and their distribution before publishing or after packaging changes. Use when creating or smoke-testing the @mauriciodmo/framekit or @mauriciodmo/create-framekit tarballs, checking generated consumer projects, diagnosing package-install or FrameKit CLI build/start failures, or confirming a package has no workspace references.
---

# FrameKit Release

Validate from the repository root. The root workspace is private; only `@mauriciodmo/framekit` and `@mauriciodmo/create-framekit` are publish targets.

Edit this skill only under `Docs/skills/`. Run `pnpm sync:skills` to refresh the
synchronized skill copies; do not edit `.agents/skills/` or generated-project
copies directly.

## Release Gate

1. Run the repository checks:

   ```sh
   pnpm check:runtime
   pnpm lint
   pnpm test
   pnpm typecheck
   pnpm build
   ```

2. Build both tarballs:

   ```sh
   pnpm --filter @mauriciodmo/framekit pack
   pnpm --filter @mauriciodmo/create-framekit pack
   ```

3. Run the manual smoke test outside this repository. Follow [Tarball Smoke Test](references/tarball-smoke-test.md).

4. Report commands, tarball paths, results, and generated artifacts. Report the Chromium E2E and manual tarball smoke separately; do not claim visual, broad cross-platform, watcher, or asset-copy coverage from the automated suite.

## Post-publication Registry Gate

After publication and before promotion, run the post-publication npm registry
smoke in `Docs/en/development/testing-and-distribution.md`. Supply exact,
release-time `CORE_SPEC` and `CREATOR_SPEC` values plus `EXPECTED_DIST_TAG`; do
not encode a version or tag here. The check must run outside the repository and
install from npm, verify the package export targets and both binaries, record
the creator template's FrameKit version/range, scaffold with `-n`, install the
exact core package, run `generate`, `check`, `build`, and `start`, poll
`/editor` over HTTP, and clean up.

Check the intended dist-tag independently of the consumer smoke. Record the
inputs, resolved versions, runtime, commands, logs, and PASS/FAIL result. A
failure blocks promotion to that tag, not the initial package upload; never
publish or mutate a dist-tag during validation.

## Release Handoff

Follow `Docs/en/development/release.md` for versioning, commits, tags, publish
commands, and prerelease tags. Never run `publish` or `git push`; never add or
request `--otp`. The user performs the final commands interactively.

## Focused Validation

Use focused package tests while iterating; run the release gate before publishing.

```sh
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
```

`pnpm typecheck` also validates positive and negative template type fixtures. Build the core package before running Studio or the basic example because workspace consumers resolve its built `dist/` exports.

## CLI Checks

**Interactive CLI:** Never pipe `yes`, `yes n`, or an unbounded stream into
`create-framekit`. Use a real TTY or test the isolated creation API.

Run FrameKit commands from the consumer project root. They scan `src/templates` and accept no alternate templates path.

- Run `framekit generate` after changing template structure; it creates `src/generated/framekit/templates.ts` only when content changes.
- Run `framekit check` to validate definitions and variant data. It regenerates first and cleans temporary checker files even on failure.
- Run `framekit build` for the consumer release check. It runs `check` first, then builds Next.js and copies static assets beside the standalone server.
- Run `framekit start` only after a successful build. It requires exactly one valid standalone server.

Read [CLI failures](references/cli-and-failures.md) when a CLI or installation step fails.

## Package Expectations

- `@mauriciodmo/framekit` contains `bin/`, `dist/`, `README.md`, and `LICENSE`; CSS is emitted as `dist/styles.css`.
- `@mauriciodmo/create-framekit` contains `dist/`, `template/`, `README.md`, and `LICENSE`; its template is copied into the generated project.
- Confirm the generated `src/generated/framekit/templates.ts` is present and gitignored in the generated consumer project.
- Confirm neither tarball retains a reference to the original workspace.
- The manual tarball smoke must also run the generated project's production build and `framekit start`, poll a Studio route over HTTP, and clean up the server.
