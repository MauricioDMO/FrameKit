---
title: Adding package entrypoints
description: Align FrameKit source facades, tsdown entries, package exports, binaries, and public contract checks.
---

# Adding package entrypoints

An entrypoint is a public contract, not just another source file. Update the
source facade, build entry, package manifest, and contract coverage together.
The [package architecture](/en/contributors/architecture/packages) page lists
the ownership boundary.

## Follow the current build map

The `packages/framekit/tsdown.config.ts` entry map and
`packages/framekit/package.json` exports currently align as follows:

| Consumer specifier | Source entry | Built target |
| --- | --- | --- |
| `@mauriciodmo/framekit` | `src/index.ts` | `dist/index.js` and `dist/index.d.ts` |
| `@mauriciodmo/framekit/editor` | `src/editor.ts` | `dist/editor.js` and `dist/editor.d.ts` |
| `@mauriciodmo/framekit/client` | `src/client/index.ts` | `dist/client.js` and `dist/client.d.ts` |
| `@mauriciodmo/framekit/next` | `src/next.ts` | `dist/next.js` and `dist/next.d.ts` |
| `@mauriciodmo/framekit/studio` | `src/studio.ts` | `dist/studio.js` and `dist/studio.d.ts` |
| `@mauriciodmo/framekit/studio/root` | `src/studio-root.ts` | `dist/studio-root.js` and `dist/studio-root.d.ts` |
| `@mauriciodmo/framekit/dev` | `src/dev.ts` | `dist/dev.js` and `dist/dev.d.ts` |
| `@mauriciodmo/framekit/server` | `src/server.ts` | `dist/server.js` and `dist/server.d.ts` |
| `@mauriciodmo/framekit/styles.css` | `src/styles.css` through `build:css` | `dist/styles.css` |

JavaScript exports use `types`, `import`, and `default` targets in the public
manifest. The stylesheet export is a direct file target. The `framekit` binary
is separate from the import exports: `bin/framekit.js` loads `dist/cli.js`,
which is built from `src/tooling/cli/index.ts`.

The creator package has one build entry, `src/cli.ts`, and its manifest binary
points `create-framekit` to `dist/cli.js`.

## Add an entrypoint in order

1. Add or update the small source facade. Export only symbols owned by that
   public boundary, and preserve client directives such as `'use client'`.
2. Add the matching key to `packages/framekit/tsdown.config.ts`, or update the
   owning package build configuration. Keep the output basename aligned with
   the manifest target.
3. Add the `package.json` `exports` entry with its types and runtime targets.
   Update `bin` only for a command binary, not for an import entrypoint.
4. Add runtime tests under the nearest `__tests__/` tree and public TypeScript
   fixtures under `packages/framekit/type-tests/` when the exported contract is
   typed. Import the fixture through the public package specifier.
5. Build and inspect the package before testing a consumer:

   ```bash
   pnpm --filter @mauriciodmo/framekit build
   pnpm --filter @mauriciodmo/framekit typecheck
   pnpm --filter @mauriciodmo/framekit test
   ```

The package build runs `check-dist`. That check verifies every manifest export
and binary target exists and that relative imports in `dist/` stay within the
package. Type-checking also includes the FrameKit type-test project.

## Verify the published shape

Use the package's dry-run and consumer checks when a change affects a public
entrypoint:

```bash
pnpm --filter @mauriciodmo/framekit pack --dry-run
pnpm smoke:tarballs
```

The tarball smoke checks public export resolution, package targets, client and
server isolation, the generated consumer, and the `framekit generate`,
`check`, `build`, and `start` path. Do not treat a successful source import as
proof that the packed package works. See [import boundaries](/en/contributors/development/import-boundaries)
for the supported consumer boundaries.
