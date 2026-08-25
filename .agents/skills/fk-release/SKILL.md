---
name: fk-release
description: Validate FrameKit packages and their distribution before publishing or after packaging changes. Use when creating or smoke-testing the @mauriciodmo/framekit or @mauriciodmo/create-framekit tarballs, checking generated consumer projects, diagnosing package-install or FrameKit CLI build/start failures, or confirming a package has no workspace references.
---

# FrameKit Release

Validate from the repository root. The root workspace is private; only `@mauriciodmo/framekit` and `@mauriciodmo/create-framekit` are publish targets.

## Release Gate

1. Run the repository checks:

   ```sh
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

4. Report commands, tarball paths, results, and generated artifacts. Do not claim browser E2E, visual, cross-platform, watcher, production-start, or asset-copy coverage from the automated suite.

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
