---
title: Package exports and boundaries
description: Verify FrameKit's public package entrypoints, build targets, and consumer import boundaries.
---

# Package exports and boundaries

The `exports`, `files`, and `bin` fields in the package manifests define the
distribution contract. Consumers use published package specifiers, not the
repository source tree or internal build paths.

## `@mauriciodmo/framekit` exports

The current package publishes these exact entrypoints:

| Consumer specifier | Manifest key | JavaScript target | Type target |
| --- | --- | --- | --- |
| `@mauriciodmo/framekit` | `.` | `./dist/index.js` | `./dist/index.d.ts` |
| `@mauriciodmo/framekit/editor` | `./editor` | `./dist/editor.js` | `./dist/editor.d.ts` |
| `@mauriciodmo/framekit/client` | `./client` | `./dist/client.js` | `./dist/client.d.ts` |
| `@mauriciodmo/framekit/next` | `./next` | `./dist/next.js` | `./dist/next.d.ts` |
| `@mauriciodmo/framekit/studio` | `./studio` | `./dist/studio.js` | `./dist/studio.d.ts` |
| `@mauriciodmo/framekit/studio/root` | `./studio/root` | `./dist/studio-root.js` | `./dist/studio-root.d.ts` |
| `@mauriciodmo/framekit/dev` | `./dev` | `./dist/dev.js` | `./dist/dev.d.ts` |
| `@mauriciodmo/framekit/server` | `./server` | `./dist/server.js` | `./dist/server.d.ts` |
| `@mauriciodmo/framekit/styles.css` | `./styles.css` | `./dist/styles.css` | Not applicable |

Each JavaScript export has the same `import` and `default` target shown in the
table, plus its `types` target. The `./next` entrypoint is supported and is the
entrypoint used by the canonical template's `next.config.ts`:

```ts
import { withFrameKit } from '@mauriciodmo/framekit/next'

export default withFrameKit()
```

The package binary is also part of this boundary:

```text
framekit -> ./bin/framekit.js
```

The CLI supports `generate`, `check`, `dev`, `build`, `start`, and
`browser install [--with-deps]`. See the [FrameKit CLI reference](/en/users/reference/cli/framekit)
for the command contract.

## The creator package boundary

`@mauriciodmo/create-framekit` is the second and only other public package. It
publishes the `create-framekit` binary at `./dist/cli.js` and the canonical
`template/` directory. It is consumed through its executable and copied
template, not through imports from `packages/create-framekit/src/**`.

The generated template imports reusable code through the public FrameKit
entrypoints, for example:

```ts
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'
import { createFrameKitApiHandler } from '@mauriciodmo/framekit/server'
```

After generation, project-local bindings use the `@framekit/generated/*`
aliases. They are generated consumer files, not additional published FrameKit
exports.

## Keep the public boundary

Consumer, generated-project, and first-party adapter imports must use one of the
exact specifiers above. Use `@framekit/generated/*` only for files generated
inside the consumer project.

This keeps the public contract independent of the repository layout and keeps
client, server, and tooling graphs on their supported sides of the boundary.
The [import boundaries guide](/en/contributors/development/import-boundaries)
and [user package API reference](/en/users/reference/package-api) describe the
same rule from contributor and consumer perspectives.

## Build and audit the targets

The FrameKit `tsdown` build has one entry for each JavaScript export plus the
CLI entry:

```text
src/index.ts          -> dist/index.js
src/editor.ts         -> dist/editor.js
src/client/index.ts   -> dist/client.js
src/next.ts           -> dist/next.js
src/studio.ts         -> dist/studio.js
src/studio-root.ts    -> dist/studio-root.js
src/dev.ts            -> dist/dev.js
src/server.ts         -> dist/server.js
src/tooling/cli/index.ts -> dist/cli.js
```

The stylesheet is built separately into `dist/styles.css`. The creator build
uses `src/cli.ts` as its `dist/cli.js` entry. When the package is packed, its
`files` list includes the canonical `template/` directory.
Run the package builds in this order:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
```

Both builds run `check-dist`, which verifies emitted relative imports and that
manifest `exports` and `bin` targets are existing files inside the package. Then
run [the tarball smoke](/en/contributors/testing/e2e-and-smoke) to inspect the
actual archives, including workspace references, local paths, secrets, and
browser artifacts.
