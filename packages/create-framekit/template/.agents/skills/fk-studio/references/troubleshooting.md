# FrameKit Studio Troubleshooting

Use [CLI and troubleshooting](../../fk-setup/references/cli-and-troubleshooting.md)
for discovery, aliases, CSS, ports, validation, builds, starts, and installation.

Use [template validation](../../fk-templates/references/validation-and-troubleshooting.md)
for definition and content-variant errors.

## Access mode mismatch

- Check `FRAMEKIT_AUTH_ENABLED` first. Missing or `false` is open mode: `/editor`
  and `/brand` work without a session, `/login` redirects to `/editor`, and
  `/settings` plus the access API are not found. Do not add credentials or SQLite
  just to make those routes appear.
- `true` enables users, sessions, API tokens, and protected Studio/access routes.
  Set it explicitly before exposing production to an untrusted network. Any
  other value is invalid; `NODE_ENV`, bootstrap credentials, and SQLite do not
  enable authentication.

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

## Render configuration or authentication failure

- **Render configuration failure** (`api_not_configured` or “Image rendering
  API is not configured”) means the server rejected its render configuration
  before rendering. Check the runtime configuration of the server process and
  use the [CLI reference's server image API section](../../../../en/reference/cli.md#server-image-api)
  for the supported product settings. This is separate from template
  validation.
- **Authentication failure** (`unauthorized` or “Unauthorized”) applies when
  `FRAMEKIT_AUTH_ENABLED=true` and the request has neither an active same-origin
  Studio session nor a valid API token. Sign in again for Studio export; for an
  API request, send a valid bearer token as described in the [public API reference](../../../../en/reference/public-api.md). When an `Authorization` header is present, it must be valid; the handler does not fall back to a session cookie. In open mode, image export does not require a credential.
- `CI`, `NEXT_TELEMETRY_DISABLED`, `PLAYWRIGHT_BROWSERS_PATH`,
  `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD`, and `NO_COLOR` do not configure image API
  authentication or rendering. Do not use test/tooling variables to fix these
  responses.
- `NODE_EXTRA_CA_CERTS` is reserved for an isolated HTTPS smoke fixture with a
  private test CA. It is not a normal Studio setting or an image API
  authentication/configuration fix.

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
localized field upload error. It is same-origin protected in open mode and also
requires the active Studio session when authentication is enabled. Check the
template slug, variant, field, image type, and development server before
retrying.

## Preview or export looks stale

Number input drafts are local to the number control. Incomplete drafts do not
become committed data, so preview, render, export, and copy continue to use
the last committed resolved value. The six controls preserve their runtime
types: text/color/image strings, finite numbers, choice strings, and booleans.

## PNG export fails

For PNG failures, validate resolved data, the configured auth mode, the active
Studio session when authentication is enabled, same-origin cookie requests,
Chromium availability, and the remote-image allowlist. Export
is PNG-only at the template dimensions. Export and Copy PNG validate committed
resolved data first, associate structured server validation errors with fields,
and focus the first invalid field. Render, download, or clipboard failures show
Studio's localized export error/alert.
