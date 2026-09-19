---
title: Image API errors
description: Handle the stable status and error codes returned by the FrameKit image render endpoint.
sidebar:
  order: 4
---

The image endpoint returns JSON errors with this shape:

```json
{
  "error": "invalid_template_data",
  "message": "Template data is invalid",
  "fields": {
    "title": {
      "code": "required"
    }
  }
}
```

`fields` is included only for `invalid_template_data` when safe field details are available. The server omits internal causes and does not expose secrets in response bodies. Use `error` and the HTTP status for programmatic handling, not `message`.

## Status and code reference

| Status | Code | Meaning |
| ---: | --- | --- |
| `400` | `invalid_request` | The JSON shape, content type, template, variant, or request metadata is invalid. |
| `401` | `unauthorized` | No valid same-origin session or API token was supplied. The response includes `WWW-Authenticate: Bearer`. |
| `404` | `template_not_found` | The requested template slug is not in the generated registry. |
| `405` | `method_not_allowed` | The image dispatcher accepts only `POST` and sends `Allow: POST`. |
| `413` | `request_too_large` | The JSON body exceeds 12,000,000 bytes, or a prepared image exceeds 8,000,000 bytes. |
| `415` | `unsupported_image` | The source is unsupported, its MIME type and file signature do not match, or the initially submitted image URL uses a non-HTTP(S) scheme such as `ftp:` or `file:`. |
| `422` | `invalid_template_data` | Data does not satisfy the selected template's field and variant contract. |
| `422` | `image_host_not_allowed` | A valid HTTP or HTTPS image URL is not permitted by the image host policy. This includes an HTTP URL or an HTTPS hostname not in the configured allowlist; non-HTTP(S) schemes such as `ftp:` and `file:` on the initially submitted URL return `unsupported_image` instead. |
| `502` | `image_fetch_failed` | A permitted remote image could not be fetched or returned a valid response. |
| `503` | `api_not_configured` | `PORT` or an image-render configuration value is invalid. |
| `503` | `render_capacity_exhausted` | The process already has its configured maximum number of active renders. The response includes `Retry-After: 1`. |
| `504` | `render_timeout` | The request exceeded `FRAMEKIT_RENDER_TIMEOUT_MS`. |
| `500` | `render_failed` | The template, render page, browser, or screenshot failed unexpectedly. |

The `ftp:` and `file:` scheme distinction applies to the initially submitted image URL. If a remote server redirects to an invalid or disallowed destination, fetching that redirect may end as `502 image_fetch_failed`; a host-policy rejection remains `422 image_host_not_allowed` when the code classifies it that way.

All image errors use `Cache-Control: no-store` and `Content-Type: application/json`.

## Client handling

1. Handle `401` by checking the credential and its owner status. An invalid Bearer header does not fall back to a session cookie.
2. Handle `400`, `415`, and `422` as request or template-data corrections. For `invalid_template_data`, use `fields` when present.
3. Handle `413` by reducing the JSON or image input size.
4. Handle `502` by checking HTTPS, the hostname allowlist, the remote response, and redirect rules.
5. Handle `503` capacity with bounded retry and external throttling; do not retry a configuration error until the environment is corrected.
6. Handle `504` by checking the template and browser runtime, then adjust the timeout within its supported range only when the render genuinely needs more time.

After validating image-render configuration, authentication happens before request parsing, template lookup, remote fetches, and browser reservation. Fix a `401` before diagnosing the body or rendering path.
