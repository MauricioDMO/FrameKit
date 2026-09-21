---
title: Access API
description: Reference the FrameKit session, account, token, and administrator user-management endpoints.
sidebar:
  order: 2
---

The access API exists only when `FRAMEKIT_AUTH_ENABLED=true`. In open mode, all
access routes return not found before reading the request body, checking origin,
or opening SQLite. When enabled, the API uses the `framekit_session` cookie.
Login creates the cookie; logout, password changes, deactivation, and deletion
can expire it. The cookie is `HttpOnly`, `SameSite=Lax`, scoped to `/`, and lasts
30 days. In production it also has `Secure`.

In authenticated mode, all access request bodies are JSON objects no larger than
64 KiB. Use `Content-Type: application/json`; only the identity content encoding
is accepted. Request objects use exact keys for each operation. Access routes do
not accept Bearer tokens.

## Authentication and authorization

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

For cookie-authenticated mutations, send an `Origin` that matches the request origin. The server also validates forwarded origin information when the application is behind a proxy. A valid cookie by itself does not authorize a cross-origin mutation.

The server performs these checks independently of Studio UI visibility. A `user` cannot gain administrator access by calling the route directly. An administrator can inspect and revoke another user's token metadata, but the full token secret is never returned again.

## Login and logout

### `POST /api/framekit/login`

Request:

```json
{
  "username": "admin",
  "password": "your-password"
}
```

The request body is read before the credentials can be authenticated. On success, the response is `200` and returns the safe user object:

```json
{
  "id": "user-id",
  "username": "admin",
  "role": "admin"
}
```

The response also sets `framekit_session`. Invalid, unknown, or inactive credentials return `401` without identifying which case occurred. On an empty database, the login handler runs `bootstrapUsers` before authenticating the submitted credentials; bootstrap is therefore not conditional on a successful credential check. It uses `FRAMEKIT_ADMIN_USERNAME` and `FRAMEKIT_ADMIN_PASSWORD` only when authentication is enabled; see [Manage your account and tokens](/en/users/guides/manage-account-and-tokens).

### `POST /api/framekit/logout`

Returns `200` with:

```json
{
  "status": "ok"
}
```

The response expires `framekit_session`. Repeating logout is safe when no usable session exists.

## Account endpoints

### `GET /api/framekit/account`

Requires a session and returns the safe user object with `id`, `username`, and `role`.

### `PATCH /api/framekit/account`

Requires a same-origin session mutation. The exact request body is:

```json
{
  "username": "new-name"
}
```

The response is `200` with the updated safe user object. Usernames are 3-64 ASCII letters, numbers, `.`, `_`, or `-`, and must be unique.

### `POST /api/framekit/account/password`

Requires the current session and current password:

```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

The new password must be between 12 and 256 UTF-8 bytes. A successful change returns `200`, `{ "status": "ok" }`, and an expired session cookie. It invalidates all sessions for that account but does not revoke API tokens.

## API token endpoints

### `GET /api/framekit/tokens`

Returns an array of the signed-in user's token metadata. Each item contains `id`, `name`, `tokenPrefix`, `createdAt`, `lastUsedAt`, and `revokedAt`. The full secret is not included.

### `POST /api/framekit/tokens`

Create a token with an exact same-origin body:

```json
{
  "name": "image-renderer"
}
```

The trimmed name must be 1-80 characters. A successful response is `201` and contains the metadata plus `token`. The full `fk_` secret is returned only in this response. Store it server-side before discarding the response.

### `DELETE /api/framekit/tokens/:id`

An owner can revoke an own token. An administrator can revoke any token. A successful response is `200`, `{ "status": "ok" }`. Revocation leaves metadata available with `revokedAt` set and cannot be undone through the API.

## User-management endpoints

Every route in this group requires an administrator session. `GET /api/framekit/users/:id/tokens` is the exception to the method group: an ordinary user may read token metadata for the user's own ID, while an administrator may read any user's metadata.

### `GET /api/framekit/users`

Returns an array of managed users. Each item contains:

```json
{
  "id": "user-id",
  "username": "editor",
  "role": "user",
  "active": true,
  "createdAt": 0,
  "updatedAt": 0
}
```

### `POST /api/framekit/users`

Create an active user. `username` and `password` are required; `role` is optional and defaults to `user`:

```json
{
  "username": "editor",
  "password": "a-strong-password",
  "role": "user"
}
```

The response is `201` with the safe user object. Passwords are never returned.

### `PATCH /api/framekit/users/:id`

The body must contain at least one of `username`, `role`, or `active`, and may contain only those keys:

```json
{
  "active": false
}
```

The response is `200` with the updated safe user object. Deactivating a user removes that user's sessions and stops the user's tokens from authenticating until reactivation. The server rejects an operation that would remove the last active administrator.

### `DELETE /api/framekit/users/:id`

Deletes the user and returns `200`, `{ "status": "ok" }`. The user's sessions and API tokens are removed. The last active administrator cannot be deleted.

### `POST /api/framekit/users/:id/password`

An administrator can reset a user's password without the current password:

```json
{
  "password": "a-new-strong-password"
}
```

The response is `200`, `{ "status": "ok" }`. All sessions for that user are invalidated; API tokens remain.

### `GET /api/framekit/users/:id/tokens`

Returns the target user's token metadata without any full token secret. An administrator can request any managed user. A normal user can request only the user's own ID.

## Access errors

Error responses use `{ "error": "code", "message": "..." }` and `Cache-Control: no-store`. The stable access codes are:

| Status | Codes |
| ---: | --- |
| `400` | `invalid_request` |
| `401` | `unauthorized` |
| `403` | `forbidden` |
| `404` | `not_found` |
| `405` | `method_not_allowed` |
| `409` | `conflict` |
| `413` | `request_too_large` |
| `500` | `internal_error` |
| `503` | `service_unavailable` |

The `Allow` response header is present for a method mismatch. Do not depend on internal exception messages; use the status and `error` code.
