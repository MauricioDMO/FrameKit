# Validation And Troubleshooting

## What `framekit check` validates

For every template and content variant, `framekit check` generates the registry, validates the definition, resolves defaults and variant content without Studio edits, and validates the resulting data.

- Width and height must be positive finite integers.
- `content` needs at least one entry; each entry must be a plain object containing only declared field values of the correct kind. String fields use strings, number fields use finite numbers, and boolean fields use real booleans. `variants.default` must name one of the content entries.
- Do not add `language` to a content entry: `content.<variant>.language` is rejected as an unknown field key. The field name `language` is reserved in `fields`.
- `render` must be a function.
- Required string values cannot be blank after trimming.
- Number field definitions require a finite numeric `defaultValue` and do not
  accept `required`. Supplied `min` and `max` values must be finite and ordered;
  `step` must be finite and positive and defaults to `1`. Slider controls require
  explicit finite `min` and `max` bounds.
- Number values and defaults must be finite and satisfy declared bounds and step
  using native numeric/range semantics. Numeric strings are rejected without
  coercion.
- An empty or temporarily malformed number input is a local draft, not render
  data; only committed finite numeric data is validated for rendering.
- Non-empty colors must match `#RRGGBB`.

Common data errors are `required`, `invalid_number`, `number_too_small`, `number_too_large`, `invalid_step`, and `invalid_color`.

For the breaking number-field contract, see [GitHub issue #8](https://github.com/MauricioDMO/FrameKit/issues/8).

## Discovery And CLI

For template discovery, structural changes, ports, builds, starts, aliases, and
installation failures, read [CLI and troubleshooting](../../fk-setup/references/cli-and-troubleshooting.md).
