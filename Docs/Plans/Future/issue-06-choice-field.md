# Issue #6 — Choice field

- **GitHub issue:** [#6](https://github.com/MauricioDMO/FrameKit/issues/6)
- **Status:** Planned; depends on #5 and precedes #9.
- **Related plans:** [#5 semantic fields](./issue-05-semantic-fields.md), [#7 boolean](./issue-07-boolean-field.md), [#8 number](./issue-08-number-field.md), [#9 typed data pipeline](./issue-09-typed-data-pipeline.md)

## Objective

Add a closed-set string field with deterministic definition and runtime
validation, edited with a native Studio select.

## Current baseline

- The public API currently has no choice factory or `choice` kind.
- Content entries and editor overrides are modeled as strings, and existing
  validation only handles required text, numeric strings, and colors.
- Studio renders the current field registry but has no choice component.
- The starter has text and image fields only.

## Exact public contract

```tsx
import { field } from '@mauriciodmo/framekit'

alignment: field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  defaultValue: 'center',
})
```

- `options` is a non-empty ordered array of objects with non-empty string
  `value` and `label` properties. Values must be unique; order is preserved
  in the UI.
- `defaultValue` is required and must equal one of the option values.
- Choice has no `required`, `control`, or implicit coercion option.
- Studio always uses a native `<select>`. Do not add radio, segmented,
  swatches, or preview metadata.
- Runtime content and overrides must be strings from the declared option set.
  An unknown value returns the stable machine-readable error
  `{ code: 'invalid_choice' }`.
- Literal-union inference for option values may be completed by #9; the
  runtime contract remains a string closed over the declared values.

## Ordered implementation steps

1. Add `ChoiceFieldDescriptor`, the `choice` kind, and `field.choice` with
   frozen ordered options and a required default value. Preserve literal
   option values in the type where inference supports them.
2. Extend definition validation to reject empty options, empty labels/values,
   duplicate values, and defaults not present in the option list. Reject
   unsupported `required` and `control` properties on choice descriptors.
3. Extend data resolution/validation at the current pipeline boundary to
   reject values outside the declared set with `invalid_choice`; never select
   the first option as a recovery value and never coerce values.
4. Add the Studio choice field component as a native select with an option per
   descriptor entry, preserving keyboard navigation, labels, accessibility
   wiring, and field error rendering. Do not add a `required` descriptor
   option or required-field behavior; the valid default makes the select
   initialized instead.
5. Thread the choice value through editor state and the renderer as the
   selected string. Keep the final typed inference work coordinated with #9.
6. Add a choice example to the starter template, regenerate generated starter
   output, and update relevant fixtures without manually editing generated
   files.

## Documentation and migration

Update both language versions of the public contract, API reference, and
authoring guide:

- `Docs/en/reference/template-contract.md` and
  `Docs/es/reference/template-contract.md`
- `Docs/en/reference/public-api.md` and `Docs/es/reference/public-api.md`
- `Docs/en/guides/template-authoring.md` and
  `Docs/es/guides/template-authoring.md`

Add the feature to the `Unreleased` section of `CHANGELOG.md`. Add English and
Spanish entries to `Docs/en/getting-started/migration-next.md` and
`Docs/es/getting-started/migration-next.md`, including the required default,
ordered options, and `invalid_choice` behavior.

## Verification

- Test factory shape, option order, duplicate/empty options, and invalid
  defaults in definition validation.
- Test valid choice values, unknown values, unknown fields, and no coercion in
  data tests.
- Test native select rendering, option order, keyboard selection, and error
  accessibility in editor tests.
- Test the starter example and generated starter compilation.
- Run `pnpm --filter @mauriciodmo/framekit lint`, `test`, and `typecheck`.

## Completion / Definition of Done

- [ ] The implementation and tests link to [issue #6](https://github.com/MauricioDMO/FrameKit/issues/6) and this [plan](./issue-06-choice-field.md).
- [ ] English and Spanish public docs are updated.
- [ ] `CHANGELOG.md` contains the `Unreleased` entry.
- [ ] English and Spanish `migration-next` docs cover adoption and errors.
- [ ] Tests cover descriptor validation, runtime behavior, Studio select behavior, and types.
- [ ] The starter/example and generated starter demonstrate a choice field.
- [ ] No compatibility API, generic control abstraction, or alternate choice UI is added.

## Out of scope

- Radio, segmented, swatch, or preview controls.
- Dynamic options, option groups, or external option loading.
- Boolean fields, number controls, image redesign, or GitHub issue edits.
