---
title: Writing and structure
description: Add focused FrameKit documentation pages from current sources and keep their routes and sidebar entries aligned.
---

# Writing and structure

This page is for contributors adding or revising published documentation. Its
primary responsibility is to keep page structure, source evidence, links, and
navigation maintainable.

## Start with the audience

Decide who the page serves before choosing its format:

- `users/` explains how to build and operate a FrameKit application;
- `contributors/` explains how to change and verify the FrameKit repository.

Give the page one primary responsibility. A focused reference, workflow, or
concept page is easier to verify and link than a second index that repeats
several procedures. Link to an existing owner when the information already has
a page.

## Use current sources first

Verify published claims against the current repository in this order:

1. package manifests and their public exports or binaries;
2. implementation and tests under the owning workspace;
3. the canonical generated-consumer template; and
4. current first-party integration where it demonstrates the behavior.

Legacy pages outside the published tree can reveal migration topics, but they
are not authority over current code. `Docs/Plans/` records work coordination,
not product behavior. Do not copy historical commands or describe unsupported
surfaces just because an older page mentions them.

## Add a page

Create the maintained Markdown page below the audience directory, for example:

```text
apps/docs/src/content/docs/en/contributors/<area>/<slug>.md
```

Use Starlight frontmatter with a concise title and description, then keep a
matching page heading and focused sections:

```md
---
title: A focused page title
description: State the page's audience and primary responsibility.
---

# A focused page title
```

Use repository paths, package names, commands, routes, and imports exactly as
they exist in the current sources. Link between published English pages with
root-relative `/en/` paths, for example:

```md
See the [contributor workflow](/en/contributors/development/workflow) before
running repository checks.
```

Do not link to generated output as if it were maintained source. In particular,
change Markdown under `apps/docs/src/content/docs/`, not `apps/docs/dist/` or
`apps/docs/.astro/`.

## Add the route to the sidebar

A Markdown file has a route, but it is not necessarily visible in the Starlight
sidebar. When a page is ready to be navigated, update the `sidebar` passed to
Starlight in `apps/docs/astro.config.mjs`. Use an explicit slug for a single
page or an `autogenerate` directory entry for a group:

```js
{
  label: 'Documentation',
  items: [{ autogenerate: { directory: 'contributors/documentation' } }]
}
```

Keep the sidebar label and grouping aligned with the page's audience. Do not
edit generated navigation or build output. A navigation change is a source
configuration change and must be checked with the docs build.

## Maintain skills from their source

Skills are separate from published documentation. Edit a skill only under
`Docs/skills/`, then synchronize the maintained source:

```bash
pnpm sync:skills
```

The sync copies internal skills to `.agents/skills/` and public skills to
`packages/create-framekit/template/.agents/skills/`. Never edit either
synchronized copy directly; change the source and run the sync instead.

## Preserve route parity

English is stabilized before localization. For each English route added under
`en/`, phase 9 should add an equivalent Spanish page under `es/` with the same
slug, responsibility, and technical examples. During phase 8, add only the
English page: do not create Spanish pages or claim that the locales already
have route or content parity.

When a page is localized, English links must keep `/en/` and Spanish links must
use `/es/`; never use a bare `/users` path or a relative link that can cross
locales. Compare both route trees after localization and run the docs build
before treating the pair as complete.

## Verify the page

Run the docs build from the repository root:

```bash
pnpm --filter docs build
```

Then check the rendered route, its sidebar placement, every internal link, and
the source claims against the current manifests, implementation, tests, and
canonical template. The build proves the site can compile; it does not prove
that a historical claim is still supported.
