# Testing and Distribution

## Test Commands

FrameKit uses Vitest as the test runner across all workspaces. The following commands are available from the repository root:

- `pnpm test` — runs Vitest in all workspaces that define a `test` script
- `pnpm --filter @mauriciodmo/framekit test` — runs unit tests for the core package; tests execute in a Node environment, with jsdom enabled for editor tests that require DOM or localStorage
- `pnpm --filter studio test` — runs integration tests for the Studio application; `framekit generate` is called as a precondition step before Vitest runs
- `pnpm --filter @mauriciodmo/create-framekit test` — runs unit tests for the CLI package
- `pnpm typecheck` — runs `tsc --noEmit` across all packages and additionally type-checks the type fixture suite (positive and negative template cases)
- `pnpm lint` — runs ESLint across all workspaces
- `pnpm build` — full rebuild of all workspaces; the core package is built first, then all dependent workspaces

## What Is Tested

The following areas are covered by the test suite:

**Template system:** Template discovery via the scanner (nested directories, exclusion of dot/underscore-prefixed paths, slug format validation), codegen of the template registry, and runtime template loading.

**Navigation:** Derivation of the navigation tree from the manifest, alphabetical slug ordering, and nested category handling.

**Data resolution:** Application of default values, locale-content precedence, user-edit overrides, and the guarantee that `language` is never copied into `data`.

**Definition and validation:** Runtime validation of template definitions (invalid descriptors, incoherent bounds, decimal dimensions, missing render) and field-level validators (required, number range, URL format, locale-switching behavior).

**Editor state:** localStorage persistence and session restore, reset of a single locale (only that locale's overrides are removed), locale switching (does not mutate other locales' overrides), and clearing of visible errors on reset or locale change.

**CLI:** Argument parsing and error paths, check gating a Next.js build, and discovery of standalone template directories.

**Type-level fixtures:** Both positive cases (valid templates that must type-check) and negative cases (invalid templates that must produce a `tsc` error, using `@ts-expect-error`) run as part of `pnpm typecheck`.

## What Is Not Tested

The test suite does not cover:

- **Browser end-to-end tests** — there are no Playwright or Cypress tests; the Studio integration tests cover generation and build but do not drive a browser.
- **Visual regression** — no PNG pixel or dimension comparison tests exist.
- **Full Studio flow** — navigating to a page, editing a field, switching locale, resetting, and exporting the result is not covered as a single automated flow.
- **Production build and start** — successful execution of `next build` followed by `next start` is not verified inside unit or integration tests; the CI build step confirms the build completes without error, but does not start the server.
- **Asset copying** — public directory and static file copying are not directly unit-tested.
- **Other operating systems** — CI runs on Ubuntu only. Windows and macOS are not verified, so this documentation does not claim a complete cross-platform support guarantee.
- **Watcher behavior** — signal propagation, file watching under load, and watcher edge cases are outside the current test scope.

## Distribution and Packaging

### @mauriciodmo/framekit

Build the tarball with:

```
pnpm --filter @mauriciodmo/framekit pack
```

The resulting `.tgz` contains: `bin/`, `dist/`, `README.md`, `LICENSE`.

tsdown produces an unbundled ESM output. The following packages remain external (not bundled): `react`, `react-dom`, `next`, `lucide-react`, `modern-screenshot`, `chokidar`, `tsx`. CSS is compiled separately via the Tailwind CLI and placed in `dist/styles.css`.

A post-build check (`check-dist.ts`) recursively scans all emitted `.js` files under `dist/` for import-boundary violations, verifying that relative imports resolve to files inside the package. It also checks that string targets in `exports` and `bin` are `./...` paths to existing files inside the package.

### @mauriciodmo/create-framekit

Build the tarball with:

```
pnpm --filter @mauriciodmo/create-framekit pack
```

The resulting `.tgz` contains: `dist/`, `template/`, `README.md`, `LICENSE`.

The `template/` directory is copied at install time relative to the installed package location. When a user runs `create-framekit`, the template is placed into their project as a standalone copy, not referenced from the package directory.

## Tarball Smoke Test (Manual)

To validate both tarballs before any publish step:

1. Create an isolated basic consumer project outside the FrameKit repository.
2. Install the FrameKit tarball into it: `pnpm add <path-to-framekit-tgz>`.
3. Run `pnpm check` and `pnpm build` in the consumer project and confirm both succeed.
4. Install the `create-framekit` tarball and run `create-framekit <new-directory>` from a path outside the repository.
5. Inside the generated project, substitute the FrameKit workspace dependency with the local tarball, then run `pnpm install`, `pnpm check`, and `pnpm build`.
6. Confirm that `.framekit/generated/templates.ts` is generated and gitignored, and that neither tarball left any reference to the original workspace.

Both tarballs must install and generate without errors before any publish attempt.

---

[English](./testing-and-distribution.md) · [Español](../../es/development/testing-and-distribution.md)
