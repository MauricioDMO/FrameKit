# Issue #8 — Number field

- **GitHub issue:** [#8](https://github.com/MauricioDMO/FrameKit/issues/8)
- **Status:** Planned; depends on #5 and feeds the unified pipeline in #9.
- **Related plans:** [#5 semantic fields](./issue-05-semantic-fields.md), [#6 choice](./issue-06-choice-field.md), [#7 boolean](./issue-07-boolean-field.md), [#9 typed data pipeline](./issue-09-typed-data-pipeline.md)

## Objective

Make numeric fields real finite numbers with explicit constraints and two
focused native editing modes, without turning controls into field kinds.

## Current baseline

- `field.number` currently accepts an optional/string-shaped default and only
  `min`/`max`; resolved and editor data are strings.
- Studio always renders a native number input and has no slider mode.
- Current validation parses numeric strings, so numeric strings are accepted
  at runtime.
- The starter does not demonstrate a number field.

## Exact public contract

```tsx
import { field } from '@mauriciodmo/framekit'

opacity: field.number({
  label: 'Opacity',
  defaultValue: 100,
  min: 0,
  max: 100,
  step: 1,
  control: 'slider',
})
```

- `defaultValue` is required and must be a finite number. Number fields are
  therefore always present; there is no `required` option.
- `control?: 'input' | 'slider'`, defaulting to `input`. This is a
  kind-specific option, not a generic control abstraction.
- `min` and `max`, when supplied, are finite and `min <= max`.
- `step` is finite and positive and defaults to `1`. Values and defaults are
  validated against bounds and step using the native numeric/range semantics.
- `slider` requires explicit finite `min` and `max`, uses a native
  `<input type="range">`, displays the current value, and retains native
  keyboard behavior. `input` uses a native `<input type="number">`.
- Resolved number values are finite `number`s. Numeric strings are rejected;
  no numeric-string coercion is introduced.
- While an input is empty or temporarily malformed, its local draft is kept
  separate from committed numeric data. The renderer must not receive that
  draft; #9 defines the shared last-valid-preview behavior.

## Ordered implementation steps

1. Replace the number descriptor/factory signature with required numeric
   `defaultValue`, optional finite `min`, `max`, `step`, and the literal
   `control` union. Reject obsolete string defaults and `required`.
2. Extend definition validation for finite defaults and constraints,
   `min <= max`, finite positive step, and slider-only explicit bounds.
   Validate default/bound/step consistency before a template can render.
3. Change number content, override, inferred-data, and render-prop boundaries
   to use finite numbers. Reject numeric strings with stable numeric errors;
   do not call `Number()` as a coercion path.
4. Implement the input mode with a temporary draft separate from committed
   state. Commit only finite valid values; keep the draft visible during an
   incomplete edit and expose the validation error without poisoning preview
   data.
5. Implement slider mode with a native range input, visible value, min/max/
   step attributes, and native keyboard increment/decrement behavior. Keep
   the component-specific branch local to number fields.
6. Update editor state, persistence, preview, and export callers for numeric
   committed values, then add number examples for both input and slider to the
   starter and regenerate generated output.

## Documentation and migration

Update the English and Spanish contract, API, and authoring documentation:

- `Docs/en/reference/template-contract.md` and
  `Docs/es/reference/template-contract.md`
- `Docs/en/reference/public-api.md` and `Docs/es/reference/public-api.md`
- `Docs/en/guides/template-authoring.md` and
  `Docs/es/guides/template-authoring.md`

Add the number contract and the string-to-number breaking migration to
`CHANGELOG.md` under `Unreleased`, and to:

- `Docs/en/getting-started/migration-next.md`
- `Docs/es/getting-started/migration-next.md`

Document that slider bounds are mandatory, `step` defaults to `1`, drafts are
not render data, and numeric strings must be converted by authors before
adoption.

## Verification

- Test required finite numeric defaults, finite bounds, ordering, positive
  step, slider bounds, and rejection of numeric-string defaults.
- Test accepted/rejected number values, bounds, step errors, and no coercion.
- Test input drafts remain local while committed data and preview stay valid.
- Test slider attributes, displayed value, keyboard behavior, and accessible
  labeling.
- Test starter input/slider examples and generated starter compilation.
- Run `pnpm --filter @mauriciodmo/framekit lint`, `test`, and `typecheck`.

## Completion / Definition of Done

- [ ] The implementation and tests link to [issue #8](https://github.com/MauricioDMO/FrameKit/issues/8) and this [plan](./issue-08-number-field.md).
- [ ] English and Spanish public docs are updated.
- [ ] `CHANGELOG.md` contains the `Unreleased` entry.
- [ ] English and Spanish `migration-next` docs cover numeric migration and drafts.
- [ ] Tests cover descriptor/data validation, editor modes, persistence/preview, and types.
- [ ] The starter template and generated starter demonstrate input and slider modes.
- [ ] No generic control abstraction, unit option, numeric-string coercion, or compatibility code is added.

## Out of scope

- A `range` field kind, unit metadata, formatted-number field, or custom slider
  component.
- Numeric-string compatibility or automatic migration code.
- Image/assets redesign, boolean/choice UI changes, or GitHub issue edits.
