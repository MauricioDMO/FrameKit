# Validation And Troubleshooting

## What `framekit check` validates

For every template and locale, `framekit check` generates the registry, validates the definition, resolves defaults and locale content without Studio edits, and validates the resulting data.

- Width and height must be positive finite integers.
- `content` needs at least one entry; every entry needs a string `language`.
- `render` must be a function.
- Required values cannot be blank after trimming.
- Numbers must be finite and within declared `min` and `max`.
- Non-empty colors must match `#RRGGBB`.

Common data errors are `required`, `invalid_number`, `number_too_small`, `number_too_large`, and `invalid_color`.

## Discovery And CLI

For template discovery, structural changes, ports, builds, starts, aliases, and
installation failures, read [CLI and troubleshooting](../../fk-setup/references/cli-and-troubleshooting.md).
