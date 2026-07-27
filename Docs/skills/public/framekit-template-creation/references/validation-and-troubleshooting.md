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

## Discovery

| Symptom | Fix |
| --- | --- |
| No templates found | Create `src/templates` and add a directory containing `template.tsx`; run `framekit generate`. |
| Invalid path segment | Rename every segment to lowercase kebab-case. |
| Directory is absent | Remove a leading `.` or `_`, or add `template.tsx` to it or a descendant. |
| Structural or asset changes are missing in dev | Restart `framekit dev`. |

For ports, builds, starts, aliases, and installation failures, read [CLI and troubleshooting](../../framekit-project-setup/references/cli-and-troubleshooting.md).
