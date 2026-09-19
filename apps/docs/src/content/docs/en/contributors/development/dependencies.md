---
title: Dependencies
description: Choose dependency locations carefully and update workspace manifests and the lockfile from the repository root.
---

# Dependencies

Keep the dependency graph small and make each dependency belong to the
workspace that runs it. Prefer a platform API or a dependency already installed
for the owning runtime before adding a new package.

## Choose the smallest existing boundary

Use this order when a feature appears to need a dependency:

1. Use a Node.js built-in, browser API, or existing repository utility when it
   covers the behavior.
2. Reuse an installed dependency when it already owns the required capability.
   For example, the runtime already owns browser installation through
   `playwright-core`, and code generation uses the existing `tsx` and
   `chokidar` dependencies.
3. Add a new dependency only when the platform and current graph do not cover
   the requirement. Record why it belongs in the owning manifest.

Do not add a dependency to the root workspace just because it is convenient for
one package. Keep Node-only dependencies out of Foundation, Editor, and
browser-facing client graphs. The [import boundaries](/en/contributors/development/import-boundaries)
page describes the client, Server, and Tooling separation.

## Update the owning manifest

Choose the manifest by who executes the code:

| Code | Manifest and dependency type |
| --- | --- |
| Public reusable runtime or tooling | `packages/framekit/package.json` `dependencies`, `peerDependencies`, or `devDependencies` as appropriate |
| Public creator implementation | `packages/create-framekit/package.json` |
| Generated consumer runtime | `packages/create-framekit/template/package.json` `dependencies` or `devDependencies` |
| First-party Studio | `apps/studio/package.json` |
| Documentation tooling | `apps/docs/package.json` |
| Repository-only maintenance | Root `package.json` |

Use `peerDependencies` when the consumer must provide a compatible framework,
as FrameKit does for Next.js, React, and React DOM. Use runtime
`dependencies` for code imported when the published package executes. Keep
build-only, test-only, and type-only packages in `devDependencies`.

Public packages must remain installable outside this workspace. Do not add
`workspace:`, `link:`, or local `file:` dependency references to a public
package. The tarball smoke rejects those references in packed package content.

## Update workspace manifests and the lockfile

After changing a workspace package manifest, run the package manager from the
repository root so the manifest and lockfile are updated together:

```bash
pnpm install
```

Review both the manifest and `pnpm-lock.yaml`. Do not hand-edit the lockfile or
commit a manifest change without its corresponding lockfile update. A clean
checkout should still install with:

```bash
pnpm install --frozen-lockfile
```

`packages/create-framekit/template/package.json` is different: it is copied into
generated consumers and is not a workspace importer in `pnpm-workspace.yaml`.
Its dependency changes do not add a root lockfile entry. Validate those changes
through the [generated consumer install and smoke flow](/en/contributors/distribution/generated-consumer)
instead of claiming a root lockfile update.

Keep the repository contract at Node.js `>=22.13.0` and pnpm `>=11.14.0` when
choosing versions. If those requirements change, update the matching manifests,
CI workflow, and checked documentation, then run:

```bash
pnpm check:runtime
```

## Verify dependency changes

Run the owning workspace checks, then package and consumer gates when the
dependency is public or affects generated projects:

```bash
pnpm --filter <workspace> lint
pnpm --filter <workspace> test
pnpm --filter <workspace> typecheck
pnpm --filter <workspace> build
pnpm --filter @mauriciodmo/framekit pack --dry-run
pnpm --filter @mauriciodmo/create-framekit pack --dry-run
```

Use `pnpm smoke:tarballs` for isolated package consumers. Use
`pnpm smoke:docker -- <exact-published-framekit-version>` only for the
published FrameKit Docker path; it verifies the published dependency, image
build, browser runtime, API, and persistent storage behavior. For a
cross-workspace change, finish with the root `lint`, `test`, `typecheck`, and
`build` checks.
