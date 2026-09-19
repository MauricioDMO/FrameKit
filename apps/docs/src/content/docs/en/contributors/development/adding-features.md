---
title: Adding features
description: Choose the owning FrameKit workspace, add the right tests, regenerate outputs, and run the relevant gates.
---

# Adding features

Start by identifying the workspace and runtime layer that owns the behavior.
The [repository architecture](/en/contributors/architecture/repository) and
[package architecture](/en/contributors/architecture/packages) pages provide
the broader map.

## Choose the owner

| Area | Maintained source |
| --- | --- |
| Reusable runtime, Editor, Studio components, Server, code generation, development server, and `framekit` CLI | `packages/framekit/src/` |
| `create-framekit` implementation | `packages/create-framekit/src/` |
| Canonical generated consumer | `packages/create-framekit/template/` |
| First-party application routes, templates, and assets | `apps/studio/` |
| Published documentation site | `apps/docs/src/content/docs/` |
| Repository maintenance scripts | `tooling/` |
| Authored skills | `Docs/skills/` |

Do not place reusable consumer-facing behavior in the private Studio app. Do
not put repository maintenance logic in a public runtime package. Change the
owner and its public facade together when the feature crosses a package
boundary.

## Add coverage at the right level

Add the smallest test that proves the changed behavior, then add broader
coverage when the feature changes a public or cross-process contract:

- put runtime and component tests under the nearest `__tests__/` directory;
- put public TypeScript contract fixtures under `packages/framekit/type-tests/`;
- put CLI argument, usage, and exit-code cases in the relevant CLI test tree;
- put browser workflows under `e2e/`; and
- validate generated consumers when the feature affects code generation,
  package exports, the creator, or a consumer command.

See [coding conventions](/en/contributors/development/coding-conventions) for
test placement, aliases, and import boundaries.

## Keep source and output separate

Edit maintained source such as templates, brand components, package source, or
Markdown pages. Do not hand-edit:

- `packages/framekit/dist/` or other build output;
- a consumer project's `src/generated/framekit/`;
- a consumer project's `public/framekit/` or `.framekit/`; or
- `apps/docs/dist/` and `apps/docs/.astro/`.

After changing a template, brand component, or supported asset, run the
appropriate `framekit generate`, `framekit check`, or `framekit build` command.
The [generated code guide](/en/contributors/architecture/generated-code) lists
which command regenerates each output.

## Select the gates

Run the focused checks for the owner before broad checks:

| Change | Minimum focused gates |
| --- | --- |
| `@mauriciodmo/framekit` runtime or public API | `pnpm --filter @mauriciodmo/framekit lint`; `pnpm --filter @mauriciodmo/framekit test`; `pnpm --filter @mauriciodmo/framekit typecheck`; `pnpm --filter @mauriciodmo/framekit build` |
| First-party Studio | Build FrameKit first with `pnpm --filter @mauriciodmo/framekit build`, then run `pnpm --filter studio check`; `pnpm --filter studio test`; `pnpm --filter studio typecheck`; `pnpm --filter studio lint`; and `pnpm --filter studio build` |
| `@mauriciodmo/create-framekit` or its template | `pnpm --filter @mauriciodmo/create-framekit lint`; `pnpm --filter @mauriciodmo/create-framekit test`; `pnpm --filter @mauriciodmo/create-framekit typecheck`; `pnpm --filter @mauriciodmo/create-framekit build` |
| Documentation | `pnpm --filter docs build` |
| Public package, CLI, or generated-consumer behavior | Run the owning package's full build, `pnpm check:runtime` when the runtime contract changes, and `pnpm smoke:tarballs` when packaging or consumer behavior changes |

For a cross-workspace change, run `pnpm lint`, `pnpm test`, `pnpm typecheck`,
and `pnpm build` from the root. Use `pnpm test:e2e` for browser behavior and
the relevant `tooling/` smoke command for distribution behavior. See
[contributor workflow](/en/contributors/development/workflow) for the command
order.
