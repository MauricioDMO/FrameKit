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

Add `createStudioAccessHandler()` to `@mauriciodmo/framekit/server`. One consumer
catch-all route exports the returned handler for the supported HTTP methods.

This phase implements:

```text
POST  /api/framekit/login
POST  /api/framekit/logout
GET   /api/framekit/account
PATCH /api/framekit/account
POST  /api/framekit/account/password
```

Use exact path and method matching. Reject unknown actions without exposing
internal routes. Read access bodies with a small fixed encoded limit and exact
object-shape validation; do not reuse the image API's 12 MB ceiling.

Login accepts username and password and returns the same `401` response for all
invalid credentials. Username changes use the active session. Password changes
require current and new passwords, delete every session, expire the current
cookie, and require a new login.

All JSON responses use `Cache-Control: no-store` and never include hashes.

## Same-origin protection

Require an `Origin` header matching the canonical request origin for login and
every cookie-authenticated unsafe request. For direct requests, that origin is
`new URL(request.url).origin`; when Next uses its default wildcard bind host
(`0.0.0.0` or `[::]`), use the validated `Host` authority with the request URL's
protocol. Because the Next 16 adapter can build `request.url` from its configured
internal hostname and port, the supported HTTPS reverse-proxy path uses one
valid `x-forwarded-proto: https` value and one
valid `x-forwarded-host` authority as the canonical public origin. Incomplete,
ambiguous, malformed, or non-HTTPS forwarding overrides fail closed. The proxy
must overwrite or strip client-supplied forwarding headers; FrameKit has no
`FRAMEKIT_PUBLIC_ORIGIN` fallback.

Reject a missing, malformed, or cross-origin value before mutating data.

Bearer-authenticated API requests are not governed by this cookie CSRF rule.
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
headers, the access handler must use that canonical public origin so login and
an authenticated account mutation are accepted even when Next's `request.url`
contains the internal origin. If that gate fails, stop and define an explicit
public-origin contract before shipping; do not add `FRAMEKIT_PUBLIC_ORIGIN`
speculatively.

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
internal job ID/header token remains its only authentication mechanism.

## Expected source and adapters

```text
packages/framekit/src/server/access/sessions.ts
packages/framekit/src/server/access/http.ts
packages/framekit/src/studio/page.tsx
packages/framekit/src/studio/login/
packages/framekit/src/tooling/dev/create-dev-server.ts
packages/create-framekit/template/src/app/login/page.tsx
packages/create-framekit/template/src/app/api/framekit/[...action]/route.ts
apps/studio/src/app/login/page.tsx
apps/studio/src/app/api/framekit/[...action]/route.ts
```

Keep route files as configuration and package-factory bindings only.

## Implementation and verification record

Phase 3 is **implemented and verified** in the current checkout on 2026-09-15.

- Database sessions generate 32-byte base64url secrets, store only SHA-256
  hashes, expire after 30 days, reject inactive users, and invalidate on logout,
  password changes, and deactivation.
- The exact five-route access handler enforces bounded exact JSON bodies, safe
  `StudioUser` responses, and exact same-origin `Origin` checks before unsafe
  cookie operations.
- `editor` and `brand` require an active session and redirect to `/login`; an
  authenticated login page redirects to `/editor`; development asset uploads
  require the same session and origin boundary before file handling.
- The private `/framekit/render/[id]` path remains independent and token-only.
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
- unsafe cookie operations reject missing and cross-origin `Origin` headers;
- valid same-origin login sets all cookie attributes;
- HTTPS reverse-proxy integration accepts same-origin login and an authenticated
  account mutation while the container receives HTTP;
- protected editor and brand routes redirect without a session;
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
