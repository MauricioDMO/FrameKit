---
name: framekit-distribution
description: Validate FrameKit packages and their distribution before publishing or after packaging changes. Use when creating or smoke-testing the @mauriciodmo/framekit or @mauriciodmo/create-framekit tarballs, checking generated consumer projects, diagnosing package-install or FrameKit CLI build/start failures, or confirming a package has no workspace references.
---

# FrameKit Distribution

Validate from the repository root unless testing an isolated consumer. The root workspace is private and is never a publish target; only `@mauriciodmo/framekit` and `@mauriciodmo/create-framekit` are public packages.

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

3. Perform the manual tarball smoke test in a basic consumer project outside this repository. Follow `references/tarball-smoke-test.md`.

4. Report the commands run, tarball paths, results, and any generated artifacts. Do not claim browser end-to-end, visual regression, cross-platform, watcher, production start, or asset-copy coverage from the automated suite.

## Release And Publish

Follow `Docs/en/development/release.md` for the canonical release procedure. Every release must have an annotated git tag; do not publish an untagged version. Before publishing:

1. Update the versions in `packages/framekit/package.json` and `packages/create-framekit/package.json`, plus the `@mauriciodmo/framekit` dependency in `packages/create-framekit/template/package.json`.
2. Run the complete release gate above, including both tarball builds and the manual smoke test.
3. Commit the version changes and create an annotated tag:

   ```sh
   git commit -am "chore(release): publish <version>"
   git tag -a v<version> -m "Release v<version>"
   ```

4. Verify the npm session and publish `@mauriciodmo/framekit` before `@mauriciodmo/create-framekit`:

   ```sh
   npm whoami
   pnpm --filter @mauriciodmo/framekit publish --access public --tag latest
   pnpm --filter @mauriciodmo/create-framekit publish --access public --tag latest
   ```

   Use the appropriate dist-tag, such as `alpha`, for a prerelease.
5. Push the commit and tag only after both publish commands succeed:

   ```sh
   git push origin main --follow-tags
   ```

## Focused Validation

Use focused package tests while iterating; run the full release gate before a publish attempt.

```sh
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
```

`pnpm typecheck` also validates positive and negative template type fixtures. Build the core package before running Studio or the basic example because workspace consumers resolve its built `dist/` exports.

## CLI Checks

Run FrameKit commands from the consumer project root. They always scan `src/templates`; they do not accept an alternate project or templates path.

- Run `framekit generate` after changing template structure; it creates `.framekit/generated/templates.ts` only when content changes.
- Run `framekit check` to validate definitions and locale data. It regenerates first and cleans temporary checker files even on failure.
- Run `framekit build` for the consumer release check. It runs `check` first, then builds Next.js and copies static assets beside the standalone server.
- Run `framekit start` only after a successful build. It requires exactly one valid standalone server.

Read `references/cli-and-failures.md` when a CLI or installation step fails.

## Package Expectations

- `@mauriciodmo/framekit` contains `bin/`, `dist/`, `README.md`, and `LICENSE`; CSS is emitted as `dist/styles.css`.
- `@mauriciodmo/create-framekit` contains `dist/`, `template/`, `README.md`, and `LICENSE`; its template is copied into the generated project.
- Confirm the generated `.framekit/generated/templates.ts` is present and gitignored in the generated consumer project.
- Confirm neither tarball retains a reference to the original workspace.
