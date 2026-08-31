# Phase 6 - Architectural Import Boundaries

- **Status:** Proposed; implement after Phase 5 has passed its exit gate.
- **Depends on:** [Phase 5 - Published semantic design tokens](./05-design-tokens.md).
- **Audience:** FrameKit maintainers implementing the final maintainability PR.

## Goal

Make the intended package and source-layer direction executable with the existing
ESLint flat configurations. Use only ESLint's built-in `no-restricted-imports`
rule, scoped to the smallest useful file globs. Do not add an architecture
framework, a custom plugin, a second boundary checker, or a new dependency.
Treat bare and `node:`-prefixed Node built-ins identically, and protect the
configuration with a runnable negative contract test.

This phase is a behavior-preserving configuration and import-cleanup PR. It does
not change the public export map, tsdown entry map, runtime behavior, generated
output, or package ownership.

## Phase 5 dependency

Do not start the implementation until Phases 1-5 have passed their exit gates.
Before adding restrictions, verify the existing source/generated distinction,
canonical consumer workflow, and supported public imports. The final Phase 6
review must still run the canonical isolated-consumer workflow; linting a
workspace is not proof that a packed package works outside the workspace.

## Current baseline

### ESLint and command coverage

The three existing flat configurations are:

- `packages/framekit/eslint.config.mjs` currently spreads
  `eslint-config-next/typescript` and has no local rules. Its package script
  runs `eslint src scripts tsdown.config.ts`.
- `apps/studio/eslint.config.mjs` currently combines the Next and Tailwind
  configurations and explicitly ignores `.framekit/**`,
  `src/generated/framekit/**`, and Next/build output. Its package script runs
  `eslint .`.
- `packages/create-framekit/eslint.config.mjs` currently spreads
  `eslint-config-next` and disables only
  `@next/next/no-html-link-for-pages`. Its package script currently runs
  `eslint src tsdown.config.ts`; it does not currently visit
  `template/src/**`.

Generated registries are written to `src/generated/framekit/**`, not to
`.framekit/**`. The Studio config already ignores both generated locations
(`src/generated/framekit/**` and `.framekit/**`). The creator config has no such
generated-source ignore: when its lint target is extended to `template/src`, it
will also lint an existing `template/src/generated/framekit/**` registry. The
generated `.framekit/**` directory is outside that target. Neither location may
be hand-edited.

The root script is `pnpm -r --if-present lint`, so `pnpm lint` executes the
lint scripts of the three workspaces. The creator lint target must include
`template/src` in this phase; otherwise the generated consumer source is not
covered by the rule even if the flat-config override exists.

The current CI Ubuntu `verify` job runs `pnpm lint` on Node.js `22.13.0` and
`24`, after building both public packages. That makes the boundary rules merge
gates in both Linux matrix lanes. The current Windows smoke job does not run
workspace lint and must not be described as doing so.

The requested scope names `scripts/check-runtime-imports.mjs`, but that file is
not present in this checkout. The actual root mapping is:

```json
"check:runtime": "node scripts/check-runtime-contract.mjs"
```

`check-runtime-contract.mjs` checks Node.js/pnpm manifests, documentation, and
the CI runtime matrix. It is a distinct runtime-portability contract, not an
import-boundary checker. Keep `pnpm check:runtime` unchanged and do not duplicate
its work with a new script.

### Import graph observed before enforcement

The current static imports describe this intended direction:

- `packages/framekit/src/types.ts` and `src/core/**` use foundational types and
  core modules. `types.ts` has a legitimate `import type { ReactNode } from
  'react'`; `core/define-template.ts` has the same legitimate React type use.
- `src/editor/**` uses core/types and its editor-local modules. The editor's
  `framekit-navigation.tsx` legitimately imports `next/link` and
  `next/navigation`.
- `src/studio/**` uses core/types and editor modules. The current Studio
  implementation imports `FrameKitEditor`, navigation, and editor message
  types; this is the allowed upward composition direction.
- `src/cli/**` uses discovery, codegen, core/types, and the dev-server path.
  `cli/dev.ts` importing `../dev/**` is intentional and must remain valid.
- `src/dev/**`, `src/codegen/**`, and `src/discovery/**` use Node/tooling
  dependencies and foundational contracts. They do not currently import the
  editor or Studio implementation.
- Node built-ins currently use `node:*` specifiers and occur in the CLI, dev,
  codegen, and discovery implementation/test paths, not in the foundation,
  editor, or Studio implementation paths. A bare built-in such as `fs` is the
  same dependency and must not bypass enforcement. `src/studio/root.tsx` is the
  intentional Next server boundary and imports `next/headers`; that is not a
  Node built-in import.
- `apps/studio/src/**` and
  `packages/create-framekit/template/src/**` use the published FrameKit
  entries, generated `@framekit/generated/**` modules, and their own source.
  The generated registries under `template/src/generated/framekit/**` also use
  the published root type and dynamic relative imports of consumer templates.
  No current consumer static import uses `packages/framekit/src/**` or an
  unsupported `@mauriciodmo/framekit` subpath.
- `packages/create-framekit/src/**` currently uses Node and its own local
  modules; it has no FrameKit source-tree import.

The scan found no current static import or re-export declaration that violates
the boundaries below. Several apparent matches are generated source strings,
not imports in the module being linted: for example, `cli/check.ts`, codegen
modules, and `codegen/write-template-module.test.ts` emit or assert source
containing `@mauriciodmo/framekit` imports. ESLint must not be made to treat
those strings as runtime edges.

There are also deliberate dynamic imports. `editor/export-template.ts` loads
the browser-only `modern-screenshot` dependency; generated registries load
consumer-local templates or brand components; and the generation integration
tests dynamically load temporary fixture modules. None is a current dynamic
import of an unsupported FrameKit public subpath. `no-restricted-imports` does
not inspect `import()` expressions, so this phase makes no claim to enforce
dynamic-import boundaries. Keep that limitation explicit rather than adding a
second checker.

The current package contract is also explicit. `packages/framekit/package.json`
exports exactly `.`, `./editor`, `./studio`, `./studio/root`, `./dev`, and
`./styles.css`. `packages/framekit/tsdown.config.ts` has matching public entries
plus the internal `cli` build entry. Phase 6 preserves both facts.

## Allowed dependency direction

Use this direction as the review model. An arrow means “may import from”; it is
not a request to introduce new imports.

| Layer | May import | Must not import |
| --- | --- | --- |
| Foundation: `types.ts`, `core/**`, `markdown/**`, root core entry | External React types and foundation-local modules; no Node built-ins | `editor`/`editor.ts`, `studio`/`studio.ts`/`studio-root.ts`, and all `cli/**`, `codegen/**`, `discovery/**`, and `dev`/`dev.ts` tooling modules |
| Editor: `editor/**`, `editor.ts` | Foundation, React/browser APIs, and the legitimate Next navigation imports; no Node built-ins | `studio`/`studio.ts`/`studio-root.ts` and all `cli/**`, `codegen/**`, `discovery/**`, and `dev`/`dev.ts` tooling modules |
| Studio: `studio/**`, `studio.ts`, `studio-root.ts` | Foundation and Editor, React, and Next (including the server-only `next/headers` used by `studio/root.tsx`); no Node built-ins | All `cli/**`, `codegen/**`, `discovery/**`, and `dev`/`dev.ts` tooling modules |
| Tooling: `codegen/**`, `discovery/**`, `dev/**`, `dev.ts`, `cli/**`, `cli.test.ts` | Foundation and Node/tooling dependencies; CLI may compose the dev-server and codegen/discovery paths | Editor and Studio implementation modules and entries |
| Consumers: `apps/studio/src/**` and generated-template source | Supported public package entries, `@framekit/generated/**`, and consumer-local modules | Direct FrameKit source paths (`packages/framekit/src/**` or the canonical template's relative sibling spelling) and every unsupported FrameKit subpath |

The public package entries remain separate boundaries:

- `src/index.ts` exposes foundation functionality only.
- `src/editor.ts` exposes the Editor entry only.
- `src/studio.ts` and `src/studio-root.ts` expose Studio entries only.
- `src/dev.ts` exposes development/codegen/discovery functionality.
- `src/cli/index.ts` is the CLI build entry, not a supported package export.

The rules enforce the prohibited static source-layer edges and all static Node
built-in specifier spellings in the foundation, editor, and Studio
implementation globs. They do not ban React, Next, Node from tooling, test
libraries, or all external packages. The consumer rule permits the public
`./dev` entry because it is an existing supported export; that does not make the
implementation's `src/dev/**` modules browser-compatible.

## Exact ESLint rule map

Append the following file-scoped overrides to
`packages/framekit/eslint.config.mjs`, after the existing `...nextTs` entries.
The patterns intentionally use module-specifier globs rather than a resolver or
filesystem graph. `no-restricted-imports` is an existing ESLint core rule.

Before the config array, import `builtinModules` from `node:module` and derive
the bare-specifier restriction list from the running supported Node version.
Use a separate `node:*` pattern for every prefixed built-in, including
prefix-only modules such as `node:test` that older supported Node versions do
not consistently expose through `builtinModules`. This avoids a partial
handwritten list and keeps Node 22/24 enforcement equivalent:

```js
import { builtinModules } from 'node:module'

const restrictedBareNodeImports = builtinModules
  .filter((moduleName) => !moduleName.startsWith('node:'))
  .map((name) => ({
    name,
    message: 'Node.js built-ins are not allowed in reusable FrameKit code.',
  }))
```

Use this exact list as `paths: restrictedBareNodeImports` in each of the three
foundation/editor/Studio rule objects below. Add a separate first pattern group
for `node:*`; keep the remaining pattern group responsible only for source-layer
direction. Together they cover bare imports, prefixed imports, prefix-only
built-ins, and subpaths such as `fs/promises` on both supported Node lanes.

### `packages/framekit/eslint.config.mjs`

#### Foundation and root entry

```js
{
  files: [
    'src/core/**/*.{ts,tsx}',
    'src/types.ts',
    'src/markdown/**/*.{ts,tsx}',
    'src/index.ts',
  ],
  rules: {
    'no-restricted-imports': ['error', {
      paths: restrictedBareNodeImports,
      patterns: [{
        group: ['node:*'],
        message: 'Node.js built-ins are not allowed in reusable FrameKit code.',
      }, {
        group: [
          '**/editor', '**/editor.*', '**/editor/**',
          '**/studio', '**/studio.*', '**/studio/**',
          '**/studio-root', '**/studio-root.*', '**/studio-root/**',
          '**/cli', '**/cli.*', '**/cli/**',
          '**/codegen', '**/codegen.*', '**/codegen/**',
          '**/discovery', '**/discovery.*', '**/discovery/**',
          '**/dev', '**/dev.*', '**/dev/**',
          '@mauriciodmo/framekit/editor', '@mauriciodmo/framekit/editor/**',
          '@mauriciodmo/framekit/studio', '@mauriciodmo/framekit/studio/**',
          '@mauriciodmo/framekit/studio/root',
          '@mauriciodmo/framekit/cli', '@mauriciodmo/framekit/cli/**',
          '@mauriciodmo/framekit/dev', '@mauriciodmo/framekit/dev/**',
        ],
        message: 'Foundation and the root entry must not import upper layers or tooling modules.',
      }],
    }],
  },
}
```

This covers `src/types.ts` without restricting its valid React type import.

#### Editor and editor entry

```js
{
  files: ['src/editor/**/*.{ts,tsx}', 'src/editor.ts'],
  rules: {
    'no-restricted-imports': ['error', {
      paths: restrictedBareNodeImports,
      patterns: [{
        group: ['node:*'],
        message: 'Node.js built-ins are not allowed in reusable FrameKit code.',
      }, {
        group: [
          '**/studio', '**/studio.*', '**/studio/**',
          '**/studio-root', '**/studio-root.*', '**/studio-root/**',
          '**/cli', '**/cli.*', '**/cli/**',
          '**/codegen', '**/codegen.*', '**/codegen/**',
          '**/discovery', '**/discovery.*', '**/discovery/**',
          '**/dev', '**/dev.*', '**/dev/**',
          '@mauriciodmo/framekit/studio', '@mauriciodmo/framekit/studio/**',
          '@mauriciodmo/framekit/studio/root',
          '@mauriciodmo/framekit/cli', '@mauriciodmo/framekit/cli/**',
          '@mauriciodmo/framekit/dev', '@mauriciodmo/framekit/dev/**',
        ],
        message: 'Editor modules must not import Studio or tooling modules.',
      }],
    }],
  },
}
```

#### Studio and Studio entries

```js
{
  files: [
    'src/studio/**/*.{ts,tsx}',
    'src/studio.ts',
    'src/studio-root.ts',
  ],
  rules: {
    'no-restricted-imports': ['error', {
      paths: restrictedBareNodeImports,
      patterns: [{
        group: ['node:*'],
        message: 'Node.js built-ins are not allowed in reusable FrameKit code.',
      }, {
        group: [
          '**/cli', '**/cli.*', '**/cli/**',
          '**/codegen', '**/codegen.*', '**/codegen/**',
          '**/discovery', '**/discovery.*', '**/discovery/**',
          '**/dev', '**/dev.*', '**/dev/**',
          '@mauriciodmo/framekit/cli', '@mauriciodmo/framekit/cli/**',
          '@mauriciodmo/framekit/dev', '@mauriciodmo/framekit/dev/**',
        ],
        message: 'Studio modules must not import tooling modules.',
      }],
    }],
  },
}
```

#### Tooling reverse-edge guard

This small companion override keeps a future tooling change from creating the
opposite dependency edge. It permits the current CLI-to-dev-server direction.

```js
{
  files: [
    'src/codegen/**/*.{ts,tsx}',
    'src/discovery/**/*.{ts,tsx}',
    'src/dev/**/*.{ts,tsx}',
    'src/dev.ts',
    'src/cli/**/*.{ts,tsx}',
    'src/cli.test.ts',
  ],
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: [
          '**/editor', '**/editor.*', '**/editor/**',
          '**/studio', '**/studio.*', '**/studio/**',
          '**/studio-root', '**/studio-root.*', '**/studio-root/**',
          '@mauriciodmo/framekit/editor', '@mauriciodmo/framekit/editor/**',
          '@mauriciodmo/framekit/studio', '@mauriciodmo/framekit/studio/**',
          '@mauriciodmo/framekit/studio/root',
        ],
        message: 'Tooling modules must not import editor or Studio implementation modules.',
      }],
    }],
  },
}
```

No `allowTypeImports` option is used. A type-only import from an upper layer is
still an architectural dependency; the legitimate React type imports do not
match any restricted pattern.

### Consumer public-entry guard

Add the following override to `apps/studio/eslint.config.mjs`. Add the same
`rules` object to `packages/create-framekit/eslint.config.mjs`, but use the
template-source glob shown below: `packages/create-framekit/src/**` is the
scaffolding CLI, while `template/src/**` is the generated consumer source.

```js
{
  files: ['src/**/*.{js,jsx,ts,tsx}'], // apps/studio
  rules: {
    'no-restricted-imports': ['error', {
      patterns: [{
        group: [
          '@mauriciodmo/framekit/*',
          '@mauriciodmo/framekit/**',
          'packages/framekit/src',
          'packages/framekit/src/**',
          '**/packages/framekit/src',
          '**/packages/framekit/src/**',
          'framekit/src',
          'framekit/src/**',
          '**/framekit/src',
          '**/framekit/src/**',
          '!@mauriciodmo/framekit/editor',
          '!@mauriciodmo/framekit/studio',
          '!@mauriciodmo/framekit/studio/root',
          '!@mauriciodmo/framekit/dev',
          '!@mauriciodmo/framekit/styles.css',
        ],
        message: 'Consumers may use only supported @mauriciodmo/framekit entry points; never import FrameKit source directly.',
      }],
    }],
  },
}
```

In `packages/create-framekit/eslint.config.mjs`, use this file selector with the
same `rules` object:

```js
files: ['template/src/**/*.{js,jsx,ts,tsx}'],
```

The negated patterns are last because ESLint applies pattern exceptions in
order. The root package name is not matched by the `/*` or `/**` patterns, so
`@mauriciodmo/framekit` remains allowed. The only allowed subpaths are exactly
`editor`, `studio`, `studio/root`, `dev`, and `styles.css`; `studio/*`, `cli`,
`server`, `dist/*`, and any other subpath remain errors. The rule also catches
monorepo-relative spellings through `packages/framekit/src/**` and from the
canonical template through its sibling `framekit/src/**`, without trying to
resolve aliases. `@framekit/generated/**` is a separate TypeScript
path alias from the consumer `tsconfig.json`, not a FrameKit package subpath or
new public export, so it is intentionally not in this group. The rule checks
static import and re-export declarations; it does not replace a resolver or
inspect arbitrary generated source strings or runtime `import()` expressions.

In `apps/studio/eslint.config.mjs`, keep the existing
`globalIgnores([...])` block, including `.framekit/**` and
`src/generated/framekit/**`. Do not replace it with an import exception. The
`@framekit/generated/**` alias used by generated registries does not match the
FrameKit package patterns and remains valid. In the creator config, linting
`template/src` visits `template/src/generated/framekit/**` when that generated
registry exists, but does not visit the sibling `.framekit/**` directory. The
registry is therefore covered as generated consumer source without adding an
ignore, fixture, or second checker; it remains generated output and must not be
edited by hand.

### Creator lint target

The public-entry override in the creator config is inert for generated template
source unless the existing package script visits that directory. Make this
minimal script-only wiring change in `packages/create-framekit/package.json`:

```json
"lint": "eslint src template/src tsdown.config.ts"
```

Do not add a template package, a template-specific ESLint config, or another
boundary command. The existing creator flat config remains the sole config for
both `src/**` and `template/src/**`.

### Executable boundary contract

Add `packages/framekit/scripts/architecture-boundaries.test.ts`. Use the
already-installed `eslint` package's Node API; do not write fixture files or add
a test dependency. Create one `ESLint` instance for each existing workspace
config and call `lintText` with virtual source plus an absolute `filePath` so the
real flat-config globs are exercised.

The test must assert `no-restricted-imports` errors for:

- both `import 'fs'` and `import 'node:fs'` from a virtual foundation file;
- both `fs/promises` spellings, proving built-in subpaths cannot bypass the
  restriction;
- `node:test`, proving prefix-only built-ins are retained without inventing a
  bare equivalent;
- one representative prohibited edge for each package rule: foundation to
  editor, editor to Studio, Studio to tooling, and tooling to editor;
- an unsupported `@mauriciodmo/framekit/server` import in both consumer
  configs;
- realistic direct-source imports from each virtual route: a
  `../../../../../packages/framekit/src/index` spelling from first-party Studio
  and `../../../../../../framekit/src/index` from the canonical template.

It must also assert no boundary-rule error for:

- Node built-ins from virtual CLI, codegen, discovery, dev, script, and
  tooling-test paths outside the reusable implementation globs;
- the legitimate React type, Next navigation, and `next/headers` imports;
- all six supported public package imports and `@framekit/generated/**` in both
  consumer configs.

Assert the expected `ruleId`, not only a non-empty message list, so parser or
unrelated lint failures cannot make a negative case pass accidentally. Keep
normal workspace lint as the broad integration gate; this small test is the
regression check that proves the restrictions themselves reject and allow the
intended examples.

## Accepted existing exceptions

These are intentional and must survive the rule addition:

1. `ReactNode` in `src/types.ts` and the corresponding React type use in
   `src/core/define-template.ts` remain valid. This plan does not impose a
   blanket React or external-dependency ban.
2. `src/editor/framekit-navigation.tsx` may continue to import
   `next/link` and `next/navigation`. Next.js use is legitimate in that editor
   component.
3. `apps/studio/src/test/framekit/generation.integration.test.ts` may import
   `@mauriciodmo/framekit/dev`; `./dev` is a supported public entry and is the
   existing test/codegen utility path. Tests may continue to import their test
   libraries and local test utilities.
4. `apps/studio` continues to ignore its generated `.framekit/**` and
   `src/generated/framekit/**` paths through the existing global ignores. The
   creator's `template/src` lint target intentionally includes
   `template/src/generated/framekit/**` when present, so generated registries
   are checked without being hand-edited; generated `.framekit/**` remains
   outside that target. Generated `@framekit/generated/**` imports are a
   separate consumer alias and are not restricted by the public-entry rule.
5. The six supported package imports remain valid everywhere consumers need
   them: `@mauriciodmo/framekit`, `@mauriciodmo/framekit/editor`,
   `@mauriciodmo/framekit/studio`, `@mauriciodmo/framekit/studio/root`,
   `@mauriciodmo/framekit/dev`, and `@mauriciodmo/framekit/styles.css`.
6. CLI-to-dev-server composition remains valid. The rule blocks the reverse
   direction from foundation, editor, Studio, and tooling UI boundaries; it
   does not block `src/cli/**` from importing `src/dev/**`. The built-in
   restriction applies only to foundation, editor, and Studio implementation
   globs; both bare and `node:` built-ins remain valid in tooling and in
   consumer/test files outside those globs, and `next/headers` remains valid in
   `studio/root.tsx`.

No current static violation needs an exception. If the first lint run exposes
one, classify it as Phase 6 implementation work and fix the import or its layer
before merge. Do not silently add it to an allow list or weaken a file glob.

## Numbered implementation steps

1. Confirm the Phase 5 exit gate and re-run the static import inventory above
   against the post-refactor tree. Separate actual import declarations from
   generated strings, test fixtures, and ignored output.
2. Derive `restrictedBareNodeImports` from `node:module`, add the `node:*`
   pattern, then add the three foundation/editor/Studio overrides and the small
   tooling reverse-edge override to `packages/framekit/eslint.config.mjs`
   exactly as mapped above. Preserve the Next config spread and all existing
   package lint targets.
3. Add the consumer public-entry override to
   `apps/studio/eslint.config.mjs`, preserving Tailwind settings and all current
   generated/build ignores.
4. Add the same consumer rules to
   `packages/create-framekit/eslint.config.mjs` with the
   `template/src/**/*.{js,jsx,ts,tsx}` selector, then extend only its existing
   lint target to include `template/src`.
5. Add `packages/framekit/scripts/architecture-boundaries.test.ts` with the
   negative and positive ESLint API cases above. Keep it source-text-only: no
   fixture package, generated file, or new dependency.
6. Run the package-local ESLint commands before changing imports. If a real
   violation exists, fix it within the established direction using existing
   modules; do not refactor packages, split files, rewrite barrels, or add
   public exports. Record any necessary import move in the Phase 6 PR review.
7. Run the architecture contract test, verify the merged rule for
   representative files with `eslint --print-config`, then run the complete
   workspace lint. Confirm that test utilities, Next navigation, generated
   aliases, the `next/headers` server boundary, and all six supported public
   imports remain accepted. Confirm that bare and `node:` built-ins are rejected
   in reusable static imports and accepted in tooling. Keep deliberate dynamic
   imports unchanged; do not treat them as covered by ESLint.
8. Build FrameKit before Studio, run the existing tests/type checks, and repeat
   the Phase 5 canonical-consumer checks. Inspect the package export map and
   tsdown entries to prove that this phase changed enforcement only.
9. Review the diff for accidental generated output, source refactors, package
   manifest changes other than the creator lint target, or changes to
   `check:runtime`.

## Verification commands

Run from the repository root:

```bash
pnpm install --frozen-lockfile
pnpm format:check
pnpm check:runtime
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm --filter @mauriciodmo/framekit exec eslint src scripts tsdown.config.ts
pnpm --filter studio exec eslint .
pnpm --filter @mauriciodmo/create-framekit exec eslint src template/src tsdown.config.ts
pnpm --filter @mauriciodmo/framekit exec eslint --print-config src/core/define-template.ts
pnpm --filter @mauriciodmo/framekit exec eslint --print-config src/editor/framekit-navigation.tsx
pnpm --filter studio exec eslint --print-config 'src/app/editor/[[...slug]]/page.tsx'
pnpm --filter @mauriciodmo/create-framekit exec eslint --print-config 'template/src/app/editor/[[...slug]]/page.tsx'
pnpm --filter @mauriciodmo/framekit exec vitest run scripts/architecture-boundaries.test.ts
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @mauriciodmo/framekit pack --dry-run
pnpm --filter @mauriciodmo/create-framekit pack --dry-run
git diff --check
```

`pnpm lint` is the executable repository gate: it recursively invokes the
three existing workspace lint scripts, and the creator script now includes the
canonical generated-template source. CI's Ubuntu matrix already runs that
same command in both supported Node lanes. `check:runtime` remains the
separate Node/pnpm portability check; it must not be replaced by, or merged
with, ESLint. The canonical-consumer commands from Phase 5 must also be run
after building the public packages; they are not replaced by `pnpm lint`.

Phase 1 is a mandatory sequencing prerequisite, so `pnpm format:check` above is
part of the Phase 6 gate even though the current pre-roadmap checkout does not
define that script yet.

## Exit gate

Phase 6 is complete only when:

- Phases 1-5 have passed, and the Phase 5 canonical-consumer gate passes;
- the exact file globs and `no-restricted-imports` maps above are present in the
  three existing flat configs, with no new plugin or dependency;
- `pnpm lint` passes, including `template/src/**` through the existing creator
  lint script, and the CI Ubuntu matrix executes that gate;
- no current static import or re-export declaration violates the foundation,
  editor, Studio, tooling, or consumer direction, or every discovered
  violation has been corrected as Phase 6 work rather than hidden as an
  exception;
- the architecture contract test proves that bare, prefixed, and subpath Node
  built-ins are rejected in foundation, editor, and Studio implementation
  globs; Node built-ins remain valid in tooling, and `next/headers` remains
  valid in `studio/root.tsx`;
- dynamic `import()` expressions and generated source strings have been
  inventoried separately and are not described as ESLint-enforced boundaries;
- React type imports, Next navigation, test utilities, generated aliases and
  ignored generated output remain valid;
- consumers use only the package specifiers
  `@mauriciodmo/framekit`, `@mauriciodmo/framekit/editor`,
  `@mauriciodmo/framekit/studio`, `@mauriciodmo/framekit/studio/root`,
  `@mauriciodmo/framekit/dev`, and `@mauriciodmo/framekit/styles.css`, with no
  direct `packages/framekit/src/**` or sibling `framekit/src/**` import;
- `packages/framekit/package.json` exports and `tsdown.config.ts` entries are
  unchanged, and no new public export or package split was introduced;
- `pnpm format:check`, `pnpm check:runtime`, tests, type checks, builds, package
  dry-runs, and `git diff --check` pass; and
- the diff contains no generated output, source refactor, custom checker,
  fixture package, or unrelated configuration change.

Failure of any item blocks merge.

## Rollback and review guidance

Review this as one final roadmap PR. Review the file list first, then inspect
the rule patterns and their file globs, then inspect the lint output. Confirm
that every accepted exception is explained by the current graph rather than by
an `eslint-disable` or broad negated pattern.

If a rule creates a false positive, first verify whether the import is actually
one of the accepted paths. Narrow the affected file glob or pattern only when
the current architecture proves that it is legitimate; do not add a blanket
React, Next, Node, test, or type-import allowance. In particular, do not exempt
all Node imports to accommodate a consumer or test: keep the narrow
built-in rule on the FrameKit foundation/editor/Studio implementation globs and
scope any genuinely server-only exception to its actual file. If the direction
itself is wrong, stop and obtain a separate architecture decision instead of
weakening the policy in this phase.

If the exit gate fails, revert the Phase 6 PR as one unit. No runtime, data, or
public-export migration is required. Leave Phases 1-5 untouched and retain
`check:runtime` as the runtime portability baseline.

## Out of scope

- Source refactoring beyond correcting an actual Phase 6 import violation.
- A package split, dependency substitution, barrel rewrite, or new public
  export.
- A custom ESLint plugin, custom architecture framework, fixture package, or
  second boundary checker.
- A blanket Node, React, Next.js, test-utility, or type-only-import ban; the
  complete built-in restriction in the documented reusable FrameKit globs is
  the only Node/browser enforcement in this phase.
- Enforcement for dynamic `import()` expressions or arbitrary generated source
  strings.
- Changes to `check:runtime`, `scripts/check-runtime-contract.mjs`, or any
  replacement `scripts/check-runtime-imports.mjs`.
- Hand-editing `packages/framekit/dist/`, `.framekit/`, generated registries,
  Next output, or any other generated/build directory.
- New consumer compatibility guarantees, new package entry points, or changes
  to the six supported imports.
