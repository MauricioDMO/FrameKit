---
title: Troubleshoot image rendering
description: Diagnose authentication, request, image input, Chromium, capacity, and timeout failures from the image API.
sidebar:
  order: 3
---

Start with the HTTP status and the stable `error` code. The [image API error reference](/en/users/reference/http-api/errors) is the source for the complete matrix.

## `401 unauthorized`

After the handler validates image-render configuration, authentication is checked before the JSON body, template lookup, remote fetch, or browser reservation. Check these items first:

- The `Authorization` header is exactly `Bearer <full-token>` with no token truncation.
- The token has not been revoked and its owner is active.
- A cookie-authenticated request includes a valid `framekit_session` and a same-origin `Origin`.
- An invalid or malformed `Authorization` header is removed if you intend to use the session cookie; it never falls back to the cookie.

Create a fresh token if the original full secret was not stored. Token lists show metadata, not a recoverable secret.

## `400 invalid_request`

Use `Content-Type: application/json` and keep the body within 12,000,000 bytes. The top-level object may contain only `template`, `variant`, and `data`. `template` must be a non-empty string, `variant` must be a non-empty string when present, and `data` must be a plain object. Check for accidental arrays, extra keys, unsupported content encoding, and prototype-pollution keys.

## `404 template_not_found`

The slug is not in the generated template registry. From the project root:

```bash
pnpm framekit check
pnpm framekit generate
```

Compare the request slug with the generated manifest and the directory under `src/templates/`. Fix source files and regenerate; do not edit generated output.

## `415 unsupported_image`

Image fields accept root-relative `/assets/` or `/framekit/templates/` paths, raster data URLs, and permitted HTTPS URLs. The accepted raster formats are PNG, JPEG, WebP, and GIF. SVG, malformed data URLs, mismatched MIME signatures, traversal, backslashes, fragments, and unsafe URL authorities are rejected.

For uploaded development assets, keep the file at or below 8 MB and use one of the supported raster formats. The same prepared-image limit applies to a remote or data-URL image.

## `422 invalid_template_data`

The request reached the template but the resolved data does not satisfy its definition. Check the selected variant, declared field keys, required values, numeric limits, text lengths, choices, booleans, colors, and image field scope. When the response includes `fields`, correct the named fields and submit again.

## `422 image_host_not_allowed` or `502 image_fetch_failed`

For remote images:

1. Add the exact lowercase hostname to `FRAMEKIT_ALLOWED_IMAGE_HOSTS`.
2. Use HTTPS without credentials or an explicit non-default port; `https://host:443` is normalized and accepted as HTTPS without a port.
3. Confirm the remote response is a supported raster MIME type with a matching file signature.
4. Check that every redirect remains HTTPS and stays on an allowed hostname.
5. Confirm the remote server returns a successful response before the timeout.

FrameKit fetches remote images from the Node process, not from the user's browser. An image URL that works in a browser may still be rejected by the server-side allowlist or raster checks.

## `503 api_not_configured` or `render_capacity_exhausted`

Check the render environment:

- `PORT` must be `1-65535`.
- `FRAMEKIT_MAX_CONCURRENT_RENDERS` must be `1-32`.
- `FRAMEKIT_RENDER_TIMEOUT_MS` must be `1-120000`.
- `FRAMEKIT_ALLOWED_IMAGE_HOSTS` must contain only valid hostnames, not IP literals.

Capacity exhaustion is process-local. Reduce caller concurrency or use bounded retry after the `Retry-After: 1` response. Do not interpret a configuration error as a capacity event.

## `504 render_timeout` or `500 render_failed`

Confirm Chromium is installed:

```bash
pnpm framekit browser install
```

Use `--with-deps` on Linux when required. Run `pnpm framekit check` to catch invalid definitions, then retry with a known valid template. The render timeout aborts or cancels request processing, image preparation, template loading, browser work, and screenshot work. Page and context cleanup is attempted in `finally`; that cleanup wait has no separate documented limit. Increase `FRAMEKIT_RENDER_TIMEOUT_MS` only within the supported range and only after correcting slow or invalid inputs.

The renderer returns PNG only. It waits for the render state, fonts, and images before capturing, so a failure can come from the template component, a missing image, a browser dependency, or an internal navigation error.
