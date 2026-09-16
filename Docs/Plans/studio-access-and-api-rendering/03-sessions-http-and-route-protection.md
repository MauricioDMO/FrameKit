# Phase 3 - Sessions, HTTP, and Route Protection

## Goal

Add database sessions, login/logout HTTP behavior, and request-time Studio
protection while preserving the independent private-render token boundary.

## Depends on

- Phase 2 credential and user operations.
- The current `createStudioPage()` integration and generated `StudioClient`.
- The custom development server's `/framekit/assets` interception.

## Session contract

Generate a 32-byte random base64url session secret. Return the secret only in
the cookie and store only its SHA-256 hash with user ID, creation time, and a
fixed 30-day expiry.

Use this cookie contract:

```text
Name: framekit_session
HttpOnly: true
SameSite: Lax
Path: /
Secure: true when NODE_ENV=production
Expires/Max-Age: 30 days
```

Session lookup must join the user and reject expired or inactive accounts.
Delete expired sessions opportunistically during session operations. Logout
deletes the stored session when present and always expires the browser cookie.

Changing or resetting a password deletes all sessions for that user. Disabling
a user also deletes all sessions in the same mutation.

## HTTP boundary

Add `createStudioAccessHandler()` to `@mauriciodmo/framekit/server`. Phase 3's
consumer integration keeps each application adapter as a thin catch-all binding
for the supported HTTP methods. In the current application shape, both the
first-party Studio and generated consumer bind `createFrameKitApiHandler(templates)`;
that unified factory delegates access actions to this handler and exports `GET`,
`POST`, `PATCH`, and `DELETE` from each adapter.

The original Phase 3 session scope is:

```text
POST  /api/framekit/login
POST  /api/framekit/logout
GET   /api/framekit/account
PATCH /api/framekit/account
POST  /api/framekit/account/password
```

The current `createStudioAccessHandler()` also contains the Phase 4 token and
user operations. It matches 10 exact access path patterns (14 method/path
combinations):

```text
POST         /api/framekit/login
POST         /api/framekit/logout
GET, PATCH   /api/framekit/account
POST         /api/framekit/account/password
GET, POST    /api/framekit/tokens
DELETE       /api/framekit/tokens/:id
GET, POST    /api/framekit/users
PATCH, DELETE /api/framekit/users/:id
POST         /api/framekit/users/:id/password
GET          /api/framekit/users/:id/tokens
```

`createFrameKitApiHandler(templates)` adds exactly one more path: the canonical
`POST /api/framekit/images/render` image action. The unified handler therefore
serves 11 path patterns and 15 method/path combinations. The application
catch-all exports the same handler for its four `GET`, `POST`, `PATCH`, and
`DELETE` bindings; it is not a separate route implementation.

Use exact path and method matching. Reject unknown actions without exposing
internal routes. Dynamic IDs are one decoded path segment; malformed IDs and
trailing or extra path segments return `404`. Unsupported methods return `405`
with the route's `Allow` header. Read access bodies with the fixed 64 KiB
encoded limit and exact object-shape validation; do not reuse the image API's
12 MB ceiling.

Login accepts username and password and returns the same `401` response for all
invalid credentials; malformed or non-exact requests are `400`. Username
changes use the active session. Password changes require current and new
passwords, delete every session, expire the current cookie, and require a new
login.

Access routes use the database-backed `framekit_session` cookie, not a Bearer
credential. Login creates the cookie and logout is idempotent even when the
cookie is missing or invalid. Account and token operations require an active
session; user creation, updates, password resets, and deletion require an
administrator session, while user-token metadata is available to an
administrator or the target user. Token revocation is owner-scoped for normal
users and administrator-scoped otherwise.

All JSON responses use `Cache-Control: no-store` and never include hashes.

Access failures use stable, generic JSON `{ error, message }` responses:

```text
400 invalid_request       401 unauthorized       403 forbidden
404 not_found             405 method_not_allowed 409 conflict
413 request_too_large     500 internal_error      503 service_unavailable
```

`method_not_allowed` includes `Allow`. Invalid first-boot configuration maps to
`503`; unexpected errors map to `500`. The image handler has its own public
error states: `invalid_request` (400), `unauthorized` (401),
`template_not_found` (404), `request_too_large` (413), `unsupported_image`
(415), `invalid_template_data` and `image_host_not_allowed` (422),
`image_fetch_failed` (502), `api_not_configured` and
`render_capacity_exhausted` (503), `render_timeout` (504), and `render_failed`
(500). Image `401` responses advertise `Bearer`; capacity failures advertise
`Retry-After: 1`. Internal causes are not serialized.

## Same-origin protection

For the access handler, require an `Origin` header matching the canonical
request origin for login and every non-`GET` access request. The check runs
before body parsing or route handling; `GET` access requests do not require an
`Origin`. Current origin resolution uses
`new URL(request.url)` together with validated `Host`, `x-forwarded-proto`, and
`x-forwarded-host` headers where applicable; it does not read an environment
origin. For direct requests, that origin is `new URL(request.url).origin`; when
Next uses its default wildcard bind host (`0.0.0.0` or `[::]`), use the
validated `Host` authority with the request URL's protocol. Because the Next 16
adapter can build `request.url` from its configured internal hostname and port,
the supported HTTPS reverse-proxy path uses one valid `x-forwarded-proto: https`
value and one valid `x-forwarded-host` authority as the canonical public origin.
With forwarding headers, both values must parse as one origin. An HTTP forwarded
origin is accepted only when it equals the internal origin, or when a wildcard
request URL has a matching validated `Host`; incomplete, ambiguous, malformed,
or other non-HTTPS public-origin overrides fail closed. The proxy must overwrite
or strip client-supplied forwarding headers. The forwarding headers, not an
environment fallback, are the current reverse-proxy mechanism.
`FRAMEKIT_PUBLIC_ORIGIN` is unsupported: it is not read and must not be used as
a fallback. `FRAMEKIT_INTERNAL_ORIGIN` is a render-server setting, not the
cookie request-origin setting.

Reject a missing, malformed, or cross-origin value before mutating data.

The canonical image handler accepts either a valid active-user session cookie or
`Authorization: Bearer <database API token>`. It requires the same-origin check
only for the session-cookie branch. If an `Authorization` header is present,
only its strict Bearer credential is evaluated; an invalid token never falls
back to an ambient session, and a valid token does not require `Origin`. API
tokens are looked up by stored SHA-256 hash and must be unrevoked with an active
owner.
Deployment-level login throttling remains mandatory and is not implemented in
FrameKit.

Prove the comparison through a representative reverse-proxy integration before
adding public-origin configuration:

```text
browser: https://framekit.example.com
reverse proxy -> container: http://127.0.0.1:3000
Origin: https://framekit.example.com
```

With the proxy forwarding the external host and protocol through its normal
headers, the access handler uses that canonical public origin so login and an
authenticated account mutation are accepted even when Next's `request.url`
contains the internal origin. Do not add a `FRAMEKIT_PUBLIC_ORIGIN` fallback.

## Runtime settings and canonical endpoints

On the first login against an empty database, `bootstrapUsers()` requires
`FRAMEKIT_ADMIN_PASSWORD` (12-256 UTF-8 bytes) and uses
`FRAMEKIT_ADMIN_USERNAME` or `admin` (3-64 ASCII letters, numbers, `.`, `_`, or
`-`). Once a user exists, bootstrap returns before reading or validating those
settings. Invalid first-boot configuration is the access `503
service_unavailable` state.

The canonical public image endpoint is exactly:

```text
POST /api/framekit/images/render
```

Its render settings are read when that request is handled. In particular,
`FRAMEKIT_INTERNAL_ORIGIN` is required, has no default, and must be an HTTP
loopback origin (`localhost`, `127.0.0.1`, or `[::1]`, with an optional port and
no credentials, path, query, or fragment). It is used to reach the private
render page and is not used to determine the browser request origin.

The private render page remains a different internal endpoint:
`/framekit/render/[id]`. It requires the `x-framekit-render-token` header and is
not protected by a Studio session or API token.

## Studio page protection

Evolve `createStudioPage(StudioClient)` so it:

1. validates the section;
2. reads the request cookie through the asynchronous Next.js cookies API;
3. validates the database session and active user;
4. redirects missing or invalid sessions to `/login`;
5. renders `<StudioClient user={user} />` with the safe DTO.

Add `createLoginPage()` under `@mauriciodmo/framekit/studio/root`. It redirects
an already authenticated user to `/editor` and otherwise renders the reusable
login UI boundary. Cookie mutation remains in the route handler, not the Server
Component.

The local Studio and starter page adapters must declare the Node runtime and
dynamic request-time rendering where needed. Database initialization must not
run during build.

## Development asset protection

`framekit dev` handles `/framekit/assets` before Next.js. Validate the raw
session cookie and same-origin request there before calling `handleAssetUpload`.
Return a non-sensitive `401` or `403` without touching project files when access
fails.

Do not protect `/framekit/render/[id]` with a Studio session. Its existing
internal job ID/header token remains its only authentication mechanism. This is
the private render page used by the canonical image endpoint, not another public
API action.

## Expected source and adapters

```text
packages/framekit/src/server/access/sessions.ts
packages/framekit/src/server/access/api-tokens.ts
packages/framekit/src/server/access/users/bootstrap.ts
packages/framekit/src/server/access/http/index.ts
packages/framekit/src/server/access/http/routes.ts
packages/framekit/src/server/access/http/session.ts
packages/framekit/src/server/access/http/origin.ts
packages/framekit/src/server/access/http/request.ts
packages/framekit/src/server/access/http/errors.ts
packages/framekit/src/server/api-handler.ts
packages/framekit/src/server.ts
packages/framekit/src/studio/page.tsx
packages/framekit/src/studio-root.ts
packages/framekit/src/studio/login/
packages/framekit/src/tooling/dev/create-dev-server/index.ts
packages/framekit/src/tooling/dev/create-dev-server/http-server.ts
packages/framekit/src/tooling/dev/create-dev-server/asset-authorization.ts
packages/create-framekit/template/src/app/login/page.tsx
packages/create-framekit/template/src/app/[section]/[[...slug]]/page.tsx
packages/create-framekit/template/src/app/api/framekit/[...action]/route.ts
apps/studio/src/app/login/page.tsx
apps/studio/src/app/[section]/[[...slug]]/page.tsx
apps/studio/src/app/api/framekit/[...action]/route.ts
```

Keep route files as configuration and package-factory bindings only.

## Implementation and verification record

Phase 3 is **implemented and verified** in the current checkout on 2026-09-15.

- Database sessions generate 32-byte base64url secrets, store only SHA-256
  hashes, expire after 30 days, reject inactive users, and invalidate on logout,
  password changes, and deactivation.
- The access handler matches 10 exact path patterns (14 method/path
  combinations), including token and user management, and enforces bounded
  exact JSON bodies, safe `StudioUser`/token metadata responses, and exact
  same-origin `Origin` checks before non-`GET` access handling.
- The canonical `POST /api/framekit/images/render` handler accepts a same-origin
  active session cookie or a valid unrevoked Bearer database API token; the
  token branch does not require `Origin` and never falls back from an invalid
  Bearer header to a session.
- `editor`, `brand`, and `settings` require an active session and redirect to
  `/login`; an authenticated login page redirects to `/editor`; development
  asset uploads require the same session and origin boundary before file
  handling.
- The private `/framekit/render/[id]` path remains independent and requires
  only its `x-framekit-render-token` job token.
- The HTTP access test covers an internal adapter URL with forwarded HTTPS login
  and authenticated account PATCH through the actual handler and returned
  session cookie without public-origin configuration. The app adapter test also
  exercises the real Next route exports with that topology.

## Focused tests

- creates, resolves, expires, and deletes a session;
- stores only the session hash;
- rejects sessions for inactive or deleted users;
- logout is safe with missing or invalid cookies;
- password change verifies the current password and invalidates all sessions;
- login uses one generic invalid-credential response;
- access bodies are bounded and exact;
- access path and method errors use stable `404`/`405` responses without route
  disclosure;
- access authorization enforces session, owner, administrator, and last-active-
  administrator rules;
- unsafe cookie operations reject missing and cross-origin `Origin` headers;
- valid same-origin login sets all cookie attributes;
- HTTPS reverse-proxy integration accepts same-origin login and an authenticated
  account mutation while the container receives HTTP;
- the canonical image route accepts same-origin session-cookie and Bearer
  database-token authentication with the documented failure states;
- protected editor, brand, and settings routes redirect without a session;
- login redirects with an existing valid session;
- `StudioClient` receives only the safe user DTO;
- development asset upload rejects unauthenticated and cross-origin requests;
- the private render page ignores Studio sessions and still requires its token;
- build/import paths do not initialize the database.

## Exit gate

Phase 3 is complete when login and logout work through the thin catch-all route,
Studio pages and development writes require an active session, password changes
invalidate sessions, CSRF checks fail closed without rejecting the supported
reverse-proxy topology, and the private render protocol is unchanged.
