---
title: Troubleshoot image rendering
description: Diagnose optional authentication, request, image input, Chromium, capacity, and timeout failures from the image API.
sidebar:
  order: 7
---

Start with the HTTP status and stable `error` code. The [image API error reference](/en/users/reference/http-api/errors) contains the complete error contract.

Check `FRAMEKIT_AUTH_ENABLED` before diagnosing credentials. Missing or `false`
is open mode: image rendering is credential-free but retains renderer defenses.
Exactly `true` enables authenticated image access; any other configured value is
invalid.

## `401 unauthorized` in authenticated mode

**Symptom:** The image endpoint returns `401 unauthorized`.

**Probable cause:** With `FRAMEKIT_AUTH_ENABLED=true`, the Bearer token is invalid, revoked, or owned by an inactive user, or a cookie-authenticated request has no valid same-origin session. Missing credentials are not a failure in open mode.

**Check:** Confirm that the header is exactly `Authorization: Bearer <full-token>`, or confirm that the request includes a valid session cookie and same-origin `Origin`. A malformed Authorization header does not fall back to the cookie.

**Fix:** Set `FRAMEKIT_AUTH_ENABLED=true` explicitly for authenticated access, then use the original full token or create a new token and retry with the correct authentication method. In open mode, omit the credential.

## `400 invalid_request` or `413 request_too_large`

**Symptom:** The endpoint rejects the request before rendering.

**Probable cause:** The request is not JSON, uses unsupported content encoding, has an invalid top-level shape, names an unknown variant, or exceeds 12,000,000 bytes.

**Check:** Send `Content-Type: application/json` with a body containing only `template`, optional `variant`, and optional `data`. `variant`, when present, must be declared by the template; `data` must be a plain object and the request body must stay within the size limit.

**Fix:** Use a declared variant or omit it to use the template default. Remove unsupported top-level keys and accidental arrays, use identity or no content encoding, and reduce the request body before retrying.

## `404 template_not_found`

**Symptom:** The endpoint cannot find the requested template slug.

**Probable cause:** The slug is not in the generated template registry.

**Check:** Compare the request value with the generated entries and the source directory under `src/templates/`.

**Fix:** Use the exact generated slug, or fix the source and run:

```bash
pnpm framekit check
pnpm framekit generate
```

Do not edit generated output.

## `415 unsupported_image`

**Symptom:** A request containing an image value is rejected as unsupported.

**Probable cause:** The value is not a safe root-relative path, valid raster data URL, or permitted HTTPS raster image; the MIME type or file signature may also be invalid.

**Check:** Verify the image field value and use a supported PNG, JPEG, WebP, or GIF. For an HTTPS URL, check the host allowlist and response headers.

**Fix:** Use a project asset, valid raster data URL, or an allowed HTTPS raster image.

## `413 request_too_large` for an image input

**Symptom:** The endpoint rejects an image input with `413 request_too_large`.

**Probable cause:** The prepared image is larger than the 8 MB image limit. This applies to raster data URLs and fetched remote images.

**Check:** Measure the decoded data-URL image or the remote response body, rather than only its encoded URL length.

**Fix:** Provide a smaller PNG, JPEG, WebP, or GIF, or use a smaller project asset, then retry the request.

## `422 invalid_template_data`

**Symptom:** The template is found, but the request returns invalid template data.

**Probable cause:** The field keys, required values, field types, limits, choices, colors, or image scope do not match the definition.

**Check:** Compare `variant` and `data` with the [template reference](/en/users/reference/template). If the response includes `fields`, use those field names to locate the invalid values.

**Fix:** Send only declared field keys with valid values and a valid variant, or omit `data` to use the template content for the selected variant.

## `422 image_host_not_allowed` or `502 image_fetch_failed`

**Symptom:** A remote image works in a browser but rendering rejects it.

**Probable cause:** The server-side fetch does not allow the hostname, the response is not a successful supported raster response, or a redirect leaves the allowed HTTPS host.

**Check:** Add the exact lowercase hostname to `FRAMEKIT_ALLOWED_IMAGE_HOSTS`, then verify HTTPS, the raster MIME type and signature, response status, and redirects.

**Fix:** Correct the allowlist or remote image response. Use a project asset when the image does not need to be remote. See [Configuration](/en/users/reference/configuration).

## `503 api_not_configured` or `503 render_capacity_exhausted`

**Symptom:** The endpoint reports invalid render configuration or temporary capacity exhaustion.

**Probable cause:** `PORT`, `FRAMEKIT_MAX_CONCURRENT_RENDERS`, `FRAMEKIT_RENDER_TIMEOUT_MS`, or the image-host allowlist is invalid, or all configured render slots are busy.

**Check:** Use these ranges: `PORT` 1–65535, maximum concurrent renders 1–32, timeout 1–120000 ms, and valid hostnames only. Distinguish a configuration error from a capacity response.

**Fix:** Correct invalid environment values. For capacity exhaustion, reduce caller concurrency or retry with the response's bounded retry guidance.

## `504 render_timeout` or `500 render_failed`

**Symptom:** Rendering times out or fails after the request is accepted.

**Probable cause:** Chromium is unavailable, the template or an image cannot load, or the render exceeds the configured timeout.

**Check:** Install Chromium, run `pnpm framekit check`, and retry with a known valid template and image inputs:

```bash
pnpm framekit browser install
```

On Linux, add `--with-deps` when required.

**Fix:** Repair the definition or image input, install the browser, and increase `FRAMEKIT_RENDER_TIMEOUT_MS` only within 1–120000 ms after correcting the underlying slow or invalid input.
