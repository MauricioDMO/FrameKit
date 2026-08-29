# Changelog

## Unreleased

### Changed

- Established the versionless canonical template contract: required `meta` and
  `variants` objects, field-only `content`, typed `variant` render props, shared
  validation, and deterministic data resolution. See [GitHub issue #1](https://github.com/MauricioDMO/FrameKit/issues/1).
- Updated the Studio templates, generated starter source, public documentation,
  and focused tests to use the canonical shape. Registry metadata policy remains
  deferred to issues #12 and #13.
- Added the exact template metadata contract: required non-empty `meta.title`,
  optional functional and marketing descriptions, optional string tags, and
  rejection of unsupported metadata properties. See [GitHub issue #3](https://github.com/MauricioDMO/FrameKit/issues/3).
- Replaced locale-shaped template selection with the explicit variant contract:
  `getVariants`, field-only content, validated defaults and labels, variant-named
  editor state, and `framekit:<slug>:v2` persistence that discards old `v1`
  state. See [GitHub issue #4](https://github.com/MauricioDMO/FrameKit/issues/4).
- Replaced the plural field factory namespace with singular `field`, removed the
  duplicate `textarea` kind, and made `field.text` multiline with optional
  `minLength` and `maxLength` validation. See [GitHub issue #5](https://github.com/MauricioDMO/FrameKit/issues/5).
- Added `field.choice` with frozen ordered options, required defaults, native
  Studio selects, and `invalid_choice` validation for undeclared values. See
  [GitHub issue #6](https://github.com/MauricioDMO/FrameKit/issues/6).
- Added `field.boolean` with real boolean defaults, typed content and overrides,
  native Studio checkboxes, and `invalid_boolean` validation without string
  coercion. See [GitHub issue #7](https://github.com/MauricioDMO/FrameKit/issues/7).
- Added the breaking `field.number` contract: required finite numeric defaults,
  native `input`/`slider` controls (`input` by default and explicit bounds for
  `slider`), finite ordered bounds, positive finite `step` defaulting to `1`,
  numeric data without string coercion, and local drafts excluded from render
  data. Existing string defaults, content values, and overrides must be migrated
  manually. See [GitHub issue #8](https://github.com/MauricioDMO/FrameKit/issues/8).
