# Issue #4 — Content Variants

- **GitHub issue:** https://github.com/MauricioDMO/FrameKit/issues/4
- **Status:** Active; GitHub issue state is authoritative.
- **Release:** No version preselected.

## Objective

Replace the current locale/language-shaped content contract with an explicit
variant contract that supports language, campaign, channel, or any other
variant meaning without compatibility aliases.

## Current baseline

- `TemplateContentEntry` requires a `language` property and permits field
  values beside it (`packages/framekit/src/types.ts`).
- Render props and resolver parameters call the selected key `locale`;
  `getLocales` returns `Object.keys(definition.content)`.
- Definition validation requires `content.<key>.language` and excludes that
  key from resolved data.
- Editor controls display `contentEntry.language`; editor state stores a
  selected locale and uses `framekit:<slug>:v1` in localStorage.
- Asset resolution already separates `assets.common` and
  `assets.variants[locale]`, with variant assets taking precedence over common
  assets for variant-scoped image fields.

## Agreed public contract

The canonical shape is:

```tsx
export default defineTemplate({
  variants: {
    default: 'en',
    labels: {
      en: 'English',
      es: 'Español',
    },
  },
  content: {
    en: { title: 'Hello' },
    es: { title: 'Hola' },
  },
  render({ data, assets, variant, width, height }) { /* ... */ },
})
```

Rules:

- `variants` contains only the required `default` property and the optional
  `labels` property; `variants.mode` and any other variant metadata are invalid.
- `variants.default` is required and must name a key in `content`.
- `variants.labels` is optional. When present, it maps known content variant
  keys to display strings; it must not introduce unknown variant keys.
- Each `content` entry contains only field values. `language` and any other
  entry metadata are invalid. Values are strings and keys must be declared
  fields.
- Variant keys remain arbitrary strings. A requested variant that is not in
  `content`, an unknown default, or an unknown label key is an error; do not
  silently fall back to another variant.
- The selected render prop is named `variant`. There is no `locale`,
  `language`, `variants.mode`, alias, or compatibility shape.
- The public helper for enumerating content keys is `getVariants`; the old
  `getLocales` name is not retained as an alias.
- Update all current consumers atomically: public types, validation, data
  resolution, editor state/UI, exported helper names and parameters, codegen
  consumers, tests, and current templates must agree in one change.
- Increment the current editor persistence schema/key from `v1` to `v2` and
  read only the new key. Old localStorage is invalidated, not migrated.
- Preserve image behavior exactly: common assets remain common, variant assets
  remain keyed by the selected variant, variant-scoped assets still win over
  common assets, and public/root-relative image behavior is unchanged.
- Registry summaries remain owned by #12; this issue does not add variant
  summaries or catalog metadata.

## Ordered implementation steps

1. Add the `variants` type and replace locale-shaped render/content types in
   `packages/framekit/src/types.ts`. Rename the public helper/parameter surface
   as needed (for example, `getLocales` to `getVariants`) rather than keeping
   aliases.
2. Update definition validation to require `variants.default`, validate the
   optional labels map, reject `language`/other content metadata, reject
   unknown field keys, and reject unknown requested/default/label variants.
3. Update resolution and all editor consumers to use `variant`; rename
   locale-named state, actions, and UI props such as `selectedLocale`,
   `dataByLocale`, and `changeLocale` rather than retaining aliases. Make an
   unknown variant fail instead of resolving defaults for an invalid key. Use
   `variants.default` for initial selection and `variants.labels` for option
   labels.
4. Change editor persistence to exactly `framekit:<slug>:v2` and remove any
   read path for `v1`. Add a test that a valid old `v1` payload is ignored
   rather than transformed.
5. Update codegen-facing types, CLI/check paths, and every current
   template/example in the implementation scope in one atomic change. Keep
   `TemplateAssetManifest` and image discovery/resolution paths unchanged
   except for the selected-key rename.
6. Add type and runtime tests for defaults, labels, field-only content,
   unknown variants, render props, editor selection, persistence invalidation,
   and common/variant asset precedence.
7. Apply the shared Definition of Done below, including English and Spanish
   docs, rolling migration guides, changelog, generated starter output, and
   plan/issue links.

## Documentation and migration requirements

Update English and Spanish public API, template-authoring, and template
contract docs to use `variant`, `variants.default`, optional
`variants.labels`, and field-only content entries. Remove examples and prose
that present `locale` or `language` as the template contract. The rolling
migration guides must describe the breaking rename, removal of entry-level
`language`, addition of `variants.default`, optional labels, unknown-variant
errors, and the fact that old localStorage is discarded rather than migrated.

## Verification

- `pnpm --filter @mauriciodmo/framekit test`
- `pnpm --filter @mauriciodmo/framekit typecheck`
- `pnpm --filter @mauriciodmo/framekit build`
- `pnpm test`, `pnpm typecheck`, and `pnpm build`
- `pnpm check:runtime`
- Run `framekit check` on the generated starter.
- Exercise Studio with the default variant, a labeled variant, an unknown
  variant, a common image, and a variant image; confirm the old `v1` local
  storage entry is not loaded.

## Completion criteria

- All current consumers use the exact variant contract with no locale,
  language, mode, alias, or compatibility path.
- Invalid or unknown variants fail explicitly.
- Existing image and asset behavior is unchanged.
- The localStorage schema/key is incremented and old state is discarded, not
  migrated.
- Registry summaries remain deferred to #12.
- Tests, both public-language docs, migration/changelog records, generated
  starter output, and links satisfy the shared Definition of Done.

## Shared Definition of Done

For this active issue: code implementation, tests, English and Spanish public docs,
root `CHANGELOG.md` under `Unreleased`, rolling English and Spanish
`migration-next.md` guides, generated starter output, and plan/issue links
are required. The migration guides must include the explicit breaking-change
steps and localStorage invalidation; the no-migration note applies only to an
additive change.

## Out of scope

- `variants.mode`, `locale`, `language`, aliases, or compatibility support.
- Registry summaries or Studio metadata consumption; registry work remains in
  #12/#13 as applicable.
- Migrating old localStorage data.
- Redesigning image fields, asset discovery, upload behavior, or precedence.
- Server rendering implementation or release-version selection.
