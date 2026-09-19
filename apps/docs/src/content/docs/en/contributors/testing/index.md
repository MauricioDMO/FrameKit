---
title: Contributor testing
description: Choose the FrameKit test level and verification command that matches a repository change.
---

# Contributor testing

Run repository commands from the FrameKit checkout root. Each test level answers
a different question; passing one level does not replace the others.

## Test levels

| Level | Primary location | What it proves | Main command |
| --- | --- | --- | --- |
| Unit | The nearest `__tests__/` tree under a package | A focused runtime, validation, server, tooling, or CLI behavior | The owning workspace's `test` script |
| Component | React tests under the nearest `__tests__/` tree | Component rendering and interaction in the configured DOM test environment | `pnpm --filter @mauriciodmo/framekit test` |
| Integration | Workspace integration tests and cross-module Vitest suites | Behavior across modules, generated source, adapters, or a child process | The owning workspace's `test` script |
| Type fixtures | `packages/framekit/type-tests/` | Public TypeScript contracts, including expected errors | `pnpm typecheck` |
| E2E | Repository-level `e2e/` | Critical Studio and image API paths in a production build with Chromium | `pnpm test:e2e` |
| Smoke | `tooling/smoke-tarballs.mjs` and `tooling/smoke-docker.mjs` | Packaged consumer and container behavior outside the checkout | `pnpm smoke:tarballs` or `pnpm smoke:docker -- <exact-published-framekit-version>` |

Unit, component, and integration tests use Vitest. Component files that need a
DOM opt into `jsdom` with a file-level Vitest environment comment; the package
configurations otherwise default to Node. Type fixtures are compile-time tests,
not Vitest tests.

## Choose a command

Use the focused workspace command while changing one area, then use the root
checks when the change crosses workspace or public-package boundaries:

```bash
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
pnpm test
pnpm typecheck
pnpm test:e2e
```

From a clean checkout, build `@mauriciodmo/framekit` before focused Studio
tests, type-checks, or other commands that execute the FrameKit CLI. The
[contributor workflow](/en/contributors/development/workflow) documents the
package-first order.

## Add coverage with a change

Place runtime tests below the nearest `__tests__/` directory and mirror the
production domain. Keep shared runtime fixtures in that test tree. Put public
compile-time contract fixtures only under
`packages/framekit/type-tests/`, grouped by context. Put browser workflows in
the repository-level `e2e/` directory.

The [coding conventions](/en/contributors/development/coding-conventions)
page contains the placement, alias, and import-boundary rules. The [feature
guide](/en/contributors/development/adding-features) maps change types to the
smallest useful test and broader gates.

## Coverage boundaries

The current suite does not provide visual regression or pixel comparison
coverage, a complete Firefox/WebKit browser matrix, or a clipboard gate. The
Chromium E2E path covers critical workflows, not every Studio interaction.
Tarball and Docker smoke tests validate distribution and deployment contracts;
Docker smoke is an operational release check, not a unit test.
