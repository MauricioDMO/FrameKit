---
title: Access API
description: Reference the FrameKit access routes and their common HTTP contract.
sidebar:
  order: 2
---

The access API exists only when `FRAMEKIT_AUTH_ENABLED=true`. In open mode, all
access routes return `404 not_found`. When enabled, the API uses the
`framekit_session` cookie. Login creates the cookie; logout, password changes,
deactivation, and deletion can expire it. The cookie is `HttpOnly`,
`SameSite=Lax`, scoped to `/`, and lasts 30 days. In production it also has
`Secure`.

## Common contract

Access request bodies are JSON objects no larger than 64 KiB. Use
`Content-Type: application/json`; an optional UTF-8 charset is accepted, and
only the identity content encoding is accepted. Request objects use exact keys
for each operation. Responses are JSON with `Cache-Control: no-store`.

Cookie-authenticated mutations require an `Origin` that matches the request
origin. The server also validates forwarded origin information when the
application is behind a proxy. A valid cookie by itself does not authorize a
cross-origin mutation. Access routes do not accept Bearer tokens.

The server performs authorization independently of Studio UI visibility. A
`user` cannot gain administrator access by calling the route directly. An
administrator can inspect and revoke another user's token metadata, but the
full token secret is never returned again.

## Route map

| Operation | Authentication | Same-origin requirement |
| --- | --- | --- |
| `POST /api/framekit/login` | No existing session; credentials are verified | Yes |
| `POST /api/framekit/logout` | Cookie is cleared whether or not it is usable | Yes |
| `GET /api/framekit/account` | Signed-in session | No `Origin` check in the handler |
| `PATCH /api/framekit/account` | Signed-in session | Yes |
| `POST /api/framekit/account/password` | Signed-in session and current password | Yes |
| `GET /api/framekit/tokens` | Signed-in session; own tokens | No `Origin` check in the handler |
| `POST /api/framekit/tokens` | Signed-in session; creates an own token | Yes |
| `DELETE /api/framekit/tokens/:id` | Signed-in session; owner or administrator | Yes |
| `GET /api/framekit/users` | Administrator session | No `Origin` check in the handler |
| `POST /api/framekit/users` | Administrator session | Yes |
| `PATCH /api/framekit/users/:id` | Administrator session | Yes |
| `DELETE /api/framekit/users/:id` | Administrator session | Yes |
| `POST /api/framekit/users/:id/password` | Administrator session | Yes |
| `GET /api/framekit/users/:id/tokens` | Administrator or the target user's session | No `Origin` check in the handler |

See the focused pages for request and response details:

- [Account endpoints](/en/users/reference/http-api/account)
- [Token endpoints](/en/users/reference/http-api/tokens)
- [User-management endpoints](/en/users/reference/http-api/users)
- [Access errors](/en/users/reference/http-api/access-errors)
