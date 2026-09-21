---
title: Access API errors
description: Handle the stable status and error codes returned by the FrameKit access API.
sidebar:
  order: 6
---

Access errors use this JSON shape and `Cache-Control: no-store`:

```json
{
  "error": "invalid_request",
  "message": "Invalid request"
}
```

Use the HTTP status and `error` code for programmatic handling, not the human-
readable `message`. The stable access codes are:

| Status | Code | Meaning |
| ---: | --- | --- |
| `400` | `invalid_request` | The request body, content type, content encoding, or operation value is invalid. |
| `401` | `unauthorized` | The request has no valid session, or the supplied credentials are not valid. |
| `403` | `forbidden` | The session is not allowed to perform the operation, or a mutation is not same-origin. |
| `404` | `not_found` | The access route is disabled, or the requested resource does not exist. |
| `405` | `method_not_allowed` | The route does not accept the request method. The response includes `Allow`. |
| `409` | `conflict` | The username conflicts with an existing username, or the operation would remove the last active administrator. |
| `413` | `request_too_large` | An access JSON body exceeds 64 KiB. |
| `500` | `internal_error` | An unexpected server error occurred. |
| `503` | `service_unavailable` | Access bootstrap configuration is unavailable or invalid. |

The handler returns `404 not_found` for access routes when
`FRAMEKIT_AUTH_ENABLED` is unset or `false`. Do not depend on internal
exception messages; use the status and `error` code.
