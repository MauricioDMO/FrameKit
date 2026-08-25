# Issue #5 — Semantic fields

- **GitHub issue:** [#5](https://github.com/MauricioDMO/FrameKit/issues/5)
- **Status:** Planned; implement first in the field-contract sequence.
- **Related plans:** [#6 choice](./issue-06-choice-field.md), [#7 boolean](./issue-07-boolean-field.md), [#8 number](./issue-08-number-field.md), [#9 typed data pipeline](./issue-09-typed-data-pipeline.md)

## Objective

Make the public field API singular and semantic. Remove the duplicate textarea
kind while keeping multiline editing as the behavior of `field.text`.

## Current baseline

- The package exports a plural `fields` namespace containing `text`,
  `textarea`, `color`, `number`, and `image`.
- `TemplateFieldKind` and `FieldDescriptor` include `textarea`; text and
  textarea have separate editor components.
- `field.number` currently stores `defaultValue` as a string and the editor
  treats field data as strings. Number semantics are finalized by #8 and #9.
- The current starter uses `fields.text` and `fields.image`.
- Image descriptors, asset manifests, image upload behavior, and image
  precedence are already established and are not redesigned here.

## Exact public contract

Use the singular namespace and keep the template property named `fields`:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

fields: {
  title: field.text({
    label: 'Title',
    placeholder: 'Write a title',
    defaultValue: 'Hello',
    minLength: 1,
    maxLength: 80,
  }),
}
```

- The root package exports `field`, not `fields`; the field barrel must likewise
  expose only the singular `field` binding. `fields` is removed everywhere
  without an alias or compatibility shim.
- After this issue the canonical kinds are `text`, `number`, `color`, and
  `image`. `choice` is added by #6 and `boolean` by #7.
- `field.text` accepts the existing text options plus `minLength` and
  `maxLength` text constraints. It always renders the current textarea UI and
  accepts newline characters.
- `textarea`, `TextareaFieldDescriptor`, and `field.textarea` are removed.
- Do not add `control`, `multiline`, `url`, `markdown`, or a separate
  normalization layer.
- Preserve `field.color` and `field.image` behavior, including image scope and
  asset resolution. Unified stable data errors are finalized by #9.

## Ordered implementation steps

1. Update the field factories, descriptor exports, `TemplateFieldKind`, and
   `FieldDescriptor` to expose `field` and remove the textarea symbols. Replace
   the plural binding in the field barrel and remove the plural root export;
   retain no `fields` alias.
2. Add `minLength` and `maxLength` to the text descriptor and validate that
   they are finite non-negative integers with `minLength <= maxLength`.
   Reject those options on non-text fields.
3. Replace the text/textarea editor split with one text editor backed by a
   native `<textarea>`. Pass through `minLength` and `maxLength`, and preserve
   labels, placeholders, required state, accessibility attributes, and the
   current field error placement.
4. Update editor field mapping and state types so a text edit remains a
   string, including newlines. Do not convert text values or introduce a
   generic control registry.
5. Enforce `minLength` and `maxLength` at the current data-validation boundary
   as machine-readable text-length errors, without trimming or normalizing the
   submitted text before measuring it; leave final error-union integration to
   #9.
6. Update the existing starter template to import `field`, use the new text
   API, and include one newline/length-constrained text example. Regenerate
   generated starter output with the repository generator; never hand-edit
   generated output.
7. Remove all old public names and update in-scope tests and fixtures to use
   the singular namespace. Keep later choice, boolean, and final number
   behavior out of this issue except where required for the shared type shape.

## Documentation and migration

Update the English and Spanish public field/API documentation:

- `Docs/en/reference/template-contract.md`
- `Docs/es/reference/template-contract.md`
- `Docs/en/reference/public-api.md`
- `Docs/es/reference/public-api.md`
- `Docs/en/guides/template-authoring.md`
- `Docs/es/guides/template-authoring.md`

Add an `Unreleased` entry to `CHANGELOG.md` and document the breaking rename,
textarea removal, newline behavior, and text length constraints in:

- `Docs/en/getting-started/migration-next.md`
- `Docs/es/getting-started/migration-next.md`

The migration must explicitly say that there is no `fields` compatibility
alias and that the template definition property remains `fields`.

## Verification

- Run focused field, definition-validation, editor, and type-level tests.
- Assert the singular factory export, absence of the plural/textarea API, and
  rejection of invalid text length descriptors.
- Assert that text preserves newlines and that `minLength`/`maxLength` errors
  are reported without affecting image behavior.
- Run the starter generation/check flow and verify the generated starter
  compiles.
- Run `pnpm --filter @mauriciodmo/framekit lint`, `test`, and `typecheck`.

## Completion / Definition of Done

- [ ] The implementation and tests link back to [issue #5](https://github.com/MauricioDMO/FrameKit/issues/5) and this [plan](./issue-05-semantic-fields.md).
- [ ] English and Spanish public docs are updated.
- [ ] `CHANGELOG.md` has an `Unreleased` entry.
- [ ] English and Spanish `migration-next` docs explain the breaking migration.
- [ ] Tests cover the public contract, validation, editor behavior, and types.
- [ ] The starter template and generated starter are updated and verified.
- [ ] No compatibility alias or unrequested control/format abstraction exists.

## Out of scope

- Adding `choice` or `boolean` (see #6 and #7).
- Final numeric typing, slider behavior, or the unified resolver (see #8 and
  #9).
- Generic controls, multiline/format options, URL or Markdown field kinds.
- Image/assets redesign, new asset metadata, or GitHub issue changes.
