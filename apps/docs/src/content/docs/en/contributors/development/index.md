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
| Focused verification | [Local development](/en/contributors/getting-started/local-development) | Start with the owning workspace's focused commands and root checks. |
| Package distribution | [Package architecture](/en/contributors/architecture/packages) | Confirm public packages, private workspaces, and manifest exports before packaging. |
| Release scope | [Contributing to FrameKit](/en/contributors/) | Keep versioned work within public package ownership and verify consumer-facing behavior. |
| Documentation site | [Local development](/en/contributors/getting-started/local-development) | Run docs workspace commands from the root and keep contributor and user audiences separate. |

## From source to release

1. Identify the owning workspace and runtime layer. Start with the [repository architecture](/en/contributors/architecture/repository),
   [package architecture](/en/contributors/architecture/packages), and [import boundaries](/en/contributors/development/import-boundaries).
2. Change maintained source, not generated registries, copied assets, or build
   output. The [generated code guide](/en/contributors/architecture/generated-code)
   explains which commands recreate those outputs.
3. Run the focused command for the owning workspace from the repository root.
   The [local development guide](/en/contributors/getting-started/local-development)
   documents the package-first build order and available scripts.
4. Run the checks appropriate to the change. Start with the focused commands in
   [local development](/en/contributors/getting-started/local-development) and
   add broader root checks when the change crosses workspaces.
5. If the change affects a public package, export, or generated consumer, follow
   [package architecture](/en/contributors/architecture/packages) to confirm
   ownership and manifest exports before packaging. Keep consumer examples
   linked to the [user package API reference](/en/users/reference/package-api).
6. Treat a versioned release as a public-package change: confirm its ownership
   and exports in [package architecture](/en/contributors/architecture/packages)
   before applying the repository's release process.
7. For documentation changes, use [local development](/en/contributors/getting-started/local-development)
   for docs workspace commands and keep consumer instructions in the [user documentation](/en/users/).

## Keep responsibilities separate

The contributor path has three related but distinct views:

- [Architecture](/en/contributors/architecture) explains where behavior and
  output live.
- [Import boundaries](/en/contributors/development/import-boundaries) explains which
  imports and layer directions are allowed.
- [Local development](/en/contributors/getting-started/local-development) covers
  focused commands, docs builds, and the first verification step.
- [Package architecture](/en/contributors/architecture/packages) identifies
  public packages and exports before distribution or release work.
- [User documentation](/en/users/) covers consumer contracts; contributor pages
  keep repository ownership and workflow separate.

Use the [user package API reference](/en/users/reference/package-api) and the
[generated files reference](/en/users/reference/generated-files) for consumer
contracts and generated-project behavior. This contributor section records
repository ownership and workflow without duplicating those contracts.
