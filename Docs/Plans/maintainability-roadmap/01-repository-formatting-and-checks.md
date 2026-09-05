# Phase 1 - ESLint Standard and Pre-commit Checks

## Status

- **Status:** Implemented; exit gate pending.
- **Implementation:** `7dddcbe` adds the ESLint Standard configuration and
  pre-commit enforcement; `bec66a7` applies the mechanical lint fixes.
- **PR boundary:** One behavior-preserving lint and repository-tooling PR
  containing exactly two reviewable commits.

## Goal

Establish one ESLint Standard contract for the JavaScript, TypeScript, JSX, and
ESLint-covered configuration files, apply its automatic fixes once, and make
future commits fail when the full repository lint does not pass. This phase is a
behavior-preserving lint-and-tooling PR. It does not change package exports,
package ownership, canonical-template behavior or scaffolding, runtime behavior,
or test behavior. It does not add Prettier, `lint-staged`, a format script, or a
separate template-lint command. Ignored generated/build output is never included
or hand-edited; the two tracked synchronized skill-copy locations may be
refreshed only by `pnpm sync:skills`, as the existing hook requires.

## Depends on

- The current root pnpm workspace and `packageManager` declaration.
- The root declares `packageManager: pnpm@11.14.0` and requires pnpm `>=11.14.0`;
  run the commands below with pnpm 11.14.0.
- ESLint 9, Next 16, TypeScript, Tailwind, the existing workspace configurations,
  and the recursive `pnpm lint` script.
- The current Husky skill-synchronization hook and explicit staging command.
- The current generated/build ignore conventions documented in the repository
  instructions and bilingual development pages.

## ESLint Standard contract

The linted source contract is:

- two spaces and no tabs;
- JavaScript and TypeScript strings use single quotes;
- no semicolons;
- no trailing commas;
- a final newline in every linted source file;
- the remaining JavaScript Standard rules for syntax, spacing, imports, and
  common correctness errors.

ESLint is the only code-style and lint tool. The existing Next, TypeScript, and
Tailwind configurations remain active; the Standard rules are the shared base and
workspace-specific framework rules are applied afterward. ESLint does not format
Markdown, YAML, JSON, CSS, or enforce repository-wide line endings.

The published `eslint-config-standard` release still declares an ESLint 8 peer
range while this repository must remain on ESLint 9 for Next 16. Use a flat-config
compatible internal Standard rule set and the required plugins rather than
downgrading ESLint or forcing an unsupported peer combination. The hook runs the
full `pnpm lint` command, not a staged-only substitute and not `--fix`; it still
synchronizes skills and explicitly stages their tracked copies after lint passes.

## Exact implementation steps

Complete these steps in order. The paths are relative to the repository root.

### 1. Add the shared ESLint Standard configuration

Create one internal flat-config module containing the official Standard rules
and the required `import`, `n`, and `promise` plugin registrations. Keep it
internal to the repository and import it from the three existing workspace
configurations. Do not create a second root-wide lint command or a template-only
lint script.

The module must remain compatible with ESLint 9. Do not downgrade ESLint to
satisfy the older peer range declared by the published `eslint-config-standard`
package, and do not hide that mismatch with a peer-dependency override.

### 2. Align the three existing ESLint configurations

Update these files:

- `apps/studio/eslint.config.mjs`;
- `packages/framekit/eslint.config.mjs`;
- `packages/create-framekit/eslint.config.mjs`.

Apply the shared Standard rules first, then the existing Next, TypeScript, and
Tailwind configurations, then the workspace-specific ignores and exceptions.
Preserve every existing framework rule and generated-output ignore. Extend the
FrameKit and creator lint targets to include their own `eslint.config.mjs` files
if required to lint the configuration itself; do not include
`packages/create-framekit/template/src/**` before Phase 6.

### 3. Add only the required ESLint tooling dependencies

Add the plugins required by the shared flat configuration through pnpm and let
pnpm update `pnpm-lock.yaml`. Do not add Prettier, `lint-staged`, an ESLint
formatter plugin, or a second lint runner. The existing recursive `pnpm lint`
script remains the repository command.

### 4. Align `.gitignore` with generated/build conventions

Update only the generated/build portion of the root `.gitignore`. Retain the
existing dependency, environment, debug, and platform rules, and ensure these
canonical patterns are present:

```text
**/.framekit/
**/.next/
**/build/
**/dist/
**/out/
**/public/__framekit/
**/src/generated/framekit/
```

The patterns cover disposable FrameKit codegen, package `dist`, Next.js output,
and other build output in any workspace. Never remove the `.env.example`
exception or add an ignore for source documentation. Do not add ignored
generated/build output to the PR merely because a build or `framekit generate`
created it. The tracked synchronized skill copies are updated only by
`pnpm sync:skills`. Replace equivalent narrower generated/build entries in that
section rather than retaining redundant duplicates; leave all unrelated ignore
rules unchanged.

### 5. Preserve the Husky hook and add the full pre-commit lint

Update `.husky/pre-commit` by running the complete recursive lint before the
existing skill synchronization and explicit staging commands:

```sh
pnpm lint
pnpm sync:skills
git add -A -- .agents/skills packages/create-framekit/template/.agents/skills
```

Lint runs before synchronization so a failing lint blocks the commit without
changing the tracked skill copies. The full workspace command is deliberate:
there is no staged-only routing and the hook does not run ESLint with `--fix`.
Keep the explicit `git add` so both tracked synchronized destinations are staged
as they are today.

### 6. Preserve the CI lint gate

Do not add a format check to CI. Keep the existing recursive `pnpm lint` gate,
both Ubuntu Node versions, the runtime-contract check, package build order,
recursive tests/type checks/build, package-content checks, and the Windows smoke
test unchanged. The pre-commit hook is the local before-commit enforcement; CI's
existing `pnpm lint` remains the shared remote enforcement.

### 7. Apply the one-time ESLint fix without changing behavior

After the configuration and dependency changes are complete, run ESLint with
`--fix` over the existing lint targets:

```bash
pnpm --filter @mauriciodmo/framekit exec eslint src scripts tsdown.config.ts eslint.config.mjs --fix
pnpm --filter studio exec eslint . --fix
pnpm --filter @mauriciodmo/create-framekit exec eslint src tsdown.config.ts eslint.config.mjs --fix
```

Review every non-fixable error separately. Keep the second commit limited to
Standard style changes and behavior-neutral lint fixes. Do not lint or edit
ignored generated output, and do not expand this phase to the canonical
generated-template source; Phase 6 owns that lint-target extension.

### 8. Update maintainer instructions

Update `AGENTS.md` to document:

- `pnpm lint` from the repository root and the full-repository pre-commit check;
- the ESLint Standard two-space/single-quote/no-semicolon/no-trailing-comma
  contract for linted JavaScript and TypeScript source;
- that existing Next, TypeScript, and Tailwind rules remain active;
- the generated/build paths `**/.framekit/`, `**/dist/` (including
  `packages/framekit/dist/`), `**/src/generated/framekit/`,
  `**/public/__framekit/`, `**/.next/`, `**/out/`, and `**/build/` that must
  not be hand-edited;
- that `Docs/skills/` is authoritative and the two `.agents/skills` locations
  are synchronized generated copies; and
- that the pre-commit hook must retain `pnpm sync:skills` and explicit staging.

Do not change the supported import list, package ownership, build ordering, or
distribution instructions already in `AGENTS.md`.

### 9. Update both development pages

Make the equivalent language-appropriate updates to:

- `Docs/en/development/repository.md`;
- `Docs/es/development/repository.md`;
- `Docs/en/development/testing-and-distribution.md`;
- `Docs/es/development/testing-and-distribution.md`.

The repository pages must show `pnpm lint`, the Standard contract, and the
pre-commit hook alongside the existing root scripts. The testing/distribution
pages must retain full `pnpm lint` as a repository check and state that ignored
generated/build output is disposable and never hand-edited; tracked synchronized
skill copies are refreshed only by `pnpm sync:skills`. Keep the English and
Spanish pages semantically equivalent. Do not fix unrelated stale links.

### 10. Verify the one-time lint migration

After all configuration and dependency changes are complete, install and run the
one-time ESLint fix from the root:

```bash
pnpm install
pnpm --filter @mauriciodmo/framekit exec eslint src scripts tsdown.config.ts eslint.config.mjs --fix
pnpm --filter studio exec eslint . --fix
pnpm --filter @mauriciodmo/create-framekit exec eslint src tsdown.config.ts eslint.config.mjs --fix
pnpm sync:skills
pnpm lint
```

This applies Standard only to the existing ESLint targets. It does not claim to
format Markdown, YAML, JSON, CSS, or other files outside ESLint's scope. After
checking `Docs/skills/`, `pnpm sync:skills` keeps the two tracked copies
synchronized; do not hand-edit those copies. The run must not modify or add
ignored generated/build output. Use `git status --short` and `git diff --check`
to remove any ignored generated artifacts before review.

## Required commit structure

Keep Phase 1 as one PR, but split it into exactly these two commits:

1. **ESLint Standard and hook configuration:** shared Standard rules, required
   plugins, `.gitignore`, manifest and lockfile, Husky, maintainer documentation,
   and the plan updates from steps 1-6 and 8-9.
2. **`apply ESLint Standard fixes`:** the mechanical output from steps 7 and 10,
   including synchronized skill-copy changes produced by `pnpm sync:skills` when
   their `Docs/skills/` sources change.

The second commit must not contain configuration, dependency, documentation
content, or behavior changes that should have been reviewed in the first
commit. Reviewers must be able to inspect the lint contract independently before
reviewing the mechanical ESLint-fix noise. Both commits remain one atomic phase
for merge and rollback purposes.

## Review boundary

The one-time lint PR may contain only:

- the shared ESLint Standard configuration and required plugin dependencies;
- the root manifest and lockfile changes required for ESLint;
- the full-lint pre-commit hook and existing CI lint gate;
- tracked synchronized skill copies, only when refreshed by `pnpm sync:skills`;
- the three existing ESLint configuration files after Standard is applied;
- `AGENTS.md`, the four bilingual development pages, and the updated plan files;
  and
- lint-fix changes produced by the one-time ESLint run.

It must contain no logic changes, behavior changes, public API changes, package
boundary changes, package split, template behavior or scaffolding changes, or
work from Phases 2-6. The canonical template source remains outside the lint
target until Phase 6. It must contain no ignored generated/build output or
hand-edited generated files; synchronized skill-copy changes are allowed only as
the direct output of `pnpm sync:skills`. If a logic change is discovered while
reviewing ESLint output, revert that hunk and open a separate change rather than
hiding it in this PR.

## Verification commands

Run these commands from the repository root after the one-time ESLint fix:

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
git diff --check
```

Check that the package export list is unchanged and still exactly contains `.`,
`./editor`, `./studio`, `./studio/root`, `./dev`, and `./styles.css`. Confirm
that `pnpm sync:skills` still produces the synchronized copies and that the hook
stages them explicitly. Confirm that the changed-file list contains no
`packages/framekit/dist/`, `.framekit/`, generated registry, Next.js output, or
other ignored build artifact.

## Rollback

Revert the PR as one unit if the lint check, full checks, or review boundary
fails. No data or runtime migration is needed. Do not roll back by removing only
the hook or by weakening the ignore patterns; the Standard contract, full-lint
hook, and CI lint gate must remain consistent if the phase is accepted.

## Hard exit gate

Phase 1 is complete only when all of the following are true:

- the shared ESLint Standard configuration and required plugins are compatible
  with the repository's ESLint 9 and Next 16 versions;
- no Prettier, `lint-staged`, format script, or unsupported ESLint downgrade was
  introduced;
- `pnpm lint` remains the full recursive repository check;
- the pre-commit hook runs full `pnpm lint` before `pnpm sync:skills` and explicit
  skill-copy staging;
- CI retains its full `pnpm lint` gate;
- the three existing ESLint configs retain their rules and full workspace lint
  still passes;
- `.gitignore`, `AGENTS.md`, the four bilingual development pages, and the plan
  files document the same generated/build and lint conventions;
- the PR contains the required tooling/configuration commit followed by the
  lint-fix-only `apply ESLint Standard fixes` commit;
- the one-time ESLint fix is isolated from Phases 2-6 and contains no logic,
  behavior, public API, package-boundary change, or ignored generated/build
  output; and
- every command in the verification block exits with status 0 on a clean install.

Failure of any item blocks merge.
