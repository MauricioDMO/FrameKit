# Phase 8 - Verification, Documentation, and Rollout

## Goal

Prove the complete access and server-export architecture across package logic,
Next.js integration, browser behavior, generated consumers, Docker persistence,
distribution, documentation, and the surrounding FrameKit plans.

## Depends on

- Phases 1-7 with passing focused exit gates.
- Built FrameKit and creator tarballs.
- An isolated creator-generated consumer outside the workspace.
- The verified Server Image Rendering Steps 1-7 baseline.

## Verification levels

| Level | Proves |
|---|---|
| Unit/component | Schema, credentials, sessions, authorization, handlers, and UI states |
| Next integration | Dynamic pages, cookies, generated bindings, thin routes, and private-route isolation |
| Browser E2E | Login, Studio workflows, server-backed PNG download, and authorization UX |
| Docker smoke | Non-root standalone runtime, Chromium, SQLite volume persistence, and restart behavior |
| Tarball smoke | Public exports and creator output work outside the monorepo |

Passing one level does not replace another.

## Final test inventory

Database and credentials:

- schema, migration, strict types, foreign keys, WAL, and busy timeout;
- lazy initialization and process-global connection reuse;
- password hash/verify/malformed/dummy-work behavior;
- first-boot administrator username/password behavior and recurring-startup
  behavior;
- username uniqueness and last-active-administrator transactions.

Sessions and HTTP:

- create, validate, expire, logout, and password invalidation;
- inactive/deleted-user rejection;
- bounded exact body parsing;
- same-origin enforcement for cookie-authenticated mutations;
- stable `400`, `401`, `403`, `404`, `409`, and configuration failures;
- no sensitive fields in responses or logs;
- development asset upload protection.

Users and tokens:

- owner isolation and administrator authorization;
- one-time generated secret and hash-only persistence;
- revoke, inactive owner, reactivation, and last-used behavior;
- session invalidation and cascade deletion semantics.

Image API and Editor:

- session and API-token Studio-handler success;
- invalid Bearer precedence over ambient session;
- authentication before body/template/fetch/browser work;
- exact Studio request with template, variant, and user edits;
- PNG download and clipboard Blob behavior;
- duplicate-click guard;
- structured `422` field errors and first-control focus;
- generic error alert;
- no `modern-screenshot` references;
- private render route accepts only its internal token.

Generated consumer and Docker:

- six maintained app files;
- generated-only client bindings;
- clean generate/check/build/start;
- non-root Chromium rendering;
- database volume ownership and persistence across two containers;
- render jobs remain process-local and disappear after restart;
- tarballs contain no secrets, databases, workspace references, or browsers.

Runtime environment:

- verify the six FrameKit-specific application variables: first-boot
  `FRAMEKIT_ADMIN_USERNAME` and `FRAMEKIT_ADMIN_PASSWORD`, persistent
  `FRAMEKIT_DATABASE_PATH`, rendering `FRAMEKIT_ALLOWED_IMAGE_HOSTS`,
  `FRAMEKIT_MAX_CONCURRENT_RENDERS`, and `FRAMEKIT_RENDER_TIMEOUT_MS`, plus the
  trusted process `PORT` setting used to infer `http://localhost:${PORT}`;
- verify the administrator values are read only for an empty database,
  `FRAMEKIT_DATABASE_PATH` points to the persistent volume, and the rendering
  defaults and bounds are applied as documented;
- verify the runtime-only administrator password is not committed, passed during
  image build, or stored in image layers;
- verify the canonical image route uses only a same-origin session or database
  API token, while access mutations retain their session boundary;
- verify `FRAMEKIT_PUBLIC_ORIGIN` is not read or supported.

## Browser E2E

Primary flow:

```text
empty test database
  -> bootstrap administrator
  -> login
  -> open editor
  -> modify template fields and variant
  -> Download PNG through /api/framekit/images/render
  -> verify filename, PNG signature, and dimensions
  -> create API token
  -> call image API with Bearer token
  -> verify PNG
```

Authorization flow:

```text
administrator creates user
  -> user logs in
  -> user creates own token
  -> user cannot see Users area or administrator token metadata
  -> administrator revokes user token
  -> image API returns 401 for revoked token
  -> administrator disables user
  -> user session is rejected
```

Reverse-proxy CSRF flow:

```text
browser opens https://framekit.example.com
  -> representative reverse proxy forwards to http://127.0.0.1:3000
  -> Origin remains https://framekit.example.com
  -> login succeeds
  -> authenticated account mutation succeeds
  -> session-authenticated image request succeeds
```

Run this against Next.js rather than only unit-testing constructed `Request`
objects. Verify that the supported proxy headers let the access handler derive
the browser's canonical HTTPS origin even when `new URL(request.url).origin`
contains the internal hostname and port; direct starts using Next's wildcard
bind host must also accept the validated `Host` authority. Do not introduce
`FRAMEKIT_PUBLIC_ORIGIN`: the current contract does not support it or use it as a
fallback. The handler must use the validated request and supported forwarding
headers instead.

Use an isolated temporary database per E2E run and clean it through the test
harness. Do not depend on a developer's local `.framekit-data` directory.

## Documentation rollout

Audit and update at minimum:

```text
README.md
README.es.md
packages/framekit/README.md
packages/create-framekit/README.md
packages/create-framekit/template/README.md
Docs/en/guides/studio.md
Docs/es/guides/studio.md
Docs/en/reference/public-api.md
Docs/es/reference/public-api.md
Docs/en/reference/cli.md
Docs/es/reference/cli.md
Docs/en/development/troubleshooting.md
Docs/es/development/troubleshooting.md
Docs/en/development/testing-and-distribution.md
Docs/es/development/testing-and-distribution.md
Docs/en/getting-started/migration-next.md
Docs/es/getting-started/migration-next.md
CHANGELOG.md
```

Document:

- first-boot versus recurring environment behavior;
- user roles and last-administrator protection;
- session and API-token storage/expiry/revocation;
- one-time API-token display;
- session/API-token image-handler authentication;
- server-backed Studio download/copy and local preview;
- removal of `modern-screenshot`;
- persistent `/data` volume and backup responsibility;
- Node 22 `node:sqlite` active-development status;
- one-process/one-volume topology;
- required HTTPS and deployment-level login throttling;
- public static-asset/client-bundle limitation;
- no global middleware and unchanged private-render token.

Update canonical skill sources only under `Docs/skills/`, then run
`pnpm sync:skills`. Never edit synchronized copies directly.

## Plan integration

Update `Docs/Plans/README.md` so the global order is:

```text
Maintainability 1-5
  -> Server Image Rendering 1-7
  -> Studio Access and API Rendering 1-8
  -> Server Image Rendering Step 8 final revalidation/closure
  -> Maintainability 6
```

Revalidate the already reconciled Server Image Rendering documents without
erasing completed history:

- retain Steps 1-7 evidence;
- mark Step 8 final closure as blocked by this plan;
- state that SQLite persists access data, not render jobs;
- keep the five-file starter target marked historical and six files active;
- keep any pre-session shared-secret authentication marked historical;
- mark any old API-key-only smoke or authentication text as historical; current
  smoke must log in and create/use a database API token;
- keep browser-based Studio export marked historical;
- rerun every affected Step 8 assertion before closing that plan.

Revalidate Maintainability Phase 6 against:

- `src/server/access/**` and `node:sqlite`;
- server-root access to request cookies and database sessions;
- client-safe `StudioUser` handoff;
- access and authenticated-image route adapters;
- development tooling's authenticated asset boundary;
- the six-file canonical starter;
- persistent application data versus ephemeral render jobs.

## Migration and compatibility

This rollout is not entirely additive. Existing consumers that use
`createStudioPage()` adopt database-backed Studio access and must configure the
first administrator and persistent database path. `FRAMEKIT_ADMIN_PASSWORD` is
required for the first empty-database bootstrap; `FRAMEKIT_ADMIN_USERNAME` is
optional and defaults to `admin`. Later environment changes do not rename the
administrator or change its password. Document this before release.

Current boundaries:

- the canonical `createFrameKitApiHandler` dispatches the image path to
  `createStudioImageHandler`, which accepts a same-origin session or database
  API token;
- API tokens are generated explicitly through the authenticated access API and
  stored only as hashes in SQLite;
- existing template definitions, registries, variants, fields, and assets do not
  migrate;
- the private render route and temporary Map protocol do not migrate;
- direct `FrameKitStudio` component use remains possible, but a Client Component
  alone is not an authentication boundary.

There is no compatibility adapter for the removed pre-session image contract.
Keep the SQLite volume when rolling back so access data is not accidentally
deleted; use a package version with a matching schema and access contract.

## Commands

After manifest changes, update the lockfile from the repository root:

```bash
pnpm install
```

Run focused checks while implementing:

```bash
pnpm --filter @mauriciodmo/framekit test
pnpm --filter studio test
pnpm --filter @mauriciodmo/create-framekit test
pnpm test:e2e
```

Run the complete repository gate after building FrameKit before commands that
invoke its generated CLI:

```bash
pnpm check:runtime
pnpm --filter @mauriciodmo/framekit build
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @mauriciodmo/framekit pack
pnpm --filter @mauriciodmo/create-framekit pack
```

Then run isolated tarball and local Docker persistence smokes according to the
current testing and distribution guide. The registry-backed Docker smoke remains
a separate post-publication handoff requiring an exact published version.

## Final acceptance checklist

- [ ] Empty database bootstrap requires explicit administrator credentials.
- [ ] Environment bootstrap never overwrites existing account data.
- [ ] Passwords, sessions, and API tokens are hash-only at rest.
- [ ] Last-active-administrator mutations fail transactionally.
- [ ] Protected Studio routes, cookie-authenticated access mutations, and
  development asset writes require an active session.
- [ ] API-token owner and administrator boundaries pass.
- [ ] Cookie mutations reject cross-origin requests.
- [ ] Same-origin cookie requests pass through the supported HTTPS-to-HTTP
  reverse-proxy topology without extra origin configuration.
- [ ] Public deployment requirements state HTTPS and external login throttling.
- [ ] All six FrameKit-specific application variables and the standard `PORT` setting have
  documented first-boot, persistent, and rendering verification.
- [ ] Canonical image API accepts a session or API token.
- [ ] `FRAMEKIT_PUBLIC_ORIGIN` is documented as unsupported.
- [ ] Studio Download PNG and Copy PNG use the server API.
- [ ] Local preview behavior remains unchanged.
- [ ] `modern-screenshot` is absent from source, tests, build, lockfile, and docs.
- [ ] Private render accepts only its internal token.
- [ ] Six-file creator output works from packed packages.
- [ ] SQLite persists through container replacement using one volume.
- [ ] Render jobs remain memory-only and clear on restart.
- [ ] Public assets and client-bundle confidentiality limitations are documented.
- [ ] English and Spanish public documentation agree.
- [ ] Canonical skills are synchronized from `Docs/skills/`.
- [ ] Focused, repository, E2E, tarball, and Docker gates pass.
- [ ] Server Image Rendering Step 8 is revalidated against this final baseline.
- [ ] Maintainability Phase 6 baseline includes the final access architecture.

## Exit gate

Phase 8 and this plan are complete only when every checklist item passes, the
two-container persistence smoke succeeds, public documentation matches shipped
behavior, and Server Image Rendering Step 8 is ready for final evidence and
closure against this architecture.
