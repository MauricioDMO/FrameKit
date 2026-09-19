---
title: Versioning and changelog
description: Version FrameKit's public packages independently and keep the shared changelog aligned with released work.
---

# Versioning and changelog

FrameKit has two public package manifests and one shared root changelog. Keep
development versionless, then version only the public package or packages that
are part of the release.

## Package versions

| Manifest | Package status | Version responsibility |
| --- | --- | --- |
| `packages/framekit/package.json` | Public | Version of `@mauriciodmo/framekit`. |
| `packages/create-framekit/package.json` | Public | Version of `@mauriciodmo/create-framekit`. |
| `package.json` | Private root workspace | No public package release version. |

The public package versions are independent. A change limited to
`@mauriciodmo/create-framekit` does not require changing the core package
version. Change the core version when the creator template or another released
artifact needs a new core API. If both packages are released, publish
`@mauriciodmo/framekit` before `@mauriciodmo/create-framekit` so the generated
consumer can resolve the required core package.

The creator's copied template declares its `@mauriciodmo/framekit` dependency
in `packages/create-framekit/template/package.json`. Keep that dependency at
the current published core version unless the template requires a new core API.
When it adopts a new core API, set that exact dependency to the published core
version before publishing `@mauriciodmo/create-framekit`. That dependency is a
consumer-project dependency, not a reason to version the core package for every
creator-only change.

The local tarball and post-publication registry smoke flows replace the
generated consumer's FrameKit dependency with an exact core package for
isolated testing. They therefore do not validate the published template
declaration by themselves; verify the template manifest before publishing the
creator package.

Do not select or document a future version in advance. During release
preparation, update only the package manifest for the selected package, then
run the [publication gates](/en/contributors/releases/publishing) from the
repository root.

## Changelog ownership

The repository currently maintains one root `CHANGELOG.md`; it does not use a
separate changelog file for each public package. Its current development record
starts with:

```text
## Unreleased

### Changed
```

While work is versionless, add user-facing changes to that shared `Unreleased`
record and preserve its existing heading style. Review those entries during
release preparation and keep the entries relevant to the public package or
packages being released. The changelog is a record of repository changes; it is
not evidence that a package has been published.

Do not copy a historical CI run, smoke result, or package version into the
changelog as a permanent release contract. Current checks and their scope belong in the [contributor testing guide](/en/contributors/testing), the [distribution guide](/en/contributors/distribution), and the [publishing guide](/en/contributors/releases/publishing).

## Versioning checklist

Before publishing:

1. Identify which public package changed.
2. Review the matching `Unreleased` entries in `CHANGELOG.md`.
3. Update only the selected public package manifest version.
4. If the creator template needs a new core API, prepare the core package first,
   set the exact `@mauriciodmo/framekit` dependency in
   `packages/create-framekit/template/package.json` to that published core
   version, and do this before publishing the creator package.
5. Run `pnpm check:runtime`, then follow the build, pack, and smoke sequence in
   the [publishing guide](/en/contributors/releases/publishing).
