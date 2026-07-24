# 03. CLI and Project Lifecycle

## Objective

Turn the CLI into a stable interface for creating, diagnosing, validating, developing, building, running, and extending FrameKit projects.

## Existing core commands

The following remain the core lifecycle:

```text
framekit generate
framekit check
framekit dev
framekit build
framekit start
```

Their behavior should remain deterministic and scriptable.

## Proposed commands

### `framekit doctor`

Diagnose the local project and environment.

It should inspect:

- Node.js version.
- Package manager version.
- Required dependencies.
- `src/templates` existence.
- Generated registry existence.
- TypeScript path aliases.
- FrameKit CSS import.
- Next.js configuration.
- Output configuration.
- Port availability.
- File write permissions.
- Generated registry freshness.
- Known incompatible package versions.

It should support human-readable output and `--json`.

### `framekit init`

Add FrameKit to an existing Next.js project.

It should:

- Detect App Router.
- Install required dependencies.
- Create the Studio route.
- Create `src/templates`.
- Create one minimal template.
- Add scripts.
- Add TypeScript aliases.
- Import FrameKit styles.
- Avoid overwriting existing files without explicit approval.
- Produce a summary of every changed file.

### `framekit add`

Install an official or trusted template collection.

Examples:

```bash
framekit add instagram-post
framekit add social-starter
framekit add @company/brand-templates
```

The CLI owns the installation workflow, while the template library plan defines package and collection contracts.

### `framekit list`

Display discovered templates with:

- Slug.
- Title.
- Dimensions.
- Category.
- Tags.
- Available variants.
- Validation status.

It should support `--json`.

### `framekit migrate`

Apply known contract migrations.

Possible migrations include:

- Renamed properties.
- Generated path changes.
- Legacy field normalization.
- `locale` to `variant` terminology.
- Script updates.
- Metadata additions.

The command must not rewrite arbitrary template components without showing a preview or diff.

## Common flags

```text
--cwd
--json
--debug
--quiet
--host
--port
--no-open
```

Commands should avoid interactive prompts when all required values are provided through flags.

## Error model

Define stable categories:

- Environment error.
- Configuration error.
- Discovery error.
- Template definition error.
- Template data error.
- Build error.
- Server error.
- Installation error.
- Migration error.

Human messages may be translated, but machine-readable codes must remain stable.

An error should include:

- Code.
- File or command context.
- Cause.
- Suggested action.
- Exit status.

## Project creator

`create-framekit` should support:

- npm or pnpm selection.
- Skip dependency installation.
- Skip Git initialization.
- Minimal or examples starter.
- Non-interactive creation.
- Clear next steps.
- Optional cleanup of partially created directories.
- Optional retention of failed output for diagnosis.

## Project lifecycle guarantees

A generated project should:

- Contain a valid starter template.
- Start without manual configuration.
- Pass `framekit check`.
- Build using the documented runtime.
- Produce a standalone server when supported.
- Keep generated code in a documented path.
- Avoid depending on the FrameKit monorepo.

## Out of scope

- Replacing the Next.js CLI.
- Managing deployments.
- Account management.
- Installing arbitrary remote code without trust warnings.
- Editing user application architecture beyond the required FrameKit integration.

## Completion criteria

- A new project can be created without manual file edits.
- An existing compatible Next.js project can adopt FrameKit through `init`.
- `doctor` detects common configuration failures.
- Commands support automation through JSON output.
- Errors provide stable codes and useful recovery instructions.
- Migration behavior is documented and reversible where possible.
