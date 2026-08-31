# Phase 2 - Definition Validation Split

## Status

- **Status:** Proposed; not yet implemented.
- **PR boundary:** One behavior-preserving refactor. Do not combine this phase
  with the editor orchestration split in Phase 3.
- **Public API:** No additions, removals, or renamed exports.

## Depends on

- **Sequencing dependency:** Phase 1 must be merged first, as promised by the
  ordered roadmap.
- **Code dependency:** None beyond the current definition validator, field
  descriptors, and public type contracts in this repository.
- Existing validation and generation/type fixtures listed below.

## Goal

Split the monolithic runtime definition validator into the smallest coherent
internal modules while leaving `definition.ts` as the stable composer and
facade. The split is organizational only: callers still use
`validateTemplateBase` and `validateTemplateDefinition`, and the validator
still returns the first error in the same order with the same exact message.

The resulting ownership should be obvious without creating public package
surface or one-line compatibility modules:

- metadata owns `meta` shape, keys, and values;
- dimensions owns `width` and `height` checks;
- fields owns the `fields` container guard, the reserved `language` key,
  descriptor shape, and per-kind constraints;
- variants owns the `variants` container guard, declaration, and label checks;
- composition owns the `content` container guard, emptiness, cross-references,
  content values, and numeric content constraints;
- `definition.ts` owns only the root object guard, unknown top-level properties,
  sequencing through the public facade, result narrowing, and the extra
  `render` check for full definitions.

## Current baseline

`packages/framekit/src/core/validation/definition.ts` currently contains the
plain-object guard, private `ValidationResult` union, top-level key set,
metadata validation, dimension validation, every field-kind branch, variant
validation, content/field cross-validation, and the final render-function
check. `validateTemplateDefinition` first calls `validateTemplateBase`, then
checks `render`; `validateTemplateBase` deliberately permits an absent
`render` property.

The current order is observable because each function returns one failure and
stops. `validateTemplateBase` is the public sequencing facade; its ownership
boundaries and nested order are:

1. root object and unknown top-level properties;
2. metadata container, unknown keys, title, description, marketing description,
   then tags and tag values;
3. width, then height;
4. fields container, reserved `language`, then descriptors in
   `Object.entries(def.fields)` order;
5. variants container, unknown keys, default, then labels and label values;
6. content container and emptiness, default/label membership, then content
   entries in `Object.keys(content)` order;
7. `render` is a function, but only for `validateTemplateDefinition`.

The public root entry point re-exports both definition validators from
`./core/validation`. `defineTemplateBase` and `defineTemplate` call them,
throwing `new Error(result.error)` on failure and returning the original
definition on success. Studio validates a loaded definition before rendering
through its current internal `../core/validation` import. The generated check
and summary sources import validation from the package root; the CLI check and
codegen summary paths must keep generating those same imports. The Studio
generation integration test also exercises the package-root import.

## Current-to-target file and symbol map

The target names below are implementation names, not new public entry points.
For the definition validators, the existing export path is
`definition.ts` → `validation/index.ts` → package-root `src/index.ts`; the
extracted helpers do not participate in it.

| Current file / symbols | Target file / symbols | Change and ownership |
|---|---|---|
| `core/validation/definition.ts`: `isPlainObject` | `core/validation/utils.ts`: `isPlainObject` | Move the shared plain-object predicate once; keep it internal and do not export it from the package root. |
| `core/validation/definition.ts`: `ValidationResult` | `core/validation/definition.ts`: `ValidationResult` | Keep the private discriminated union with the same `success`, `definition`, and `error` members so public declaration output and control-flow narrowing remain equivalent. |
| `definition.ts`: root guard and `DEFINITION_KEYS` | `definition.ts`: root guard and `DEFINITION_KEYS` | Keep root shape and top-level key ownership in the composer because it defines the complete definition contract, including the permitted `render` key. |
| `definition.ts`: `meta` guard, `META_KEYS`, metadata checks | `metadata.ts`: `META_KEYS`, `validateMetadata` | Move the `meta` container guard and all current metadata checks without changing their order or messages. The helper should return a failure message (or no failure), not a new public result type. |
| `definition.ts`: width/height checks | `dimensions.ts`: `validateDimensions` | Move width first and height second, including positive, finite, integer checks and exact messages. |
| `definition.ts`: `fields` guard, reserved-key check, `FIELD_KINDS`, field loop and per-kind branches | `fields.ts`: `FIELD_KINDS`, `validateFields` and private descriptor helpers | Move the `fields` container guard, `fields.language` diagnostic, and complete descriptor validation, including choice options, boolean restrictions, number limits/steps, text lengths, image scope, and cross-kind property rejection. Preserve field insertion order. |
| `definition.ts`: `variants` guard, `VARIANT_KEYS`, variant declaration and labels | `variants.ts`: `VARIANT_KEYS`, `validateVariants` | Move the `variants` container guard and all declaration-level checks: allowed keys, default string, labels shape, and label strings. Content membership checks stay in composition because they require `content`. |
| `definition.ts`: content shape, field-key set, default/label membership, value types, `validateNumberValue` mapping | `composition.ts`: `validateComposition` | Own the `content` container guard and emptiness check plus the relationships among `content`, `fields`, and already-validated variants. Preserve content insertion order and the current numeric error-message mapping. |
| `definition.ts`: `validateTemplateBase` | `definition.ts`: `validateTemplateBase` | Retain the public facade. It performs top-level checks, invokes helpers in the current sequence, short-circuits on the first message, and returns the original value narrowed to `TemplateBase`. |
| `definition.ts`: `validateTemplateDefinition` | `definition.ts`: `validateTemplateDefinition` | Retain the public facade. It calls `validateTemplateBase` first and checks `render` only after all base checks succeed. |
| `core/validation/data.ts`: `isValidColor`, `isValidNumberStep`, `validateNumberValue`, `validateTemplateData`, `TemplateDataValidationError` | `core/validation/data.ts`: same symbols | No definition-split move. `fields.ts` may continue using `isValidNumberStep`; `composition.ts` may continue using `validateNumberValue`. Data validation remains separate. `isValidColor` remains available from the existing internal validation barrel because the editor imports it there; `isValidNumberStep` and `validateNumberValue` remain data-module internals. |
| `core/validation/index.ts`: existing exports | `core/validation/index.ts`: same exports | Keep the exact export list and paths: definition validators, `isValidColor`, and `validateTemplateData` as values, plus `TemplateDataValidationError` as a type. For validation, the package root re-exports only `validateTemplateBase`, `validateTemplateData`, `validateTemplateDefinition`, and `TemplateDataValidationError`; do not expose helper modules or change either barrel. |
| `core/define-template.ts`: `defineTemplateBase`, `defineTemplate`, `assertValid` | Same file and symbols | No semantic change. The import may remain `./validation`; success returns and thrown error text must be unchanged. |
| `src/index.ts`: root validation/type/field exports | Same file and exports | No export change. In particular, preserve root imports of `validateTemplateBase`, `validateTemplateDefinition`, and `validateTemplateData`. |
| `src/types.ts`: `TemplateBase`, `TemplateDefinition`, `TemplateInput`, field/meta/variant types | Same file and types | No type-model change. Runtime splitting must not weaken or strengthen generic inference, `NoLanguageFields`, content narrowing, or render props. |
| `core/definition-validation.test.ts`: all current cases | `core/validation/definition.test.ts`, `metadata.test.ts`, `dimensions.test.ts`, `fields.test.ts`, `variants.test.ts`, `composition.test.ts` | Move cases by behavior as mapped below. Remove the monolithic file only after every case has a destination and the focused suite passes. |
| `tests/types/*.ts`: valid/rejection fixtures | Same fixture files | Retain all fixtures and their `@ts-expect-error` assertions. They are compile-time contracts, not candidates for runtime-test consolidation. |
| `apps/studio/src/test/framekit/generation.integration.test.ts` | Same file | Retain generated-loader and public-root validation coverage unchanged; it proves the split does not break the supported consumer path. |
| Existing indirect consumers/tests: `packages/framekit/src/cli/check.ts`, `packages/framekit/src/codegen/collect-template-summaries.ts`, `packages/framekit/src/core/data-validation.test.ts`, `packages/framekit/src/core/resolve-template-data.test.ts`, `packages/framekit/src/core/get-variants.test.ts`, and `packages/framekit/src/core/fields.test.ts` | Same files | Do not move or rewrite them. The CLI/codegen files generate package-root validation imports, while the package tests continue covering their existing owners and any `defineTemplate` setup. |

`utils.ts` is a real shared primitive used by multiple validators, not a
compatibility wrapper. No `metadata/index.ts`, `fields/index.ts`, or other
one-line forwarding files are needed.

## Current test-case destination map

The current test uses `validDefinition()` and imports
`validateTemplateDefinition` from the public root. Keep that fixture style
where it makes the current public behavior clearer; tests may use focused
local fixtures after the move. Every current case has one destination. The
new focused files must keep the helpers private: moved and characterization
tests exercise `validateTemplateBase` or `validateTemplateDefinition` through
the public root rather than exporting helpers solely to unit-test them.

| Current test cases in `definition-validation.test.ts` | Destination |
|---|---|
| `non-object definition`; `array definition`; `missing metadata`; `missing metadata title`; `empty metadata title`; `missing variants`; `unknown top-level property` | `validation/definition.test.ts` for top-level sequencing/facade failures. |
| `accepts optional metadata`; invalid `description`; invalid `marketingDescription`; invalid `tags`; invalid `tag value`; unsupported metadata properties `revision`, `status`, `keywords`, `order` | `validation/metadata.test.ts`. |
| Field cases `non-object descriptor`; `array descriptor`; `unknown kind`; `removed textarea kind`; `empty label`; `invalid placeholder`; `invalid required`; `invalid default` | `validation/fields.test.ts`. |
| Choice cases `empty choice options`; `non-object choice option`; `empty choice option value`; `empty choice option label`; `duplicate choice option values`; `missing choice default`; `unknown choice default`; `required on choice`; `control on choice` | `validation/fields.test.ts`. |
| Boolean cases `invalid boolean default`; `null boolean default`; `placeholder on boolean`; `required on boolean`; `control on boolean` | `validation/fields.test.ts`. |
| Cross-kind cases `control on text`; `step on text`; `limits on non-number`; `text lengths on non-text`; `scope on non-image` | `validation/fields.test.ts`. |
| Number descriptor cases `missing number default`; `string number default`; `non-finite number default`; `required on number`; `invalid number control`; `non-finite minimum`; `non-finite maximum`; `reversed limits`; `non-finite step`; `non-positive step`; `slider without minimum`; `slider without maximum`; `default below minimum`; `default above maximum`; `default outside step` | `validation/fields.test.ts`. |
| Number factory cases `required`; `null step`; `null control` under `rejects number factory parameters` | `validation/fields.test.ts`; keep the `field.number(... as never)` construction because it verifies runtime validation of factory output. |
| `accepts a valid choice descriptor`; `accepts boolean descriptors and content values`; `accepts numeric descriptors and content values` | `validation/fields.test.ts` as positive descriptor coverage. Keep enough content in each fixture to prove the descriptor can be composed. |
| Text cases `non-finite minimum length`; `negative minimum length`; `fractional maximum length`; `reversed text lengths` | `validation/fields.test.ts`. |
| Image cases `invalid image scope` | `validation/fields.test.ts`. |
| `below minimum`; `above maximum`; `outside step`; `outside step at a large magnitude` under `rejects numeric content` | `validation/composition.test.ts`; retain the large-magnitude case to protect the `validateNumberValue` integration and exact `content.en.count` messages. |
| Decimal `width`; decimal `height` | `validation/dimensions.test.ts`. |
| Missing render function | `validation/definition.test.ts`; it must remain after all base checks. |
| `empty content`; `unknown content key`; `content metadata`; `string boolean content`; `numeric boolean content`; `string number content`; `non-finite number content` | `validation/composition.test.ts`. |
| `unsupported variant property` | `validation/variants.test.ts`. |
| `unknown default variant`; `unknown variant label` | `validation/composition.test.ts`; these are content-membership checks that require the already-validated `content` object. |
| Invalid variant labels `non-object labels`; `non-string label` | `validation/variants.test.ts`. |

The `unknown default variant` and `unknown variant label` cases must still run
after declaration-level `variants` checks and before content entry validation,
as they do now. The composition tests should exercise the public composer (or
an explicitly documented helper contract) rather than silently testing a
different order.

Add only the small characterization cases that the current monolith lacks:

- `validateTemplateBase` accepts a valid base without a `render` function and
  returns the same definition object;
- `validateTemplateDefinition` reports the base error before a missing or
  invalid `render` function when both are wrong;
- the `fields` container rejects a non-object value and the reserved
  `fields.language` key with their current exact messages;
- choice and boolean descriptors reject `step`, and an image descriptor rejects
  `min` or `max`, preserving the currently uncharacterized kind-specific paths;
- `variants.default` rejects an empty or non-string value before composition;
- `content` rejects a non-object container and a non-object variant entry with
  their current exact messages; and
- representative simultaneous failures prove root → metadata → dimensions →
  fields → variants → composition ordering.

Do not duplicate every case in every helper. The moved cases retain the exact
error assertions; new tests cover these previously uncharacterized boundaries
and the facade order only.

## Implementation steps

1. **Capture the baseline.** Phase 1 is a sequencing prerequisite, so capture
    the baseline after its shared formatting check exists. Run the shared clean
    install/runtime checks first, then the current monolithic definition and data
    tests, package typecheck/build, and Studio generation integration test. Build
    FrameKit before the Studio test because Studio consumes the package build.
    From the repository root, the baseline commands are:

   ```sh
   pnpm install --frozen-lockfile
   pnpm format:check
   pnpm check:runtime
   pnpm --filter @mauriciodmo/framekit exec vitest run \
     src/core/definition-validation.test.ts \
     src/core/data-validation.test.ts
   pnpm --filter @mauriciodmo/framekit typecheck
   pnpm --filter @mauriciodmo/framekit build
   pnpm --filter studio test -- src/test/framekit/generation.integration.test.ts
   ```

   Record the current test count if useful for review, but do not alter
   behavior to make a count stable.
2. **Add the shared object guard.** Create `validation/utils.ts` with the
   current `isPlainObject` semantics, including acceptance of
   `Object.create(null)` and rejection of arrays, `null`, and non-objects.
   Keep the helper internal.
3. **Extract metadata and dimensions.** Move the `meta` container guard and
   current metadata checks verbatim into `metadata.ts`, and the dimension checks
   into `dimensions.ts`. Helpers should report only the first message for their
   responsibility; `definition.ts` remains responsible for converting a message
   into `{ success: false, error }`.
4. **Extract fields as one coherent validator.** Move the `fields` container
   guard, reserved-key check, `FIELD_KINDS`, field loop, and all per-kind checks
   together. Keep choice option duplicate detection, number default/range/step
   checks, text length checks, image scope checks, and the current ordering of
   generic versus kind-specific property checks. Import `isValidNumberStep` from
   `data.ts` rather than reimplementing numeric arithmetic.
5. **Extract variants.** Move the `variants` container guard, `VARIANT_KEYS`,
   declaration shape checks, default validation, labels shape, and label value
   validation into `variants.ts`.
   Do not move content membership checks into this helper because their
   current position depends on `content` validation.
6. **Extract composition.** Move the `content` container and emptiness checks,
   the field-key set, default and label membership checks, entry object checks,
   field value type checks, and the `validateNumberValue` error-code-to-message
   mapping into `composition.ts`. Pass already-validated fields and variants
   rather than validating them a second time.
7. **Rebuild the facade in the current order.** Keep `ValidationResult`, the
   root object guard, top-level unknown-key loop, and both exported functions in
   `definition.ts`.
   Invoke the new helpers in the exact baseline sequence and stop immediately
   on the first returned message. Keep the final render check solely in
   `validateTemplateDefinition`.
8. **Keep public wiring stable.** Leave `validation/index.ts`,
   `define-template.ts`, `src/index.ts`, and `types.ts` semantically unchanged.
    Do not export helper functions through `validation/index.ts` or `src/index.ts`,
    and do not add a new package subpath. Confirm `defineTemplateBase` and
    `defineTemplate` still return the input object and throw the same `Error`
    message.
9. **Move and tighten tests.** Move every case using the destination map,
    preserve exact messages, and add only the boundary/facade/order cases listed
    above. Retain all type fixtures and the Studio generation integration test.
10. **Review the diff for accidental contract changes.** Check generated
    declaration output, root exports, import paths, error strings, helper
    sequencing, and that no source/test outside the permitted scope changed.

## Behavior and public API invariants

- `validateTemplateBase` and `validateTemplateDefinition` remain root exports
  with the same names and call signatures.
- `validateTemplateBase` continues to accept a valid definition without a
  `render` function; `validateTemplateDefinition` continues to require
  `typeof render === 'function'` only after base validation succeeds.
- The success/failure union remains discriminated by `success`; a successful
  result narrows to a `TemplateBase` or `TemplateDefinition`, and a failure
  exposes only the same string `error` contract.
- Validation is first-error-only. `Object.keys`/`Object.entries` insertion
  order, field order, content order, and all current short-circuit points stay
  unchanged.
- Every current error string remains byte-for-byte identical, including
  property paths, quoted keys, capitalization, and number wording.
- The validator does not clone, freeze, normalize, mutate, or otherwise alter
  the supplied definition.
- `defineTemplateBase` and `defineTemplate` continue to return the original
  definition after validation and throw `new Error(result.error)` on failure.
- Number defaults and content values continue to use the existing
  `isValidNumberStep`/`validateNumberValue` implementation, including its
  large-magnitude decimal behavior.
- `NoLanguageFields`, `NoUnknownMetaKeys`, `NoUnknownContentKeys`, generic
  field inference, `TemplateRenderProps`, and all public types remain as-is.
- `packages/framekit/src/index.ts` and supported package subpaths expose no
  new internal validation module.
- Studio loaded-template validation keeps its current internal
  `../core/validation` import; generated check/summary sources and the
  generation integration test keep their current `@mauriciodmo/framekit` root
  import. No consumer switches to a private extracted helper.

## Focused tests

Run these first while implementing:

```sh
pnpm --filter @mauriciodmo/framekit exec vitest run \
  src/core/validation/definition.test.ts \
  src/core/validation/metadata.test.ts \
  src/core/validation/dimensions.test.ts \
  src/core/validation/fields.test.ts \
  src/core/validation/variants.test.ts \
  src/core/validation/composition.test.ts \
  src/core/data-validation.test.ts
pnpm --filter studio test -- src/test/framekit/generation.integration.test.ts
pnpm --filter @mauriciodmo/framekit typecheck
```

The moved definition tests must cover every row in the destination map. The
focused suite must additionally verify:

- each ownership's first failure and the facade's first-failure order, by
  calling the public validator(s) rather than exporting private helpers;
- the previously uncharacterized fields container/reserved-key, descriptor-kind,
  variants default, and composition container/entry branches listed above;
- exact metadata, dimension, descriptor, variant, and composition messages;
- a base definition with no render function versus a full definition with one;
- root imports of both validators;
- unchanged large-magnitude numeric content handling.

No snapshot suite is needed. Prefer direct result equality and small success
checks.

## Full commands

From the repository root, after the focused checks pass:

```sh
pnpm install --frozen-lockfile
pnpm format:check
pnpm check:runtime
pnpm --filter @mauriciodmo/framekit lint
pnpm --filter @mauriciodmo/framekit test
pnpm --filter @mauriciodmo/framekit typecheck
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm --filter studio lint
pnpm --filter studio test
pnpm --filter studio typecheck
pnpm --filter studio build
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @mauriciodmo/framekit pack --dry-run
pnpm --filter @mauriciodmo/create-framekit pack --dry-run
git diff --check
```

Studio test, typecheck, and build scripts may regenerate its generated registry
through the existing package scripts; lint does not. Do not hand-edit
generated files.

## Exit gate

Phase 2 is complete when:

- the monolithic definition validator has been split into coherent internal
  ownership for metadata, dimensions, fields, variants, and composition;
- `definition.ts` remains the stable composer/facade and no unnecessary
  forwarding files or public exports were added;
- every current definition-validation case has moved to a colocated behavior
  test with the same assertion, and the small facade/order additions pass;
- `validateTemplateBase`, `validateTemplateDefinition`, `defineTemplateBase`,
  `defineTemplate`, root exports, generic narrowing, and Studio/codegen
  consumers remain behaviorally compatible;
- focused tests, package lint/test/typecheck/build, Studio checks, and the
  repository-wide commands pass.

## Rollback and review guidance

### Rollback

Revert the single PR as one unit if any error string, ordering, declaration
output, root export, or consumer behavior changes. The safest rollback is to
restore `definition.ts` and the original monolithic test; do not leave callers
pointing at internal helper modules.

### Review checklist

- Compare the old and new validator branches side by side, not only the new
  helper tests.
- Verify helper calls in `validateTemplateBase` preserve the baseline order.
- Verify `render` is not accidentally required by `validateTemplateBase` and
  is not checked before base validation.
- Verify no helper is exported through `validation/index.ts` or `src/index.ts`.
- Check generated `.d.ts` output for unchanged public result shapes and types.
- Confirm the test map has no omitted current case and no snapshot-heavy test.
- Confirm the PR contains only the permitted validation/core/public-contract
  files; do not edit generated output.

## Out of scope

- Changing validation behavior, order, error text, coercion, mutation, or
  normalization.
- Redesigning `TemplateBase`, `TemplateDefinition`, field descriptors, content,
  variants, or render props.
- Adding a schema library, runtime dependency, new state library, or package
  split.
- Exporting internal validators or adding compatibility wrapper modules.
- Refactoring `validateTemplateData`, editor state, editor components, upload,
  export, or Studio UI behavior.
- Editing source/tests outside the stated code scope, generated files, package
  configuration, or public package metadata.
