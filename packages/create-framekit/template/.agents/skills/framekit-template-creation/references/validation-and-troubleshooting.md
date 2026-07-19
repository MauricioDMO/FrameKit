# Validation And Troubleshooting

## What `framekit check` Validates

For every template and declared locale, `framekit check` validates the definition, resolves defaults and locale content without edits, then validates the resolved data.

- Dimensions must be positive finite integers.
- `content` needs at least one entry, and every entry needs `language`.
- `render` must be a function.
- Required values cannot be empty after trimming whitespace.
- Numbers must be finite and within `min`/`max`.
- URLs must be HTTP(S) or root-relative.
- Non-empty colors must be `#RRGGBB`.

Common data error codes: `required`, `invalid_number`, `number_too_small`, `number_too_large`, `invalid_url`, and `invalid_color`.

## Discovery Problems

| Symptom | Fix |
| --- | --- |
| No templates found | Create `src/templates` and add at least one valid template directory containing `template.tsx`; run `framekit generate`. |
| Invalid path segment | Rename every segment under `src/templates` to lowercase kebab-case. |
| Directory is absent from Studio | Remove a leading `.` or `_`; ensure the directory or a descendant contains `template.tsx`. |
| Structural changes do not appear in dev | Restart `framekit dev`. |

## Development And Build

- `framekit dev` uses port `3000` by default. Set `PORT=3001` for an available port; `FRAMEKIT_HOST` takes priority over `HOST` for the bind address.
- `framekit build` stops at template validation errors. Run `framekit check` directly for the detailed per-file, per-locale, and per-field errors.
- `framekit check` does not test rendering or PNG export. Export can fail when data is invalid, fonts fail to load, external images lack CORS permission, or the browser lacks DOM/canvas support.
