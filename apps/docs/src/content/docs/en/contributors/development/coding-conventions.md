---
title: Coding conventions
description: Apply FrameKit's formatting, test placement, alias, and import-boundary conventions when changing code.
---

# Coding conventions

Follow the repository's shared ESLint Standard configuration before adding
local style rules. The [import boundaries](/en/contributors/development/import-boundaries)
page describes the runtime-layer rules that go with these conventions.

## Format code consistently

Linted JavaScript and TypeScript use the current Standard contract:

- two-space indentation;
- single quotes;
- no semicolons;
- no trailing commas; and
- a final newline.

The shared rules live in `tooling/eslint-standard.mjs`. Package ESLint configs
compose that configuration with their package-specific Next.js rules. Run the
owning workspace's lint script, then the root lint when the change crosses
workspaces:

```bash
pnpm --filter @mauriciodmo/framekit lint
pnpm lint
```

## Place tests under the nearest test tree

Runtime tests belong under the nearest `__tests__/` directory, not beside the
implementation file. Mirror the production domain below that directory. For
example, FrameKit core validation tests live under
`packages/framekit/src/core/validation/__tests__/`, while CLI tests live under
`packages/framekit/src/tooling/cli/__tests__/`.

Use the repository's existing test boundaries:

- Vitest discovers nested `*.test.ts` and `*.test.tsx` files;
- FrameKit compile-time public-contract fixtures live only under
  `packages/framekit/type-tests/`, grouped by context such as `public-api/`,
  `fields/`, `templates/`, or `integrations/`; and
- browser system tests live under the repository-level `e2e/` directory and
  run through Playwright.

Keep shared runtime-test fixtures inside the relevant `__tests__/` tree. Do not
create a generic package-level test directory or put test-only helpers in
production source directories.

## Use configured aliases deliberately

Package-local tests may use the configured `@/*` alias:

```typescript
import { createThing } from '@/domain/create-thing'
```

In this repository, `@/*` maps to `src/*` in `packages/framekit/`,
`packages/create-framekit/`, `apps/studio/`, and the generated template. When
adding or changing an alias, update both `compilerOptions.paths` and the test
runner resolver. A TypeScript-only alias is not enough at runtime.

Keep the existing relative-import style in implementation code unless the
package build configuration supports the new alias. Generated consumer modules
use the configured `@framekit/generated/*` boundary; they do not import
FrameKit source files.

## Respect import boundaries

Consumer-facing code imports the published package entrypoints, for example:

```typescript
import { defineTemplate } from '@mauriciodmo/framekit'
import { TemplateCanvas } from '@mauriciodmo/framekit/editor'
```

Do not import `packages/framekit/src/**` from a consumer, first-party Studio
adapter, or generated project. Keep client code out of the server facade and
keep Node built-ins and Playwright dependencies in Server or Tooling. Use the
[package architecture](/en/contributors/architecture/packages) and
[import boundaries](/en/contributors/development/import-boundaries) pages when
a change crosses a public or runtime-layer boundary.

Generated registries, copied assets, and build output are outputs, not a second
implementation. Change their maintained source and regenerate them instead of
editing the generated files directly.
