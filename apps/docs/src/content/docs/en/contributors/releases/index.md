---
title: Contributor releases
description: Separate versionless FrameKit development from public package releases and their verification gates.
---

# Contributor releases

FrameKit development is versionless until a public package is prepared for
publication. Normal work accumulates in the repository and in the `Unreleased`
section of `CHANGELOG.md`; a release is the separate operation of versioning,
packing, publishing, and verifying one or both public packages.

## Release scope

Only these packages are public release targets:

| Package | Release responsibility |
| --- | --- |
| `@mauriciodmo/framekit` | The reusable runtime, public entrypoints, stylesheet, and `framekit` CLI. |
| `@mauriciodmo/create-framekit` | The `create-framekit` CLI and the canonical consumer template. |

The root workspace, `apps/studio/`, and `apps/docs/` are private. They are not
additional packages to publish. Confirm the ownership and export boundary in
the [distribution guide](/en/contributors/distribution) before starting a
release.

The two public packages are versioned independently. A `create-framekit`
release does not require a new `@mauriciodmo/framekit` version unless the
template needs a new core API. When the template adopts a new core API, update
the exact `@mauriciodmo/framekit` dependency in
`packages/create-framekit/template/package.json` to the published core version
before publishing `@mauriciodmo/create-framekit`. When both packages are
released, publish FrameKit first because the generated project depends on it. The
[versioning and changelog guide](/en/contributors/releases/versioning-and-changelog)
describes the package and changelog responsibilities.

The local tarball and post-publication registry smoke flows replace the
generated consumer's FrameKit dependency with an exact core package for
isolated testing. They therefore do not validate the published template
declaration by themselves; inspect the template manifest as part of release
preparation.

## Versionless development

While developing:

- do not select a future release version in documentation or source work;
- keep user-facing changes in the root `CHANGELOG.md` under `Unreleased`;
- run the focused checks for the owning workspace and the broader checks needed
  by the change; and
- keep package, consumer, and generated-output changes aligned without treating
  a local build or an old CI result as a release result.

The [contributor workflow](/en/contributors/development/workflow) covers the
clean-checkout path and focused commands. The [contributor testing guide](/en/contributors/testing) explains what each verification level proves.

## Release path

When a release is actually being prepared, use this order:

1. Identify the changed public package or packages and review the relevant
   `Unreleased` entries.
2. Update only the version field in the public package manifest for each
   package included in the release. Do not version the private root, Studio, or
   documentation workspace.
3. Run the local publication gates in the [publishing guide](/en/contributors/releases/publishing),
   including package builds, checks, tarball inspection, and isolated consumers.
4. Publish only the selected public package tarballs using a release-time npm
   dist-tag that is not the final promotion tag.
5. Run the post-publication registry check and any applicable Docker check.
   Promote each released package to its final dist-tag only after those gates
   pass.

The repository has no release-specific CI workflow or branch policy to add to
this procedure. The existing [CI guide](/en/contributors/testing/ci) describes
the checks run for pushes and pull requests, while [E2E and smoke tests](/en/contributors/testing/e2e-and-smoke) distinguishes browser, tarball, and Docker checks.

## Release pages

| Page | Use |
| --- | --- |
| [Versioning and changelog](/en/contributors/releases/versioning-and-changelog) | Keep package versions independent and maintain the shared changelog. |
| [Publishing](/en/contributors/releases/publishing) | Run the pre-publication gates, publish the selected packages, and complete post-publication verification. |
