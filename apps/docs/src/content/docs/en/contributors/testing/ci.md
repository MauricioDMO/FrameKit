---
title: Continuous integration
description: Understand the FrameKit CI checks, operating-system lanes, and Node.js version matrix.
---

# Continuous integration

The workflow in `.github/workflows/ci.yml` runs on pushes and pull requests.
It uses pnpm `11.14.0` and keeps the repository checks separate from the
release-time smoke scripts.

## Runtime contract

The first verification-lane step is:

```bash
pnpm check:runtime
```

This checks that the root and package manifests agree on the Node.js and pnpm
engines, that the root `packageManager` value matches the pinned pnpm version,
that the runtime documentation contains the declared versions, and that the CI
workflow contains the expected Node.js and pnpm contract. It does not install
dependencies or run tests.

Run it locally when changing runtime versions, manifests, the CI matrix, or the
documentation covered by that contract.

## Linux verification matrix

The `verify` job runs on `ubuntu-latest` for both Node.js `22.13.0` and Node.js
`24`. Each matrix entry installs dependencies with the lockfile and runs the
same checks:

1. Build `@mauriciodmo/framekit`.
2. Build `@mauriciodmo/create-framekit`.
3. Run `pnpm lint`.
4. Run `pnpm test`.
5. Run `pnpm typecheck`.
6. Run `pnpm build`.
7. Dry-run packing for both public packages.

The root commands have these responsibilities:

| Command | CI purpose |
| --- | --- |
| `pnpm lint` | Run the recursive ESLint scripts for workspaces that define them. |
| `pnpm test` | Run the recursive Vitest scripts; this is not the Playwright E2E command. |
| `pnpm typecheck` | Run workspace TypeScript checks, including FrameKit's compile-time type fixtures. |
| `pnpm build` | Run the workspace build scripts after the public package prerequisites have been built. |

The initial public-package builds are explicit because Studio and generated
consumer commands resolve built `@mauriciodmo/framekit` files.

## Windows consumer lane

The `windows-smoke-test` job runs on `windows-latest` with Node.js `22.13.0`.
It installs dependencies, builds the public package and creator, runs the
discovery/code-generation Vitest paths and creator tests, and runs
`pnpm typecheck`.

It then creates a consumer with the built creator, installs a locally packed
FrameKit tarball in that consumer, runs `framekit generate` and `framekit check`,
and verifies both package tarballs with `pack --dry-run`.

This is a focused Windows generated-consumer and packaging path. It is not a
claim of a complete Windows production, browser, or visual test matrix.

## Chromium E2E lane

The `chromium-e2e` job runs on `ubuntu-latest` with Node.js `22.13.0`. It:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

The Playwright web server builds FrameKit, builds Studio, and starts the
production Studio server before the tests run. See [E2E and smoke tests](/en/contributors/testing/e2e-and-smoke)
for the two current browser flows and their limits.

## What CI does not run

The workflow does not run `pnpm smoke:tarballs` or
`pnpm smoke:docker`. The tarball smoke is a separate pre-publication artifact
check, and Docker smoke requires an exact published package version. CI also
does not add visual snapshots, clipboard export, or Firefox/WebKit gates.

Use the [contributor workflow](/en/contributors/development/workflow) for
focused local checks and the [feature guide](/en/contributors/development/adding-features)
to decide when a change needs broader tests or distribution verification.
