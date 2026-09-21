---
title: Contributor distribution
description: Build, inspect, and smoke-test FrameKit's public packages outside the checkout.
---

# Contributor distribution

Distribution work verifies what an external project can install and use. The
package manifests, build configuration, canonical template, and smoke scripts
are the authority for this workflow.

## Public package boundary

Only these two packages are public distribution targets:

| Package | Maintained source | Published responsibility |
| --- | --- | --- |
| `@mauriciodmo/framekit` | `packages/framekit/` | Reusable runtime, public entrypoints, stylesheet, and the `framekit` CLI. |
| `@mauriciodmo/create-framekit` | `packages/create-framekit/` | The `create-framekit` project creator and canonical consumer template. |

The root workspace, `apps/studio/`, and `apps/docs/` are private repository
workspaces. They are not additional public packages and must not be treated as
publishable consumer dependencies. See [package architecture](/en/contributors/architecture/packages)
for ownership and the [package exports guide](/en/contributors/distribution/package-exports)
for the consumer boundary.

## Build in package order

Run public-package builds from the repository root:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
```

The FrameKit build emits its JavaScript declarations, ESM files, and CSS, then
runs its distribution check. The creator build emits `dist/cli.js` and runs the
same distribution-target checks. Build the runtime package first so any
workspace consumer or generated project resolves its current `dist/` files.

`pack` runs each package's `prepack` build as well. The explicit build order is
still useful when inspecting artifacts or diagnosing a stale package build. The
[contributor workflow](/en/contributors/development/workflow) covers focused
workspace checks, while [contributor testing](/en/contributors/testing) maps
the broader test levels.

## What the tarballs contain

The `files` lists in the manifests define the package boundaries.

`@mauriciodmo/framekit` includes:

- `bin/`, including `bin/framekit.js`;
- `dist/`, including the built public entrypoints and `dist/styles.css`;
- `README.md`; and
- `LICENSE`.

The tarball smoke checks representative required entries such as
`package/dist/index.js`, `package/dist/client.js`,
`package/dist/client.d.ts`, `package/dist/server.js`,
`package/dist/server.d.ts`, and `package/dist/styles.css`.

`@mauriciodmo/create-framekit` includes:

- `dist/`, including `dist/cli.js`;
- `template/`, including its package manifest, `Dockerfile`,
  `next.config.ts`, `.env.example`, and the six canonical `src/app` files;
- `README.md`; and
- `LICENSE`.

Its manifest excludes template `node_modules`, `.next`, `.framekit`,
`.framekit-data`, `public/framekit`, `src/generated/framekit`, `*.tsbuildinfo`,
and `next-env.d.ts`. Those exclusions keep generated, local, or runtime data out
of the creator archive.

## Inspect before publication

Run the version-independent local artifact gate from the repository root:

```bash
pnpm smoke:tarballs
```

The script packs both public packages into a temporary directory outside the
checkout and inspects the extracted archives. It proves that:

- expected files, manifest export targets, and executable binaries exist;
- package targets stay inside their package and the binaries have shebangs;
- tests, `node_modules`, secrets, credentials, private keys, database files,
  browser binaries, and `.framekit-data` are absent;
- archive files contain no checkout path, `workspace:`, `link:`, or local
  `file:` references; and
- public exports and client/server runtime boundaries resolve from the packed
  core package.

The same command then exercises consumers outside the checkout. It covers an
independent consumer installed from the core tarball and a consumer generated
from the creator tarball. See [generated consumer](/en/contributors/distribution/generated-consumer)
for the command lifecycle. This is a local tarball gate; it does not download
a browser or build and run a Docker image.

## Keep release gates separate

The local tarball smoke and a post-publication registry smoke answer different
questions. The local gate inspects exactly what was packed before publication.
The registry gate installs exact package specs from npm after publication,
checks their resolved versions and intended dist-tags, resolves the public
exports, creates an isolated consumer, and runs its generation, check, build,
and start path in explicit open and authenticated modes, including authenticated
login, token creation, and PNG rendering. Record `CORE_SPEC`, `CREATOR_SPEC`,
`EXPECTED_FRAMEKIT_DIST_TAG`, `EXPECTED_CREATE_FRAMEKIT_DIST_TAG`, the resolved
versions, runtime versions, timestamp, and PASS or FAIL. Use exact registry
specs, not ranges; a successful upload is not a successful registry gate.

Versioning, changelog, and publication handoffs belong to the approved [release
guide](/en/contributors/releases), [versioning and changelog guide](/en/contributors/releases/versioning-and-changelog),
and [publishing guide](/en/contributors/releases/publishing). This distribution
section stays focused on the artifacts and consumer gates those procedures use.

Docker is a separate registry-backed operational check:

```bash
pnpm smoke:docker -- <exact-published-framekit-version>
```

It builds the canonical consumer into a Docker image from the exact published
FrameKit version, starts explicit open and authenticated containers, checks
authentication and PNG rendering, and checks persistence across container
replacement. It is not a substitute for
the local tarball smoke, unit tests, type checks, or browser E2E. Compare the
gates in [E2E and smoke tests](/en/contributors/testing/e2e-and-smoke).

For the exact export map and package import rules, use [package exports](/en/contributors/distribution/package-exports).
