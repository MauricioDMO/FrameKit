---
title: Unit and integration tests
description: Run Vitest suites, place tests in the right tree, and select focused workspace checks.
---

# Unit and integration tests

Run these commands from the repository root. All three runtime workspaces use
Vitest, but each workspace owns a different part of the test surface.

## Focused commands

### FrameKit

```bash
pnpm --filter @mauriciodmo/framekit test
```

This runs the public package's nested Vitest suites. The default environment in
`packages/framekit/vitest.config.ts` is Node, with the repository setup file
installing the test `ResizeObserver`. React component suites opt into `jsdom`
when they need a DOM, and use files such as `*.test.tsx` under the nearest
`__tests__/` directory.

For the focused discovery and code-generation suites used by the Windows CI
job, run:

```bash
pnpm --filter @mauriciodmo/framekit exec vitest run src/tooling/discovery src/tooling/codegen
```

### Studio

```bash
pnpm --filter studio test
```

The Studio script runs `framekit generate` before `vitest run`. This keeps the
generated bindings current for the Studio tests. From a clean checkout, build
the public package first:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter studio test
```

The current Studio integration suites under
`apps/studio/src/__tests__/framekit/` cover generation from an isolated
project, application adapters, and the private render page. They run through
Vitest; they do not replace the production-server Chromium tests.

### create-framekit

```bash
pnpm --filter @mauriciodmo/create-framekit test
```

These suites cover creator runtime requirements and project helper behavior,
including temporary project creation and failure paths. Consumer behavior that
depends on packed artifacts belongs in the tarball smoke path.

### All runtime tests

```bash
pnpm test
```

The root script recursively runs the `test` script in every workspace that
defines one. It does not run Playwright E2E or the distribution smoke scripts.

## What to test at this level

Use unit tests for one runtime contract or algorithm: field and template
validation, data resolution, server request boundaries, access behavior,
discovery, code generation helpers, or CLI argument handling are current
examples.

Use component tests for React rendering and interaction in the test DOM. The
FrameKit package has file-level `// @vitest-environment jsdom` suites for editor
controls, Studio components, navigation, local storage, and related behavior.
This is simulated DOM coverage, not a real browser run.

Use integration tests when the behavior crosses modules, generated source,
application adapters, or a process boundary. Keep the test in the workspace
that owns that boundary. A generated consumer's install, build, and standalone
start path is a distribution concern and is covered by the [generated consumer
guide](/en/contributors/distribution/generated-consumer).

## Placement rules

- Put runtime tests under the nearest `__tests__/` directory, not beside the
  implementation file.
- Mirror the production domain below that directory, such as
  `packages/framekit/src/core/validation/__tests__/definition/` or
  `packages/framekit/src/tooling/cli/__tests__/`.
- Vitest discovers nested `*.test.ts` and `*.test.tsx` files recursively.
- Keep shared runtime fixtures inside the relevant `__tests__/` tree.
- Do not create a generic package-level test directory or put test-only helpers
  in production source directories.

The [coding conventions](/en/contributors/development/coding-conventions)
page also documents the configured `@/*` test alias and the rule to update the
TypeScript and Vitest resolvers together when an alias changes.

## Type fixtures are separate

`packages/framekit/type-tests/` contains compile-time contract cases, not
runtime tests. Its directories cover fields, templates, public API entrypoints,
and Next.js or Studio integrations. Positive cases must type-check; negative
cases use `@ts-expect-error` for the error that the contract requires.

The FrameKit package runs both its normal type check and the fixture project:

```bash
pnpm --filter @mauriciodmo/framekit typecheck
```

The root command runs that package check along with the other workspace
type-check scripts:

```bash
pnpm typecheck
```

## Limits

Vitest suites can prove runtime and component contracts without proving that a
production Next.js server, a real Chromium browser, or a published package
works end to end. Add [browser E2E](/en/contributors/testing/e2e-and-smoke) for
the critical production Studio path and the appropriate distribution smoke for
packaged consumers.
