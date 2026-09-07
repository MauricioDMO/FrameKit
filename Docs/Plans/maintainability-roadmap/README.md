# Maintainability Roadmap

- **Status:** In progress; phases 1 through 5 are implemented and the Phase 5 shared exit gate passes.
- **Next:** After phases 1 through 5 pass their exit gates, execute the eight
  Server Image Rendering steps and its server gate; Phase 6 remains deferred
  until they are complete.
- **GitHub issue:** None required; this roadmap is intentionally independent of GitHub issues.
- **Audience:** FrameKit maintainers implementing one behavior-preserving PR per phase.
- **Scope:** Six behavior-preserving maintainability changes covering validation,
  editor ownership, Studio ownership, published styling, repository tooling, and
  import boundaries, with generated/build-output conventions preserved throughout.

## Purpose

This roadmap breaks maintainability work into six ordered pull requests. Each PR
has one concern, one reviewable boundary, and a hard exit gate. The work is
organizational or mechanical and must not be used as a vehicle for feature work
or unrelated cleanup.

The phase documents are implementation plans, not issue trackers. A maintainer
may implement them in order without creating, linking, or closing a GitHub issue.

## Invariants

Every phase preserves all of the following:

- Runtime behavior, tests' intended behavior, existing public JavaScript/type and
  component APIs, package exports, and package boundaries do not change. Phase 5
  may expose only its documented, bounded numeric color palette through the
  existing `./styles.css` export. Component- and state-specific aliases are not
  added. It does not add a stylesheet entry or JavaScript export.
- During phases 1 through 5, the six existing non-server
  `@mauriciodmo/framekit` exports remain `.`, `./editor`, `./studio`,
  `./studio/root`, `./dev`, and `./styles.css`. The current `./server` entry is
  available only as the Step 1 facade for contracts, authentication,
  configuration, and errors; jobs, browser, routes, image fetching, Docker,
  and rollout remain future work in Server Steps 2-8. Phase 6 is planned
  against the post-server graph and must distinguish the six current non-server
  entries from the eventual server surface.
- No consumer imports `packages/framekit/src/*` directly.
- Generated or build output is never hand-edited. This includes
  `packages/framekit/dist/`, `**/.framekit/`, `**/src/generated/framekit/`,
  `**/public/__framekit/`, and Next.js build output.
- `Docs/skills/` is the source for skills. `.agents/skills/` and
  `packages/create-framekit/template/.agents/skills/` are synchronized generated
  copies and remain governed by `pnpm sync:skills`.
- No package split, dependency substitution, separate generated-template lint
  script, or public export is introduced by this roadmap. Phase 6 extends the
  existing creator lint command to cover template source rather than adding a
  second template-lint script.

## Baseline drift rule

Before implementing any phase, validate the phase's stated baseline against the
current checkout. If files, symbols, commands, or package versions changed after
this roadmap was written or while earlier phases were being merged, adapt the
implementation map to the current repository while preserving the roadmap
invariants, intended ownership, sequencing, behavior-preserving scope, and hard
exit gate. Do not force a stale path or symbol name, and do not treat baseline
drift as permission to expand the phase. If those constraints can no longer be
preserved, update the plan or obtain separate approval before implementation.

## Shared code-organization contract

Across all phases, use kebab-case file names, PascalCase React component names,
and `useSomething` names for hooks. Put new tests under the nearest relevant
`__tests__/` directory, mirroring the production domain; retain FrameKit
compile-time type fixtures under `packages/framekit/tests/types/`. Use `index.ts`
only for re-exports. The ESLint Standard contract is two spaces, no semicolons,
single quotes in JavaScript and TypeScript, no trailing commas, and a final
newline for linted source files. ESLint enforces only the code-style and lint
portion of this contract; it does not format Markdown, YAML, JSON, CSS, or add
naming, file-placement, or test-organization rules.

## Current baseline

The repository is a private pnpm `11.14.0` monorepo with public packages
`@mauriciodmo/framekit` and `@mauriciodmo/create-framekit`, plus the private
`studio` application. The root already exposes recursive `lint`, `test`,
`typecheck`, and `build` commands, and the child workspaces own their ESLint
configuration. The root has Husky, but its pre-commit hook currently performs
skill synchronization and explicitly stages the synchronized copies; it does
not run the recursive lint. In the Ubuntu CI job, the runtime contract is checked
before installation; after a frozen-lockfile install, FrameKit and the creator
are built, then lint, test, type-check, workspace-build, and package-content
checks run. The Windows smoke job also builds both public packages, runs the
discovery/codegen and creator tests, type-checks the workspace, creates and
installs a generated consumer, runs `framekit generate` and `framekit check`,
and inspects both package contents. CI currently has no separate formatting check;
it already runs the full recursive `pnpm lint` gate.

The existing `.gitignore` covers the principal FrameKit and Next.js generated
paths. The first phase adds the shared ESLint Standard contract and makes the
pre-commit hook run the full recursive lint before skill synchronization. Later
phases build on that baseline without changing runtime contracts.

## Ordered PRs

Implement and merge these PRs in order:

| PR | Plan | Result | Depends on |
|---:|---|---|---|
| 1 | [ESLint Standard and pre-commit checks](./01-repository-formatting-and-checks.md) | ESLint configuration first, then the one-time lint fix in a separate second commit | Current baseline |
| 2 | [Definition validation split](./02-definition-validation-split.md) | Coherent internal validation ownership with the public facade unchanged | PR 1 |
| 3 | [Editor orchestration](./03-editor-orchestration.md) | Smaller editor coordinator with existing state, controls, preview, and export owners reused | PRs 1-2 |
| 4 | [Studio shell split](./04-studio-shell-split.md) | Internal Studio resource, state, settings, and shell ownership split | PRs 1-3 |
| 5 | [Published design tokens](./05-design-tokens.md) | A small public theme-role contract with internal visual details kept private and the export unchanged | PRs 1-4 |
| 6 | [Architectural import boundaries](./06-architectural-import-boundaries.md) | Post-server boundary plan covering current entries and the Step 1-only `./server` facade plus its future capabilities | Server steps 1-8 and server gate |

The links above are the complete phase index for this roadmap. A later phase
must not be folded into an earlier PR merely because both touch documentation or
configuration.

## Sequencing and dependencies

PR 1 is the foundation: later diffs need a deterministic lint/style contract and
a cheap failure signal. PR 2 separates validation ownership without changing its
public facade. PR 3 then separates editor presentation from orchestration while
retaining existing state and export owners. PR 4 applies the same ownership
discipline to the Studio shell. PR 5 centralizes repeated visual values behind a
bounded, documented semantic CSS contract. The Server Image Rendering plan is
then intended to add its final runtime and consumer surface. PR 6 is last because
import-boundary checks must describe that post-server graph and generated-output
conventions rather than enforce a pre-server architecture.

Each phase may clarify names or documentation wording, but it may not alter a
public export, move a package, change generated-template behavior, or change a
runtime result. Phase 6 is not authorized to enforce boundaries yet: after
Server Step 8, re-inventory and revalidate the actual graph, then obtain the
approved implementation map. If a proposed implementation needs another public
export or architecture change, stop and split it into separately approved work.

The `Depends on` section in each phase distinguishes sequencing from code
dependencies. A sequencing dependency means the preceding phase must be merged
first because the roadmap is one ordered PR per phase; a code dependency means
the implementation actually requires that phase's source changes. A phase may
have no code dependency while still having the mandatory sequencing dependency.

## Shared verification

Run commands from the repository root. After PR 1 has landed, every phase runs
the checks that its files affect and the full repository checks before review:

```bash
pnpm install --frozen-lockfile
pnpm check:runtime
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @mauriciodmo/framekit pack --dry-run
pnpm --filter @mauriciodmo/create-framekit pack --dry-run
```

Each phase command block must include this complete gate or explicitly direct
the maintainer to run it after the phase-specific checks. A block labeled
"Full commands" is not complete if it omits either package build, either package
dry-run, or a recursive repository check.

The explicit FrameKit build is required before any clean-install command that
can execute Studio's `framekit generate`: Studio's test and type-check scripts
invoke that CLI, and the CLI entry imports the built `packages/framekit/dist/`
output. Keep this build before root `test`/`typecheck` (which recurse into
Studio) and before any focused Studio test, type-check, or build; the later
recursive `pnpm build` remains required and is not replaced by the bootstrap
build. Phase-specific command blocks are subordinate to this rule: a block that
places a Studio command, or a recursive command that reaches Studio, before the
FrameKit bootstrap is not executable from a clean install and must be reordered
before that phase's gate.

Use the focused checks when a phase touches a particular workspace:

```bash
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
```

Also run `git diff --check`, including an equivalent check for any untracked
files before staging, inspect the changed-file list, and verify that no ignored
generated output was added. A phase may add a more specific check, but it may
not replace the repository checks with a narrower staged-only substitute.
Phases 4-6 must also run the canonical isolated-consumer sequence required by
their phase documents; root checks and package dry-runs do not replace it.

## Review and rollback strategy

Review one phase as one PR. Reviewers should first inspect the file list, then
the semantic diff, then the command output. Lint-fix-only changes must not be
mixed with behavior fixes, dependency upgrades unrelated to the phase, or
generated artifacts. Preserve the existing explicit skill-copy staging in the
pre-commit hook while reviewing PR 1. Phase 1 remains one PR but must contain
two commits: ESLint Standard configuration and hook enforcement first, then the
one-time ESLint style fix. Review the first commit without lint-fix noise before
reviewing the mechanical second commit.

If a phase fails review or its exit gate, revert that PR as one unit and leave
later phases untouched. PR 1's ESLint configuration and one-time lint fix can be
reverted without a runtime migration; the existing workspace ESLint,
tests, type checks, builds, exports, and package layout remain the rollback
baseline. Do not solve a failed gate by weakening the check or committing its
generated output.

## Roadmap completion gate

The roadmap is complete only when all six PR exit gates pass, the shared
verification commands pass on a clean install, and the final diff confirms:

- no runtime or existing public JavaScript/type/component API behavior changed;
  the only permitted published-surface addition through Phase 5 is its documented
  compact numeric color palette through the existing `./styles.css` export;
- the six current non-server exports and current package ownership remain
  unchanged through Phase 5; the Step 1-only `./server` facade is governed by
  the Server plan, while jobs, browser, routes, image fetching, Docker, and
  rollout remain future until their steps pass and the result is revalidated
  before Phase 6;
- generated/build paths remain ignored and no generated file was hand-edited;
- `Docs/skills/` remains the source and synchronized skill copies are produced
  only by `pnpm sync:skills`;
- English and Spanish repository/testing guidance matches the implemented
  commands;
- the shipped package README plus bilingual public API references and Studio
  guides document Phase 5's numeric color-palette contract without presenting
  component/state aliases or generated component-specific utilities as API; and
- package and isolated-consumer verification still succeeds where applicable.

This is a hard gate, not a target for a later cleanup PR.
