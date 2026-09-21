---
title: Image render API
description: Render a defined FrameKit template as a server-side PNG through the optional-authentication HTTP endpoint.
sidebar:
  order: 3
---

## Endpoint

```text
POST /api/framekit/images/render
```

When `FRAMEKIT_AUTH_ENABLED` is missing or `false`, the route is credential-free.
When it is `true`, the route accepts either a same-origin `framekit_session`
cookie or an API token in `Authorization: Bearer <token>`. It accepts no other
authentication scheme. In both modes, the handler validates the image-render
configuration and retains its request, image, browser, capacity, timeout, and
cleanup defenses before rendering.

When authentication is enabled and an `Authorization` header is present, it
takes precedence. A malformed or invalid Bearer value returns `401`; the
handler does not fall back to a valid session cookie in that request. In open
mode no credential is required.

## Request

Send JSON with a body no larger than 12,000,000 bytes:

```json
{
  "template": "example",
  "variant": "default",
  "data": {
    "title": "Launch"
  }
}
```

The object accepts exactly these keys:

| Key | Required | Meaning |
| --- | --- | --- |
| `template` | Yes | A non-empty slug from the generated template registry. |
| `variant` | No | A non-empty content variant. When omitted, the template's default variant is used. |
| `data` | No | A plain object containing edits for declared fields. When omitted, it is treated as an empty object. |

Unknown keys, empty `template` or `variant` values, arrays, and prototype-pollution keys are rejected. A template must exist in the registry, and a supplied variant must exist in that template's `content`.

Use `Content-Type: application/json`. The endpoint rejects other content types and content encodings other than `identity`.

## Data and image fields

Non-image values in `data` are resolved and validated against the template's declared fields. An image field value can be:

- a root-relative path under `/assets/` or `/framekit/templates/`;
- a raster data URL for PNG, JPEG, WebP, or GIF; or
- an HTTPS URL whose hostname is listed exactly in `FRAMEKIT_ALLOWED_IMAGE_HOSTS`.

Remote images are fetched by Node and converted to a canonical data URL before Chromium renders the template. A remote response must have a supported raster MIME type and matching file signature. See [Security and reverse proxies](/en/users/deployment/security-and-reverse-proxies) for the restrictions and [Image API errors](/en/users/reference/http-api/errors) for failure codes.

## Success response

Success returns `200` with the PNG bytes produced at the template's declared `width` and `height`:

```text
Content-Type: image/png
Cache-Control: no-store
Content-Disposition: inline; filename="example.png"
X-Content-Type-Options: nosniff
```

The filename replaces `/` in a template slug with `-`. The response is always PNG in the current contract. There is no format, DPI, or asynchronous job parameter.

## Example

For an authenticated deployment, create an API token in Studio, keep the full
secret in a server-side environment variable, and replace `example` with a slug
from your generated registry:

```bash
export FRAMEKIT_ORIGIN=http://localhost:3000
export FRAMEKIT_AUTH_ENABLED=true
export FRAMEKIT_TOKEN='fk_replace_with_the_full_secret'

curl --fail-with-body \
  --request POST "$FRAMEKIT_ORIGIN/api/framekit/images/render" \
  --header "Authorization: Bearer $FRAMEKIT_TOKEN" \
  --header 'Content-Type: application/json' \
  --data '{"template":"example"}' \
  --output example.png
```

Do not put the token in the URL or send it from an untrusted browser. The [render images guide](/en/users/guides/render-images-with-the-api) adds a request workflow and failure handling.

For open mode, leave `FRAMEKIT_AUTH_ENABLED` unset or set it to `false` and
omit the `Authorization` header. The image endpoint remains protected by its
renderer defenses even though it does not require credentials.
