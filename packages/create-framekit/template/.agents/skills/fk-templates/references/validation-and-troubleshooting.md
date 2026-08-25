# Validation And Troubleshooting

## What `framekit check` validates

For every template and content variant, `framekit check` generates the registry, validates the definition, resolves defaults and variant content without Studio edits, and validates the resulting data.

- Width and height must be positive finite integers.
- `content` needs at least one entry; each entry must be a plain object containing only string field values. `variants.default` must name one of the content entries.
- Do not add `language` to a content entry: `content.<variant>.language` is rejected as an unknown field key. The field name `language` is reserved in `fields`.
- `render` must be a function.
- Required values cannot be blank after trimming.
- Numbers must be finite and within declared `min` and `max`.
- Non-empty colors must match `#RRGGBB`.

Common data errors are `required`, `invalid_number`, `number_too_small`, `number_too_large`, and `invalid_color`.

## Discovery And CLI

For template discovery, structural changes, ports, builds, starts, aliases, and
installation failures, read [CLI and troubleshooting](../../fk-setup/references/cli-and-troubleshooting.md).
