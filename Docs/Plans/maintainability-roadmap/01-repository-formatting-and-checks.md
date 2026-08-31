# Phase 1 - Repository Formatting and Checks

## Status

- **Status:** Proposed; not yet implemented.
- **PR boundary:** One behavior-preserving formatting and repository-tooling PR
  containing exactly two reviewable commits.

## Goal

Establish one repository-wide formatting contract, format the existing supported
files once, and make future staged changes cheap to check locally and in CI.
This phase is a behavior-preserving format-and-tooling PR. It does not change
ESLint rules, package exports, package ownership, canonical-template behavior or
scaffolding, runtime behavior, or test behavior. Canonical template source may
receive formatting-only changes from the repository-wide formatter. Ignored
generated/build output is never included or hand-edited; the two tracked
synchronized skill-copy locations may be refreshed only by `pnpm sync:skills`,
as the existing hook requires.

## Depends on

- The current root pnpm workspace and `packageManager` declaration.
- The root declares `packageManager: pnpm@11.14.0` and requires pnpm `>=11.14.0`;
  run the commands below with pnpm 11.14.0.
- The existing workspace ESLint configurations and recursive `pnpm lint` script.
- The current Husky skill-synchronization hook and explicit staging command.
- The current generated/build ignore conventions documented in the repository
  instructions and bilingual development pages.

## Formatting contract

The repository standard is:

- two spaces and no tabs;
- JavaScript and TypeScript strings use single quotes;
- JSX keeps Prettier's default double-quoted attributes;
- no semicolons;
- trailing commas wherever Prettier supports them;
- `printWidth: 120`;
- LF line endings;
- a final newline in every text file;

Prettier is the formatter and source of truth for formatting. ESLint remains the
source of truth for lint rules. The hook's new staged-file operation runs only
formatting; the hook still synchronizes skills and explicitly stages their
tracked copies. Full workspace ESLint continues to run through `pnpm lint` and
CI. Do not invent per-workspace staged-lint routing.

## Exact implementation steps

Complete these steps in order. The paths are relative to the repository root.

### 1. Add `.editorconfig`

Create the root `.editorconfig` so editors agree with the formatter and Git:

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
indent_style = space
indent_size = 2
insert_final_newline = true
max_line_length = 120

[*.md]
trim_trailing_whitespace = false
```

Markdown keeps trailing whitespace disabled because two trailing spaces can be
an intentional Markdown hard break. Prettier still formats Markdown using its
normal rules.

### 2. Add `.gitattributes` when applying the LF contract

Add a root `.gitattributes`. `.editorconfig` controls editors; attributes also
make checkout and diff behavior consistent on the Windows CI smoke-test path.
That is sufficient justification for this small file:

```gitattributes
* text=auto eol=lf

*.gif binary
*.ico binary
*.jpeg binary
*.jpg binary
*.otf binary
*.png binary
*.ttf binary
*.webp binary
*.woff binary
*.woff2 binary
```

Do not add broad generated-file rules here. Generated/build directories remain
managed by `.gitignore` and `.prettierignore`.

### 3. Add the root Prettier configuration

Create `.prettierrc.json` with only repository-wide settings. Explicitly retain
Prettier's JSX quote default:

```json
{
  "endOfLine": "lf",
  "jsxSingleQuote": false,
  "printWidth": 120,
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "all",
  "useTabs": false
}
```

Do not add an ESLint formatting plugin, a root ESLint configuration, or a
workspace-specific Prettier override.

### 4. Add `.prettierignore`

Create a root `.prettierignore` that excludes dependencies, generated output,
build output, and synchronized skill copies while leaving source, configuration,
lockfile, and documentation files eligible for formatting:

```text
node_modules/
.codegraph/
coverage/
.vercel/

**/.framekit/
**/.next/
**/build/
**/dist/
**/out/
**/public/__framekit/
**/src/generated/framekit/
**/next-env.d.ts

.agents/skills/
packages/create-framekit/template/.agents/skills/
```

Do not ignore `pnpm-lock.yaml`; it is a maintained YAML file and must remain
covered by the repository format check. Do not ignore `Docs/skills/`, which is
the source for the generated copies.

### 5. Align `.gitignore` with generated/build conventions

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

### 6. Update root `package.json` and `pnpm-lock.yaml`

Add only `prettier` and `lint-staged` as root development dependencies. Add the
following root scripts without changing the existing `dev`, `lint`, `test`,
`typecheck`, `build`, `sync:skills`, `check:runtime`, or `prepare` commands:

```json
"format": "prettier . --write",
"format:check": "prettier . --check"
```

Use a minimal root `lint-staged` configuration in `package.json`:

```json
"lint-staged": {
  "*.{cjs,cts,css,js,jsx,json,md,mjs,mts,ts,tsx,yaml,yml}": "prettier --write"
}
```

The glob covers supported staged source, configuration, documentation, and YAML
files. `.prettierignore` still prevents ignored generated/build output and
synchronized skill copies from being formatted.
This configuration deliberately does not run ESLint; `pnpm lint` remains the
full recursive workspace lint.

Change the manifest and lockfile through pnpm, not by hand:

```bash
pnpm add --save-dev --workspace-root prettier lint-staged
pnpm install
```

If the add command has already updated the lockfile, inspect it rather than
running a second unrelated dependency update. The lockfile diff may include the
transitive dependencies required by those two tools, but no other new direct
dependency is allowed.

### 7. Preserve the Husky hook and add staged formatting

Update `.husky/pre-commit` by retaining both existing commands, but run staged
formatting first so any formatted `Docs/skills/` source is synchronized afterward:

```sh
pnpm exec lint-staged
pnpm sync:skills
git add -A -- .agents/skills packages/create-framekit/template/.agents/skills
```

The order matters: `lint-staged` formats supported staged files first;
`sync:skills` then copies the final source and the explicit `git add` stages both
tracked destinations as it does today. This avoids leaving tracked skill copies
behind when a staged source skill is reformatted. Do not replace the explicit
`git add` with a broad unstated behavior, and do not add full workspace ESLint to
the hook.

### 8. Add the CI format check

In `.github/workflows/ci.yml`, add one step immediately after
`Install dependencies` and before either package build or another expensive
check:

```yaml
- name: Check formatting
  run: pnpm format:check
```

Keep both existing matrix Node versions, the runtime-contract check, the package
build order, recursive lint/test/typecheck/build checks, package-content checks,
and the Windows smoke test unchanged. CI must continue to run full `pnpm lint`;
`format:check` is an additional cheap failure signal, not a replacement.

### 9. Format the existing ESLint configurations without changing rules

Run Prettier on each existing ESLint configuration:

- `apps/studio/eslint.config.mjs`;
- `packages/framekit/eslint.config.mjs`;
- `packages/create-framekit/eslint.config.mjs`.

The expected changes are quote, semicolon, comma, indentation, and line-ending
normalization only. Preserve every imported config, ignore, setting, and rule.
Do not add a shared ESLint config and do not route staged files through ESLint.

### 10. Update maintainer instructions

Update `AGENTS.md` to document:

- `pnpm format` and `pnpm format:check` from the repository root;
- the two-space/LF/quote/semicolon/trailing-comma/120-column standard,
  including Prettier's default double quotes for JSX attributes;
- that `pnpm lint` remains full recursive ESLint;
- the generated/build paths `**/.framekit/`, `**/dist/` (including
  `packages/framekit/dist/`), `**/src/generated/framekit/`,
  `**/public/__framekit/`, `**/.next/`, `**/out/`, and `**/build/` that must
  not be hand-edited;
- that `Docs/skills/` is authoritative and the two `.agents/skills` locations
  are synchronized generated copies; and
- that the pre-commit hook must retain `pnpm sync:skills` and explicit staging.

Do not change the supported import list, package ownership, build ordering, or
distribution instructions already in `AGENTS.md`.

### 11. Update both development pages

Make the equivalent language-appropriate updates to:

- `Docs/en/development/repository.md`;
- `Docs/es/development/repository.md`;
- `Docs/en/development/testing-and-distribution.md`;
- `Docs/es/development/testing-and-distribution.md`.

The repository pages must show the two format scripts and the formatting
standard alongside the existing root scripts. The testing/distribution pages
must list `pnpm format:check` as a repository check, retain full `pnpm lint`, and
state that ignored generated/build output is disposable and never hand-edited;
tracked synchronized skill copies are refreshed only by `pnpm sync:skills`. Keep
the English and Spanish pages semantically equivalent. Do not fix unrelated
stale links.

### 12. Perform the one-time all-repository format

After all configuration and manifest changes are complete, run the formatter from
the root:

```bash
pnpm install
pnpm format
pnpm sync:skills
pnpm format:check
```

This formats every supported non-ignored repository file in one isolated PR,
including existing source, tests, configuration, lockfile, and documentation as
applicable. After formatting `Docs/skills/`, `pnpm sync:skills` keeps the two
tracked copies synchronized; do not hand-edit those copies. The run must not
modify or add ignored generated/build output. Use `git status --short` and
`git diff --check` to remove any ignored generated artifacts before review.

## Required commit structure

Keep Phase 1 as one PR, but split it into exactly these two commits:

1. **Tooling and formatting configuration:** `.editorconfig`, `.gitattributes`,
   Prettier configuration and ignores, `.gitignore`, manifest and lockfile,
   Husky, CI, and the maintainer documentation updates from steps 1-8 and 10-11.
2. **`format repository with Prettier`:** the mechanical output from steps 9 and
   12, including synchronized skill-copy changes produced by `pnpm sync:skills`
   when their `Docs/skills/` sources were formatted.

The second commit must not contain configuration, dependency, documentation
content, or behavior changes that should have been reviewed in the first
commit. Reviewers must be able to inspect the tooling contract independently
before reviewing the repository-wide formatting noise. Both commits remain one
atomic phase for merge and rollback purposes.

## Review boundary

The one-time format PR may contain only:

- the root formatting and Git attributes/configuration files;
- the root manifest and lockfile changes required for Prettier/lint-staged;
- the staged-formatting hook and CI format-check step;
- tracked synchronized skill copies, only when refreshed by `pnpm sync:skills`;
- the three existing ESLint configuration files after formatting;
- `AGENTS.md` and the four bilingual development pages; and
- formatting changes produced by the one-time repository run.

It must contain no logic changes, behavior changes, public API changes, package
boundary changes, package split, template behavior or scaffolding changes, or
work from Phases 2-6. Canonical template source may be changed only by
formatting. It must contain no ignored generated/build output or hand-edited
generated files; synchronized skill-copy changes are allowed only as the direct
output of `pnpm sync:skills`. If a logic change is discovered while reviewing
formatter output, revert that hunk and open a separate change rather than hiding
it in this PR.

## Verification commands

Run these commands from the repository root after the one-time format:

```bash
pnpm install --frozen-lockfile
pnpm format:check
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

Revert the PR as one unit if the format check, full checks, or review boundary
fails. No data or runtime migration is needed. Do not roll back by removing only
the CI step or by weakening the ignore patterns; the root formatter contract,
staged hook, and CI check must remain consistent if the phase is accepted.

## Hard exit gate

Phase 1 is complete only when all of the following are true:

- the root `.editorconfig`, `.gitattributes`, `.prettierrc.json`, and
  `.prettierignore` enforce the documented standard;
- only Prettier and lint-staged were added as new direct tooling dependencies,
  with a pnpm-generated lockfile update;
- the root scripts and minimal staged formatter exist;
- `pnpm sync:skills` and explicit skill-copy staging remain in `.husky/pre-commit`;
- CI runs `pnpm format:check` after install and before expensive checks;
- the three existing ESLint configs retain their rules and full workspace lint
  still passes;
- `.gitignore`, `AGENTS.md`, and all four bilingual development pages document
  the same generated/build and formatting conventions;
- the PR contains the required tooling/configuration commit followed by the
  format-only `format repository with Prettier` commit;
- the one-time all-repository format is isolated from Phases 2-6 and contains no
  logic, behavior, public API, package-boundary change, or ignored generated/build
  output; and
- every command in the verification block exits with status 0 on a clean install.

Failure of any item blocks merge.
