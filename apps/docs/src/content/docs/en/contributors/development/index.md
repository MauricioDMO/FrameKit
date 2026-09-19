---
title: Contributor development
description: Connect FrameKit architecture, local development, verification, distribution, releases, and documentation work.
---

# Contributor development

Use this page after [contributor getting started](/en/contributors/getting-started)
and the [architecture guide](/en/contributors/architecture). It connects a
change to the repository area that owns it and to the checks that prove it is
ready. Consumer-facing API contracts belong in the [user package API reference](/en/users/reference/package-api),
not in a second contributor API reference.

## Choose the next guide

| Concern | Guide | Purpose |
| --- | --- | --- |
| Repository shape and runtime layers | [Architecture](/en/contributors/architecture) | Locate ownership, source boundaries, generated output, and runtime flows. |
| Import direction and public entrypoints | [Import boundaries](/en/contributors/development/import-boundaries) | Keep consumers on published exports and keep Foundation, client, Server, and Tooling responsibilities separate. |
| First local run and focused commands | [Local development](/en/contributors/getting-started/local-development) | Install from the root, preserve package build order, and choose workspace commands. |
| Tests and CI | [Testing](/en/contributors/testing) | Select runtime, type-level, integration, E2E, smoke, and CI checks for the change. |
| Packages and consumers | [Distribution](/en/contributors/distribution) | Verify package contents, exports, tarballs, and isolated generated consumers. |
| Versioned publication | [Releases](/en/contributors/releases) | Coordinate package versioning, release gates, publication, and promotion. |
| Site content | [Documentation](/en/contributors/documentation) | Change the documentation site while keeping audience, structure, and language boundaries clear. |

## From source to release

1. Identify the owning workspace and runtime layer. Start with the [repository architecture](/en/contributors/architecture/repository),
   [package architecture](/en/contributors/architecture/packages), and [import boundaries](/en/contributors/development/import-boundaries).
2. Change maintained source, not generated registries, copied assets, or build
   output. The [generated code guide](/en/contributors/architecture/generated-code)
   explains which commands recreate those outputs.
3. Run the focused command for the owning workspace from the repository root.
   The [local development guide](/en/contributors/getting-started/local-development)
   documents the package-first build order and available scripts.
4. Run the checks appropriate to the change. The [testing guide](/en/contributors/testing)
   explains what each level verifies and what it does not cover.
5. If the change affects a public package, export, or generated consumer, follow
   the [distribution guide](/en/contributors/distribution) after the focused
   checks. Keep consumer examples linked to the [user package API reference](/en/users/reference/package-api).
6. Use the [release guide](/en/contributors/releases) only when a package
   version is being prepared. Release gates and publication are separate from
   ordinary versionless development.
7. For documentation changes, follow the [documentation guide](/en/contributors/documentation)
   and keep consumer instructions in the [user documentation](/en/users/).

## Keep responsibilities separate

The contributor path has three related but distinct views:

- [Architecture](/en/contributors/architecture) explains where behavior and
  output live.
- [Development](/en/contributors/development/import-boundaries) explains which
  imports and layer directions are allowed.
- [Testing](/en/contributors/testing), [distribution](/en/contributors/distribution),
  [releases](/en/contributors/releases), and [documentation](/en/contributors/documentation)
  explain how to verify, publish, and maintain the result.

Use the [user package API reference](/en/users/reference/package-api) and the
[generated files reference](/en/users/reference/generated-files) for consumer
contracts and generated-project behavior. This contributor section records
repository ownership and workflow without duplicating those contracts.
