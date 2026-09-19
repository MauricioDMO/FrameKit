---
title: Documentation maintenance
description: Keep FrameKit's published contributor documentation current, focused, and separate from repository operations.
---

# Documentation maintenance

This section is for contributors who maintain the published FrameKit
documentation under `apps/docs/src/content/docs/`. Its primary responsibility is
to keep each page useful for one audience and one job without turning repository
plans or agent skills into public product guidance.

## Choose the maintenance guide

| Page | Primary responsibility |
| --- | --- |
| [Writing and structure](/en/contributors/documentation/writing-and-structure) | Add or revise pages, choose authoritative sources, and keep routes and sidebar entries aligned. |
| [Translations and Mermaid](/en/contributors/documentation/translations-and-mermaid) | Maintain the English editorial source, prepare the later Spanish translation, and use diagrams only when they clarify relationships. |

Start with [contributor getting started](/en/contributors/getting-started) if
you are setting up the repository. Use [local development](/en/contributors/getting-started/local-development)
for docs workspace commands, and keep consumer-facing contracts in the [user
documentation](/en/users/).

## Keep published and operational content separate

Published pages live under `apps/docs/src/content/docs/`. `Docs/Plans/` contains
implementation and documentation phase records, while `Docs/skills/` contains
the maintained source for repository and generated-project skills. Those
directories remain outside the published site; do not move them into the docs
tree or use historical plan prose as current product guidance.

When sources disagree, prefer the current package manifests, implementation,
tests, and canonical consumer template. Treat `Docs/en/` and `Docs/es/` as
migration context only. Omit any command, route, import, file, or behavior that
cannot be verified against the current repository.

## Keep page responsibilities narrow

Give every page a primary audience and a primary responsibility. Link to the
page that owns a procedure instead of copying it into another guide. Contributor
pages explain repository ownership and maintenance; user pages explain how to
build with FrameKit.

The [contributor development guide](/en/contributors/development) connects
implementation, verification, distribution, releases, and documentation work.
Use it to find an existing owner before adding another page.
