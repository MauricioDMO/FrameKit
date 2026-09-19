---
title: Contributor workflow
description: Follow the FrameKit checkout, focused commands, generated-output rules, and skills synchronization workflow.
---

# Contributor workflow

Run repository commands from the FrameKit checkout root. The [contributor
prerequisites](/en/contributors/getting-started/prerequisites) page lists the
supported Node.js and pnpm versions. The [local development
guide](/en/contributors/getting-started/local-development) explains workspace
ownership and the first Studio run.

## Start from the root

For a clean checkout, install exactly what the lockfile specifies:

```bash
pnpm install --frozen-lockfile
```

Run the runtime contract check when changing versions, manifests, CI, or the
documented runtime requirements:

```bash
pnpm check:runtime
```

The normal first-party development command is also root-only:

```bash
pnpm dev
```

The root script builds `@mauriciodmo/framekit` before starting the private
`studio` workspace. This order makes the package `dist/` exports available to
Studio.

## Use focused commands first

Start with the commands for the workspace that owns the change:

| Workspace | Focused commands |
| --- | --- |
| `@mauriciodmo/framekit` | `pnpm --filter @mauriciodmo/framekit build`; `pnpm --filter @mauriciodmo/framekit lint`; `pnpm --filter @mauriciodmo/framekit test`; `pnpm --filter @mauriciodmo/framekit typecheck` |
| `studio` | `pnpm --filter studio check`; `pnpm --filter studio lint`; `pnpm --filter studio test`; `pnpm --filter studio typecheck`; `pnpm --filter studio build`; `pnpm --filter studio start` |
| `@mauriciodmo/create-framekit` | `pnpm --filter @mauriciodmo/create-framekit build`; `pnpm --filter @mauriciodmo/create-framekit lint`; `pnpm --filter @mauriciodmo/create-framekit test`; `pnpm --filter @mauriciodmo/create-framekit typecheck` |
| `docs` | `pnpm --filter docs build`; `pnpm --filter docs preview` |

The commands in the table are scripts from the workspace manifests. For a
clean checkout, build `@mauriciodmo/framekit` before focused Studio tests,
type-checks, or commands that execute the FrameKit CLI. Start a production
server only after a successful build:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter studio build
pnpm --filter studio start
```

When a change crosses workspaces, run the root checks as well:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

CI currently verifies Node.js `22.13.0` and `24` on Linux, runs a Windows
consumer smoke path on Node.js `22.13.0`, and runs Chromium E2E on Linux.

## Keep generated output disposable

Change maintained source and regenerate its outputs. Do not hand-edit these
paths:

- `packages/framekit/dist/` and other package `dist/` directories;
- `apps/docs/dist/` and `apps/docs/.astro/`;
- a consumer project's `src/generated/framekit/` and `public/framekit/`; and
- a consumer project's `.framekit/`, `.framekit/next/`, or other ignored build
  output.

A consumer project's `.framekit-data/` is persistent runtime storage for the
SQLite access database, not disposable generated output. Preserve it across
restarts and deployments when the database path uses that directory. Do not
delete it as part of regeneration; change maintained source and regenerate only
the disposable output paths above.

For template or brand changes, use `framekit generate` to regenerate registries,
clients, and copied assets. `framekit check` generates before validating;
`framekit build` checks before building; `framekit dev` generates before
watching; and `framekit start` uses existing production output without
generating. See [generated code](/en/contributors/architecture/generated-code)
for the source-to-output flow.

## Synchronize skills from their source

`Docs/skills/` is the maintained source for repository and template skills. Run
the root script after changing a skill:

```bash
pnpm sync:skills
```

The script copies internal skills to `.agents/skills/` and public skills to
`packages/create-framekit/template/.agents/skills/`. Edit only `Docs/skills/`;
the two target directories are synchronized copies. The pre-commit hook runs
`pnpm lint`, then `pnpm sync:skills`, and stages those synchronized targets.
