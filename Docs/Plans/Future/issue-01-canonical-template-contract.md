# Issue #1 — Canonical Template Contract

- **GitHub issue:** https://github.com/MauricioDMO/FrameKit/issues/1
- **Status:** Active; GitHub issue state is authoritative.
- **Release:** No version preselected.

## Objective

Define one versionless, public template contract that the current Studio can
consume now and a future server rendering API can consume without a second
template format or Studio-specific assumptions.

## Current baseline

- `defineTemplate` and `defineTemplateBase` validate a definition containing
  `width`, `height`, `fields`, and `content`; the complete definition also has
  `render` (`packages/framekit/src/core/define-template.ts`).
- `TemplateRenderProps` currently passes `data`, `assets`, `locale`, `width`,
  and `height` (`packages/framekit/src/types.ts`).
- `resolveTemplateData` applies field defaults, content values, user edits,
  and then image assets (`packages/framekit/src/core/resolve-template-data.ts`).
- Definition validation is shared by the public helpers and the `check` CLI;
  Studio currently adapts the definition through the editor state and
  `FrameKitEditor`.
- Generated template modules carry filesystem-derived `slug`, `title`,
  `segments`, and asset manifests. Metadata consumption is intentionally left
  to #12/#13.

## Agreed public contract

The canonical definition is a typed object with these responsibilities:

```tsx
export default defineTemplate({
  meta: { title: 'Required template title' },
  width: 1200,
  height: 630,
  fields: { /* field descriptors */ },
  variants: { default: 'en', labels: { en: 'English' } },
  content: { en: { /* field values only */ } },
  render({ data, assets, variant, width, height }) { /* ReactNode */ },
})
```

The exact `meta` rules belong to #3 and the exact variant rules belong to #4.
The shared contract is:

- `width` and `height` are positive finite integers.
- `fields` declares the editable field keys. Resolved field data is a record
  of strings, including for number and image fields.
- `content` supplies variant-specific field values; resolution is deterministic
  for the same definition, selected variant, edits, and assets.
- `render` receives only render inputs (`data`, `assets`, `variant`, `width`,
  and `height`) and returns a React node. It must not require Studio state or
  browser-only editor APIs, so the same definition can be passed to a future
  server renderer.
- `assets` remains the common/variant URL manifest already used by image
  fields. Image resolution and upload behavior are not redesigned here.
- `defineTemplateBase` exposes the same contract without `render`; the full
  definition adds `render` through `defineTemplate`.
- There is no template version property, implicit alternate format, or
  compatibility alias in the canonical contract.

## Ordered implementation steps

1. Freeze the public shape and responsibility boundaries in
   `packages/framekit/src/types.ts`, `packages/framekit/src/core/define-template.ts`,
   and the core validation exports. Keep the core independent of editor and
   Studio modules.
2. Make definition validation and data resolution enforce the same contract
   used by `defineTemplate`, `defineTemplateBase`, `framekit check`, Studio,
   and future server callers. Keep malformed definitions and unknown data
   keys actionable errors.
3. Update the editor adapter, code generation types, and starter template to
   consume the canonical shape. Do not create a parallel Studio-only shape.
4. Update type tests and runtime tests for valid definitions, rejected
   definitions, deterministic resolution, render props, and the preserved
   asset precedence.
5. Apply the shared Definition of Done below, including both language docs,
   the rolling migration guides, changelog entry, generated starter/example,
   and links to this plan and issue #1.

## Documentation and migration requirements

Update the English and Spanish public template-contract/API/authoring docs to
show the canonical shape and to state that it is versionless and usable by
Studio and future server rendering. Record the migration impact in the
rolling guides; if a particular part of the implementation is additive, say
so explicitly rather than implying a migration.

## Verification

- `pnpm --filter @mauriciodmo/framekit test`
- `pnpm --filter @mauriciodmo/framekit typecheck`
- `pnpm --filter @mauriciodmo/framekit build`
- `pnpm test`, `pnpm typecheck`, and `pnpm build`
- `pnpm check:runtime`
- Run `framekit check` against the generated starter and verify Studio still
  renders and exports a current template with common and variant assets.

## Completion criteria

- One typed and runtime-validated definition shape is used by current Studio,
  the CLI/check path, generated starter templates, and the future-renderer
  boundary.
- No editor-only contract or versioned template format is introduced.
- Tests cover the contract and its failure cases.
- The shared Definition of Done is complete and the issue/plan links are
  present.

## Shared Definition of Done

For this active issue: code implementation, tests, English and Spanish public docs,
root `CHANGELOG.md` under `Unreleased`, rolling English and Spanish
`migration-next.md` guides (with an explicit no-migration note for additive
changes), generated starter/examples, and plan/issue links are all required.

## Out of scope

- Implementing a server rendering API or choosing its release version.
- Registry summary changes or Studio metadata catalog behavior; those belong
  to #12/#13.
- Redesigning image fields, asset discovery, upload behavior, or asset
  precedence.
- Compatibility aliases or a second template format.
