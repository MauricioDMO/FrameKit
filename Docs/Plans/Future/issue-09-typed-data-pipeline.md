# Issue #9 — Typed data pipeline

- **GitHub issue:** [#9](https://github.com/MauricioDMO/FrameKit/issues/9)
- **Status:** Planned; final integration after #5–#8.
- **Related plans:** [#5 semantic fields](./issue-05-semantic-fields.md), [#6 choice](./issue-06-choice-field.md), [#7 boolean](./issue-07-boolean-field.md), [#8 number](./issue-08-number-field.md)

## Objective

Replace the separate string resolution and validation flow with one typed,
discriminated resolution result. Renderers receive only valid data, and Studio
keeps the last valid preview while an edit is invalid.

## Current baseline

- `resolveTemplateData(definition, locale, edits, assets?)` returns a raw
  `Record<string, string>` and silently ignores non-string locale/override
  values and unknown keys.
- Defaults, locale content, and edits are applied first; image assets are then
  applied with variant-before-common precedence for variant-scoped images and
  common-only precedence for common-scoped images.
- `validateTemplateData` is a separate pass over string data. Number
  validation parses numeric strings; the editor renders the raw resolved data
  before export validation.
- `InferTemplateData` currently maps every field to `string`, and the editor
  state persists string overrides.
- The current preview calls `definition.render` directly with the raw result;
  there is no unified invalid-result or last-valid-preview boundary.

## Exact public contract

`resolveTemplateData` remains the public entry point and keeps its current
argument order and image manifest argument, but returns a discriminated result:

```ts
type ResolveTemplateDataResult<Definition extends TemplateBase> =
  | { success: true; data: InferTemplateData<Definition> }
  | { success: false; errors: TemplateDataError[] }

type TemplateDataError = {
  code:
    | 'unknown_variant'
    | 'unknown_field'
    | 'required'
    | 'invalid_type'
    | 'invalid_choice'
    | 'invalid_boolean'
    | 'number_too_small'
    | 'number_too_large'
    | 'invalid_step'
    | 'text_too_short'
    | 'text_too_long'
    | 'invalid_color'
    | 'missing_image'
  field?: string
  variant?: string
  expected?: unknown
  received?: unknown
  constraint?: {
    min?: number
    max?: number
    step?: number
    minLength?: number
    maxLength?: number
  }
}
```

The pipeline infers and resolves these runtime values:

| Kind | Runtime value |
|---|---|
| `text` | `string` |
| `number` | finite `number` |
| `choice` | declared string literal union, or `string` when not inferable |
| `boolean` | `boolean` |
| `color` | `string` |
| `image` | resolved browser URL `string` |

The pipeline must:

- Apply precedence exactly as **override > variant content > default**.
- Preserve current image asset behavior: matching variant asset before common
  asset for variant scope, common asset for common scope, and all existing
  asset URL/upload behavior unchanged.
- Reject unknown field keys, unknown variants, wrong runtime types, and all
  coercion. After #4, content entries contain only field values.
- Return a `TemplateDataError[]` with stable machine-readable codes for
  `unknown_variant`, `unknown_field`, `required`, `invalid_type`,
  `invalid_choice`, `invalid_boolean`, `number_too_small`,
  `number_too_large`, `invalid_step`, `text_too_short`, `text_too_long`,
  `invalid_color`, and `missing_image` where applicable. Do not retain the old
  `invalid_number` code. Entries may carry `field`, `variant`, `expected`, and
  `received`, plus relevant `constraint` details; localized display text stays
  in Studio.
- Remove the separate resolve-then-validate data flow. Definition structure
  validation may remain, but data validity is decided by this result.
- Call `render` only with `result.data` from a successful result. Studio keeps
  the last successful data object for preview/export display when the newest
  edit produces `result.errors`.

## Ordered implementation steps

1. Define the field-to-value inference utilities in `packages/framekit/src/types.ts`,
   including choice literal preservation and the typed `TemplateRenderProps`,
   `InferTemplateData`, content, and override shapes.
2. Define the shared `TemplateDataError` union and the discriminated resolver
   result. Use stable codes and structured constraint details; do not expose
   localized messages from core.
3. Rewrite `resolveTemplateData` to validate the selected variant, field keys,
   defaults, content, and overrides while applying override/content/default
   precedence. Keep image manifest resolution as a final non-coercing source
   selection step with its existing precedence.
4. Fold current data checks and #5–#8 kind checks into the resolver. Remove
   raw string assumptions and the separate public data-validation path rather
   than maintaining parallel compatibility behavior.
5. Update `FrameKitEditor` and editor state to branch on success/failure:
   render only valid typed data, display translated field errors, preserve the
   last valid preview, and keep number drafts separate from committed values.
   Export/copy must use the same successful result boundary.
6. Update field components and editor callbacks to emit their declared types:
   text/color/image strings, choice strings, boolean booleans, and number
   numbers. Keep native controls and image upload behavior from earlier plans.
7. Update tests, the starter template, and generated starter artifacts to
   exercise every kind, precedence, unknown-key/variant rejection, typed
   inference, invalid preview recovery, and unchanged image asset behavior.

## Documentation and migration

Update the English and Spanish public documentation in:

- `Docs/en/reference/template-contract.md` and
  `Docs/es/reference/template-contract.md`
- `Docs/en/reference/public-api.md` and `Docs/es/reference/public-api.md`
- `Docs/en/guides/template-authoring.md` and
  `Docs/es/guides/template-authoring.md`

Add an `Unreleased` changelog entry to `CHANGELOG.md`. Add a complete
English/Spanish migration-next section in:

- `Docs/en/getting-started/migration-next.md`
- `Docs/es/getting-started/migration-next.md`

The migration must show the new discriminated return handling, typed render
data, rejection of coercion and unknown keys/variants, the last-valid-preview
rule, and the image precedence guarantee. It must link to [#5](https://github.com/MauricioDMO/FrameKit/issues/5), [#6](https://github.com/MauricioDMO/FrameKit/issues/6), [#7](https://github.com/MauricioDMO/FrameKit/issues/7), [#8](https://github.com/MauricioDMO/FrameKit/issues/8), and this [plan](./issue-09-typed-data-pipeline.md).

## Verification

- Add type-level tests for every field kind, choice literal unions, typed
  render props, and rejection of wrong content/override types.
- Add resolver tests for precedence, unknown fields/variants, every stable
  error family, no coercion, and the success/failure result shape.
- Add regression tests proving image variant/common precedence and asset
  behavior are unchanged.
- Add editor tests proving invalid edits do not reach `render`, the last valid
  preview remains visible, field errors are localized only at the UI boundary,
  and export uses valid data.
- Verify the starter template and generated starter output with generation,
  compilation, and runtime tests.
- Run `pnpm --filter @mauriciodmo/framekit lint`, `test`, and `typecheck`,
  followed by the repository checks when practical.

## Completion / Definition of Done

- [ ] The implementation and tests link to [issue #9](https://github.com/MauricioDMO/FrameKit/issues/9), all dependent issue links, and this [plan](./issue-09-typed-data-pipeline.md).
- [ ] English and Spanish public docs are updated.
- [ ] `CHANGELOG.md` contains the `Unreleased` entry.
- [ ] English and Spanish `migration-next` docs explain the result contract and typed migration.
- [ ] Tests cover inference, resolution, errors, precedence, editor recovery, export, and images.
- [ ] The starter template and generated starter exercise all six canonical kinds.
- [ ] Renderer input is always valid typed data; no compatibility resolver,
  coercion, or parallel resolve/validate path remains.

## Out of scope

- Redesigning image fields, assets, upload storage, or asset manifests.
- New field kinds, generic control abstractions, or alternate Studio controls.
- Localized core errors, automatic migration/coercion, or GitHub issue edits.
