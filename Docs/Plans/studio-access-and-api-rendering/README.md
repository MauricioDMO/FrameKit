# Studio Access, API Tokens, and Server-backed Export

- **Status:** Phases 4-5.5 implemented and verified on 2026-09-15; Phase 6 implemented and verified on 2026-09-16; Phases 7-8 remain pending.
- **GitHub issue:** Not assigned.
- **Release:** No version preselected.
- **Depends on:** Verified Server Image Rendering Steps 1-7.
- **Must finish before:** Server Image Rendering Step 8 final revalidation and
  closure, and Maintainability Phase 6.
- **Target runtime:** One long-lived Node.js process per application container.
- **Primary package:** `@mauriciodmo/framekit`.
- **Canonical consumer:** `packages/create-framekit/template/`.

## Purpose

Require authenticated access to the canonical FrameKit Studio, support simple
local users and API tokens, and move Studio Download PNG and Copy PNG onto the
existing server-rendering pipeline.

This is a cross-cutting plan rather than an extension of one completed server
rendering step. It changes the reusable server package, Studio root integration,
the Studio client, generated bindings, application routes, Docker persistence,
tests, and public documentation.

Most technical evidence originally assigned to Server Image Rendering Step 8
has already been recorded against the browser-export baseline. That evidence
remains useful, but final Step 8 closure must wait until this plan is complete
and the resulting architecture is reverified.

Phase 4 is implemented and verified on 2026-09-15. Phase 5 is implemented and
verified on 2026-09-15: the reusable Studio provides authenticated login,
Settings account and token workflows, administrator user management, the
three-section route model, safe `StudioUser` handoff, and English/Spanish
accessibility coverage. The focused Studio checks passed 3 test files and 7
tests; the full FrameKit package suite passed 76 test files and 788 tests, and
package typecheck and lint passed. Phase 5.5 now exposes the unified
`/api/framekit/[...action]` adapter in Studio and the generated consumer,
dispatches `POST /api/framekit/images/render` to the Studio image handler, and
removes `/api/v1/images`. The image route uses only session or database API-token
authentication. Phase 6 is implemented in the current checkout: Studio
Download and Copy request PNGs from the authenticated image route and the
  browser capture and the legacy API-key contract have been removed. The
  FrameKit package suite passes 76 test files and 788 tests, creator tests pass 2
  files and 31 tests, Studio tests pass 3 files and 7 tests, and the E2E suite
  passes 3 tests. Workspace build, typecheck, and lint pass. Phases 7-8 remain
  pending. Server Image Rendering Step 8 final revalidation and closure remain
  blocked until this plan is complete.

## Target architecture

```text
                         SQLite
                 users / sessions / api_tokens
                            |
             +--------------+--------------+
             |                             |
      HttpOnly session                 Bearer token
             |                             |
             v                             v
      FrameKit Studio                External client
             |                             |
             +--------------+--------------+
                            |
                            v
              POST /api/framekit/images/render
                            |
                 session or token auth
                            |
                  shared image pipeline
                            |
               temporary globalThis Map
                            |
             private Chromium render route
                            |
                            v
                           PNG
                    download or clipboard
```

SQLite stores access data only. Temporary render jobs remain in the existing
process-local `globalThis + Map` store and are never persisted.

The private `/framekit/render/[id]` route continues to accept only its internal
render token. Studio sessions and API tokens must not grant access to that route.
No global Next.js Proxy or middleware is introduced.

## Ownership

| Concern | Owner |
|---|---|
| SQLite schema, migrations, users, password hashes, sessions, and API tokens | `@mauriciodmo/framekit/server` internals |
| Access and authenticated image handler factories | `@mauriciodmo/framekit/server` public facade |
| Session-aware Studio and login page factories | `@mauriciodmo/framekit/studio/root` |
| Login, account, token, and user-management UI | `@mauriciodmo/framekit/studio` |
| Concrete database file and runtime environment | Each application |
| Thin App Router files | Generated consumer and first-party Studio |
| Generated registry-bound Studio client | FrameKit codegen in each consumer |
| Persistent volume and deployment throttling | Application deployment |

Reusable behavior belongs under `packages/framekit/src/`. Application files
must use supported package exports and must not import package source directly.
The access implementation should be split only as each phase needs it; do not
pre-create empty abstractions or extension points.

## Scope

Included:

- SQLite through `node:sqlite`;
- one first-boot administrator;
- `admin` and `user` roles;
- login, logout, database sessions, and route protection;
- self-service username and password changes;
- administrator user creation, role changes, activation, password reset, and
  deletion;
- owner-scoped API-token creation, listing, and revocation;
- administrator token-metadata inspection and revocation;
- session or API-token authentication for the canonical image route;
- server-backed Studio download and clipboard export;
- persistent Docker storage;
- generated-consumer, package, browser, and Docker verification.

Excluded:

- OAuth, social login, email, recovery email, MFA, JWT, and refresh tokens;
- organizations, scopes, advanced RBAC, billing, and per-user quotas;
- PostgreSQL, an ORM, Redis, or a persistent render-job store;
- internal rate limiting;
- multiple application processes or replicas sharing one SQLite database;
- making files under `public/` or shipped client bundles confidential;
- changing the internal private-render token protocol.

Public username/password login requires deployment-level throttling at the
reverse proxy or load balancer. Public production deployment also requires
HTTPS. A deployment without those controls is outside the supported public
exposure contract.

## Data model

`users`:

```text
id              TEXT PRIMARY KEY
username        TEXT UNIQUE COLLATE NOCASE
password_hash   TEXT NOT NULL
role            TEXT CHECK(role IN ('admin', 'user'))
active          INTEGER CHECK(active IN (0, 1))
created_at      INTEGER NOT NULL
updated_at      INTEGER NOT NULL
```

`sessions`:

```text
token_hash      TEXT PRIMARY KEY
user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
created_at      INTEGER NOT NULL
expires_at      INTEGER NOT NULL
```

`api_tokens`:

```text
id              TEXT PRIMARY KEY
user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE
name            TEXT NOT NULL
token_prefix    TEXT NOT NULL
token_hash      TEXT UNIQUE NOT NULL
created_at      INTEGER NOT NULL
last_used_at    INTEGER NULL
revoked_at      INTEGER NULL
```

Tables use SQLite `STRICT` mode. Add indexes needed for session expiry and
user-owned session/token operations. The database never stores a plaintext
password, session secret, or complete API token.

SQLite is available without `--experimental-sqlite` from Node 22.13, but it
remains an active-development API in the Node 22 documentation. The
implementation must use only APIs present in the repository's minimum Node
version. In particular, use `PRAGMA busy_timeout` rather than the later
`DatabaseSync` constructor timeout option.

## Identity and secret contracts

- User IDs and API-token IDs use `crypto.randomUUID()`.
- The safe `StudioUser` DTO lives in `packages/framekit/src/studio/types.ts` and
  is exported from `@mauriciodmo/framekit/studio`. Server access internals may
  import that client-safe type, but client code must never import it from
  `@mauriciodmo/framekit/server`.
- Usernames are 3-64 ASCII letters, numbers, `.`, `_`, or `-`.
- Passwords are 12-256 UTF-8 bytes.
- Password hashes use asynchronous `crypto.scrypt` with a random 16-byte salt,
  a 64-byte derived key, and fixed `scrypt:v1` parameters `N=131072`, `r=8`,
  `p=1`, and `maxmem=268435456` bytes.
- Session and API-token secrets use 32 random bytes encoded as base64url.
- Session and API-token lookup stores only SHA-256 hashes.
- Generated API tokens use `fk_<base64url>`.
- API-token names are 1-80 trimmed characters.
- Session duration is a fixed 30 days with no sliding refresh.
- Missing, inactive, and wrong-password login attempts return the same public
  failure and perform equivalent scrypt work.

## Authorization contract

A normal user may use Studio, change their username and password, and create,
list, and revoke only their own API tokens.

An administrator may additionally list and manage users, create administrators,
reset another user's password, inspect token metadata, and revoke another
user's tokens. Administrators never receive password hashes, session secrets,
token hashes, or previously created token secrets.

FrameKit must never allow the last active administrator to be deleted,
deactivated, or changed to `user`. The check and mutation must occur in one
immediate transaction and return `409 Conflict` when rejected.

Disabling a user deletes their sessions and rejects their API tokens while the
account is inactive. Existing unrevoked API tokens become usable again after
reactivation. Password changes and resets invalidate sessions but do not revoke
API tokens. Deleting a user cascades sessions and API tokens.

## HTTP API contract

One thin catch-all route exposes the access and image actions:

```text
POST   /api/framekit/images/render

POST   /api/framekit/login
POST   /api/framekit/logout

GET    /api/framekit/account
PATCH  /api/framekit/account
POST   /api/framekit/account/password

GET    /api/framekit/tokens
POST   /api/framekit/tokens
DELETE /api/framekit/tokens/:id

GET    /api/framekit/users
POST   /api/framekit/users
PATCH  /api/framekit/users/:id
DELETE /api/framekit/users/:id
POST   /api/framekit/users/:id/password
GET    /api/framekit/users/:id/tokens
```

The handler owns exact method/path matching, bounded JSON parsing, input
validation, authentication, authorization, no-store responses, and stable
status codes. Cookie-authenticated unsafe requests, including login, require a
same-origin `Origin` header. Client-side visibility is never an authorization
boundary.

The access actions delegate to `createStudioAccessHandler()`. Image dispatch is
owned by the unified API handler and uses the same session/API-token boundary.

## Image authentication contract

The canonical Studio/generated route is:

```text
POST /api/framekit/images/render
```

```ts
createStudioImageHandler(templates)
```

The new handler accepts a valid active-user session or a valid unrevoked API
token. If an `Authorization` header is present, only that Bearer credential is
evaluated; an invalid Bearer token must not fall back to an ambient session.
Without an Authorization header, the handler evaluates the session cookie and
requires same-origin for the cookie-authenticated POST.

The public dispatcher delegates to one Studio image pipeline. Authentication
continues to happen before body parsing, template lookup, remote fetching, or
browser capacity reservation.

## First boot

When the database contains no users:

1. Require `FRAMEKIT_ADMIN_PASSWORD`.
2. Use `FRAMEKIT_ADMIN_USERNAME` or `admin`.
3. Create the active administrator.

After that transaction, environment values never synchronize account data
again. API tokens are created explicitly through the authenticated access API
or Studio settings.

## Canonical application shape

The starter grows from five to six maintained files under `src/app`:

```text
src/app/
  [section]/[[...slug]]/page.tsx
  login/page.tsx
  api/framekit/[...action]/route.ts
  framekit/render/[id]/page.tsx
  globals.css
  layout.tsx
```

`[section]` accepts `editor`, `brand`, and `settings`. Generated registries and
client bindings remain ignored output and are not copied into the starter.

## Runtime environment

```text
# First empty-database boot only
FRAMEKIT_ADMIN_USERNAME=admin
FRAMEKIT_ADMIN_PASSWORD=replace-with-a-secure-password

# Persistent access data
FRAMEKIT_DATABASE_PATH=.framekit-data/framekit.sqlite

# Rendering
FRAMEKIT_INTERNAL_ORIGIN=http://127.0.0.1:3000
FRAMEKIT_ALLOWED_IMAGE_HOSTS=
FRAMEKIT_MAX_CONCURRENT_RENDERS=2
FRAMEKIT_RENDER_TIMEOUT_MS=30000

```

The current Dockerfile leaves `FRAMEKIT_DATABASE_PATH` unset. Phase 7 proposes
setting `FRAMEKIT_DATABASE_PATH=/data/framekit.sqlite`; `/data` must be a
writable persistent volume owned by the runtime user.

## Ordered phases

| Phase | Plan | Result | Depends on |
|---:|---|---|---|
| 1 | [SQLite and migrations](./01-sqlite-and-migrations.md) | Persistent package-owned schema and connection lifecycle | Server Steps 1-7 |
| 2 | [Users, passwords, and bootstrap](./02-users-passwords-and-bootstrap.md) | Credentials and first admin | Phase 1 |
| 3 | [Sessions, HTTP, and route protection](./03-sessions-http-and-route-protection.md) | Login/logout, protected Studio pages, and protected dev upload | Phase 2 |
| 4 | [API tokens, users, and authorization](./04-api-tokens-users-and-authorization.md) | Owner/admin operations and token authentication | Phase 3 |
| 5 | [Studio access UI](./05-studio-access-ui.md) | Login, account, token, and user interfaces (implemented and verified 2026-09-15) | Phase 4 |
| 5.5 | [FrameKit API namespace](./05.5-framekit-api-namespace.md) | Unversioned catch-all API and `/images/render` route | Phases 3-5; image-render baseline |
| 6 | [Authenticated image API and export](./06-authenticated-image-api-and-export.md) | Shared image auth pipeline and server-backed Download/Copy | Phases 3-5.5 |
| 7 | [Generated consumer and Docker](./07-generated-consumer-and-docker.md) | Six-file starter and persistent production volume | Phases 1-6 |
| 8 | [Verification, documentation, and rollout](./08-verification-documentation-and-rollout.md) | Cross-workspace proof and final plan integration | Phases 1-7 |

Execute phases in order. Each phase includes focused tests and an exit gate; do
not defer its basic correctness coverage to Phase 8.

## Global sequence

```text
Maintainability 1-5
        |
Server Image Rendering 1-7
        |
Studio Access, API Tokens, and Server-backed Export 1-8
        |
Server Image Rendering Step 8 final revalidation and closure
        |
Maintainability 6
```

## Global completion criteria

- Studio routes require an active database session.
- First boot creates one administrator from explicit environment configuration.
- Passwords, sessions, and API tokens are never persisted in plaintext.
- Last-active-administrator mutations are rejected transactionally.
- Users can access only their own token secrets and metadata.
- Administrators can revoke other users' tokens without seeing their secrets.
- Disabled users cannot use sessions, API tokens, or the development asset
  endpoint.
- `/api/framekit/images/render` accepts a valid session or API token through the
  canonical handler.
- Studio Download PNG and Copy PNG use `/api/framekit/images/render`.
- `modern-screenshot` has no remaining runtime, build, test, lockfile, or
  documentation reference.
- The private Chromium route still uses only its independent internal token.
- SQLite persists users, sessions, and tokens across container replacement.
- Render jobs still clear on process restart.
- The creator produces a functional six-file application with authentication.
- Focused, repository, E2E, package, tarball, and Docker persistence gates pass.
- Public documentation states the HTTPS, external throttling, single-process,
  persistent-volume, and public-asset limitations.
- A browser integration behind an HTTPS reverse proxy accepts same-origin login
  and session mutations while Next.js runs on an internal HTTP origin.

## References

- [Node.js 22 SQLite documentation](https://nodejs.org/docs/latest-v22.x/api/sqlite.html)
- [Node.js 22 Crypto documentation](https://nodejs.org/docs/latest-v22.x/api/crypto.html)
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html)
- [Next.js authentication guide](https://nextjs.org/docs/app/guides/authentication)
- [Next.js cookies API](https://nextjs.org/docs/app/api-reference/functions/cookies)
