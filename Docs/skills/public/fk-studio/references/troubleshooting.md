# FrameKit Studio Troubleshooting

Use [CLI and troubleshooting](../../fk-setup/references/cli-and-troubleshooting.md)
for discovery, aliases, CSS, ports, validation, builds, starts, and installation.

Use [template validation](../../fk-templates/references/validation-and-troubleshooting.md)
for definition and content-variant errors.

## Template does not open

- **Invalid definition** means the loaded definition failed runtime validation
  or disagreed with the registry dimensions. Run `framekit check` and fix the
  template definition; Studio will not open it for editing.
- **Load error** means the generated entry loader failed. Raw loader errors are
  not exposed in Studio; it shows the localized template or brand load-error
  message.
- **Not found** means the URL does not exactly match a slug in the active
  registry. Use the catalog route rather than treating this visual state as an
  HTTP 404.

## Data or persistence error

Studio resolves typed string, finite-number, and boolean values for the
selected arbitrary variant. In the content or edits being resolved, an unknown
variant, unknown field key, wrong primitive type, or non-finite number produces
a localized data error rather than a silent fallback. Persisted edits use
`framekit:<slug>:v2`; v1 is not read or migrated, and no v1 compatibility is
promised. Malformed top-level state is
discarded, while stale variants/fields, malformed variant entries, wrong-typed
values, and invalid persisted numbers are ignored. A definition refresh
rebases retained data to the new definition and preserves the selected variant
only when it remains valid; otherwise it uses `variants.default`.

## Image upload fails

Image upload is a development Studio path. A failed upload is shown as a
localized field upload error. Check the template slug, variant, field, image
type, and development server before retrying.

## Preview or export looks stale

Number input drafts are local to the number control. Incomplete drafts do not
become committed data, so preview, render, export, and copy continue to use
the last committed resolved value. The six controls preserve their runtime
types: text/color/image strings, finite numbers, choice strings, and booleans.

## PNG export fails

For PNG failures, validate resolved data, loaded fonts, cross-origin images, and
browser DOM/canvas support. Export is PNG-only at the template dimensions and
scale 1. Export and Copy PNG validate committed resolved data first, associate
validation errors with fields, and focus the first invalid field. Capture or
clipboard failures show Studio's localized export error/alert.
