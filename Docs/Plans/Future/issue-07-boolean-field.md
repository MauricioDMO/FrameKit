# Issue #7 — Boolean field

- **GitHub issue:** [#7](https://github.com/MauricioDMO/FrameKit/issues/7)
- **Status:** Planned; depends on #5 and precedes the final pipeline in #9.
- **Related plans:** [#5 semantic fields](./issue-05-semantic-fields.md), [#6 choice](./issue-06-choice-field.md), [#8 number](./issue-08-number-field.md), [#9 typed data pipeline](./issue-09-typed-data-pipeline.md)

## Objective

Represent binary decisions as real booleans from template definition through
content, overrides, Studio, and rendering.

## Current baseline

- There is no boolean kind or factory. `TemplateFieldKind` has only text,
  textarea, number, color, and image.
- Base descriptors use optional string `defaultValue`; content and editor
  state are string-oriented.
- Studio has no checkbox field and `FrameKitEditor` resolves/render data as a
  string record.
- The starter has no boolean example.

## Exact public contract

```tsx
import { field } from '@mauriciodmo/framekit'

showLogo: field.boolean({
  label: 'Show logo',
  defaultValue: true,
})
```

- `defaultValue?: boolean`; omitted `defaultValue` means `false`.
- Boolean has no `required`, `control`, or coercion behavior.
- Content values, editor overrides, resolved data, and `render` props are
  booleans. `true`, `false`, `'true'`, and `'false'` are not interchangeable;
  wrong runtime types return `{ code: 'invalid_boolean' }`.
- Studio always uses a native `<input type="checkbox">`. Its checked state
  and change event are boolean values.
- A missing boolean value resolves to the descriptor default (`false` when
  omitted), not to an empty string or a truthy/falsy conversion.

## Ordered implementation steps

1. Add `BooleanFieldDescriptor`, the `boolean` kind, and `field.boolean`;
   exclude string-only base options that would undermine the contract.
2. Extend template content, override, inferred-data, and render-prop types so
   boolean fields are boolean at every public boundary. Do not add a coercion
   helper.
3. Validate boolean defaults and runtime values by type. Report
   `invalid_boolean` for a wrong type and do not silently replace it with the
   default.
4. Add the Studio checkbox component with an accessible label, checked value,
   keyboard behavior, and error state. Update editor state callbacks to emit a
   boolean for this field while preserving text edits as strings.
5. Ensure preview/render receives the boolean and that persisted overrides do
   not become stringified booleans. Preserve the last valid preview behavior
   when the unified result is introduced in #9.
6. Add a boolean example to the starter template, regenerate generated starter
   output, and update type/runtime fixtures.

## Documentation and migration

Update the English and Spanish versions of:

- `Docs/en/reference/template-contract.md`
- `Docs/es/reference/template-contract.md`
- `Docs/en/reference/public-api.md`
- `Docs/es/reference/public-api.md`
- `Docs/en/guides/template-authoring.md`
- `Docs/es/guides/template-authoring.md`

Record the new kind and the breaking string-to-boolean boundary in the
`Unreleased` section of `CHANGELOG.md`. Add the migration instructions and
`invalid_boolean` example to:

- `Docs/en/getting-started/migration-next.md`
- `Docs/es/getting-started/migration-next.md`

The migration must tell authors to use a choice field for tri-state values and
must not recommend `'true'`/`'false'` strings.

## Verification

- Test default false, explicit true/false, and rejection of non-boolean
  defaults and runtime values.
- Test content and overrides preserve booleans through resolution, local
  persistence, editor callbacks, and render props.
- Test native checkbox accessibility and keyboard interaction in the Studio.
- Test the starter template and generated starter typecheck and render.
- Run `pnpm --filter @mauriciodmo/framekit lint`, `test`, and `typecheck`.

## Completion / Definition of Done

- [ ] The implementation and tests link to [issue #7](https://github.com/MauricioDMO/FrameKit/issues/7) and this [plan](./issue-07-boolean-field.md).
- [ ] English and Spanish public docs are updated.
- [ ] `CHANGELOG.md` contains the `Unreleased` entry.
- [ ] English and Spanish `migration-next` docs explain the typed migration.
- [ ] Tests cover factory/defaults, runtime rejection, editor behavior, persistence, and types.
- [ ] The starter template and generated starter demonstrate a boolean field.
- [ ] No required flag, control abstraction, coercion, compatibility alias, or tri-state behavior is added.

## Out of scope

- Switch controls or any second boolean UI beyond the native checkbox.
- Tri-state values, choice aliases, numeric fields, image/assets changes, or
  GitHub issue edits.
