# Phase 5 - Compact Tailwind Color Tokens

## Status

- **Status:** Implemented in the current checkout; verification remains part of
  the phase exit gate.
- **Scope:** One stylesheet and product-shell token migration. No layout,
  interaction, export, or artwork redesign.

## Goal

Keep `packages/framekit/src/styles.css` as the only source of the published
FrameKit theme and reduce the product shell to a small, reusable Tailwind v4
palette. Color names describe hue and numeric scale, never a component or state.

The existing `@mauriciodmo/framekit/styles.css` export remains unchanged. The
canonical template and first-party Studio continue importing that same file.

## Palette Contract

The stylesheet publishes exactly these 15 theme variables through `@theme`:

| Family | Variables | Use |
| --- | --- | --- |
| Forest | `--color-fk-forest-100` through `--color-fk-forest-400` | Dark surfaces, actions, and deep text |
| Mint | `--color-fk-mint-100` through `--color-fk-mint-300` | Accent, focus, and selected states |
| Sage | `--color-fk-sage-100` through `--color-fk-sage-400` | Light/dark supporting text |
| Ivory | `--color-fk-ivory-100` through `--color-fk-ivory-400` | Light surfaces, preview, borders, and placeholders |

The values intentionally consolidate nearby existing colors instead of copying
every old hex value into a separate variable. The generated utilities are named
`bg-fk-forest-300`, `text-fk-sage-400`, and so on.

Pure white and transparent borders use Tailwind's built-in utilities. Shadows
use built-in elevation utilities. User-provided artwork and color-field values
remain untouched. The preview texture and encoded native-select arrows remain
small implementation literals because they are not theme surfaces.

Do not add variables or utilities named for `button`, `action`, `loading`,
`toggle`, `picker`, `sidebar`, `panel`, or `text` roles. Use the numeric palette
directly and add `dark:` when a surface or text value changes with the theme.

## Source Map

- `packages/framekit/src/styles.css` owns the `@theme` palette and select rules.
- `packages/framekit/src/editor/**` consumes generic palette utilities for
  controls, fields, navigation, metadata, and preview.
- `packages/framekit/src/studio/**` consumes generic palette utilities for the
  shell, settings, catalog, root, and loading/empty/error states.
- `apps/studio/src/app/globals.css` and the canonical template only import the
  existing stylesheet; neither defines a second palette.
- Template and brand artwork remain opaque authored output.

## Invariants

- The six supported package exports remain unchanged.
- No generated file under `packages/framekit/dist/`, `.framekit/`, or
  `src/generated/framekit/` is edited by hand.
- Light/dark switching continues to use the document `dark` class and existing
  cookie/bootstrap behavior.
- Focus styles, selected states, disabled states, native selects, field errors,
  navigation persistence, preview interactions, and PNG output remain intact.
- No public component-specific color variable is introduced.

## Verification

Run from the repository root:

```sh
pnpm --filter @mauriciodmo/framekit exec vitest run scripts/styles-contract.test.ts
pnpm --filter @mauriciodmo/framekit test
pnpm --filter @mauriciodmo/framekit typecheck
pnpm --filter @mauriciodmo/framekit build
pnpm --filter studio test
pnpm --filter studio typecheck
pnpm --filter studio build
pnpm lint
pnpm test
pnpm typecheck
pnpm build
git diff --check
```

Inspect the generated `packages/framekit/dist/styles.css` after the package
build. It must contain the 15 numeric palette variables, no `--fk-*` semantic
role aliases, and no `--shadow-fk-*` registrations. Check Studio at desktop and
mobile widths in both themes, including controls, navigation, states, settings,
preview, and metadata dialog. Confirm authored template and brand colors are
unchanged.
