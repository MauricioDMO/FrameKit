# Phase 7 - Generated Consumer and Docker

## Goal

Make authentication and access data persistence part of the canonical generated
application and prove that users, sessions, and API tokens survive container
replacement.

## Depends on

- Phases 1-6 package, route, generated-binding, and image-handler behavior.
- The current standalone Next.js Docker image and FrameKit browser installer.
- The creator's canonical template-copy and clean-generation tests.

## Canonical application files

The maintained `src/app` inventory becomes exactly six files:

```text
[section]/[[...slug]]/page.tsx
login/page.tsx
api/framekit/[...action]/route.ts
framekit/render/[id]/page.tsx
globals.css
layout.tsx
```

The login, unified API, Studio, and private-render files contain only static
route configuration and supported package bindings. Do not move reusable auth
or database behavior into the starter.

Generated `templates.ts`, `brands.ts`, `studio-client.tsx`, and
`render-client.tsx` remain absent from the creator template and are recreated by
normal FrameKit generation.

Keep creator, tarball smoke, and documentation assertions aligned with the
six-file application; mark any five-file requirement as historical. The access
and image API share the single
`api/framekit/[...action]/route.ts` adapter from Phase 5.5.

## Generated configuration

The starter `.env.example` documents:

```text
# Required only while bootstrapping the first user in an empty database; use a strong password of at least 12 UTF-8 bytes.
FRAMEKIT_ADMIN_USERNAME=admin
FRAMEKIT_ADMIN_PASSWORD=replace-me-with-a-strong-password
FRAMEKIT_DATABASE_PATH=.framekit-data/framekit.sqlite
FRAMEKIT_INTERNAL_ORIGIN=http://127.0.0.1:3000
# Comma-separated exact hostnames. Leave empty to disable remote images.
FRAMEKIT_ALLOWED_IMAGE_HOSTS=
FRAMEKIT_MAX_CONCURRENT_RENDERS=2
FRAMEKIT_RENDER_TIMEOUT_MS=30000
```

These are the seven application variables. `FRAMEKIT_ADMIN_USERNAME` defaults to
`admin`, and `FRAMEKIT_ADMIN_PASSWORD` is required only while bootstrapping an
empty database. Neither value changes an existing account. `FRAMEKIT_DATABASE_PATH`
defaults to `.framekit-data/framekit.sqlite` here and must point to persistent
storage in production. The rendering variables configure the internal loopback
origin, exact external-image hostname allowlist, process-local render capacity,
and request/render timeout. `FRAMEKIT_INTERNAL_ORIGIN` is required and must be an
HTTP loopback origin. An empty `FRAMEKIT_ALLOWED_IMAGE_HOSTS` disables external
remote-image hosts; the render limit accepts positive decimal integers from `1..32`
and defaults to `2`, while the timeout accepts positive decimal integers from
`1..120000` milliseconds and defaults to `30000`. Invalid values fail
configuration.

The canonical `createFrameKitApiHandler` dispatches the image path to
`createStudioImageHandler`; that image path accepts a same-origin session or
database API token. Access mutations remain session-authenticated. Do not commit
administrator credentials, pass them as Docker build arguments, or bake them into
image layers.
`FRAMEKIT_PUBLIC_ORIGIN` is not supported and must not be added as a fallback or
configuration setting.

The starter `_gitignore` and `.dockerignore` exclude `.framekit-data` so local
credentials cannot enter source control or image build contexts.

## Docker persistence

Phase 7 is still pending. The current template Dockerfile does not set
`FRAMEKIT_DATABASE_PATH=/data/framekit.sqlite` or create `/data`. Keep the
current multi-stage build, pinned Chromium installation, `tini`, and non-root
runtime; the following is the target runner-stage extension for this phase:

```dockerfile
ENV FRAMEKIT_DATABASE_PATH=/data/framekit.sqlite
RUN mkdir -p /data && chown node:node /data
```

Create and set ownership before `USER node`. Do not initialize or migrate the
database during image build. First request/runtime initialization owns that work.

Deploy `/data` as a persistent volume. A named volume is the canonical smoke
path. Bind mounts are supported only when the host directory is writable by the
container's `node` user.

The SQLite file, `-wal`, and `-shm` files must share the same volume. Do not copy
or publish any of them in package tarballs or Docker layers. Losing or deleting
the volume loses users, sessions, and API-token data; backup and restore of that
volume are the operator's responsibility.

## Runtime boundaries

- One Node process per application container remains supported.
- One writable SQLite volume belongs to one active application instance.
- Multi-replica deployment against one local volume is not supported.
- Render jobs remain in memory and disappear on restart.
- Users, sessions, and API tokens persist across restart/replacement.
- Production browser login requires HTTPS.
- Public login requires reverse-proxy/load-balancer throttling.
- Static files and client bundles remain public deployment resources.

## Persistence smoke

Use one temporary named volume:

1. Build the final image from a clean generated consumer.
2. Start container A with first-boot admin username and password, mounting the
   temporary named volume at `/data`.
3. Log in, retain the session cookie, and create a generated API token.
4. Render one PNG with that token.
5. Stop and remove container A without deleting the volume.
6. Start container B from the same image and volume without changing account
   data.
7. Reuse the session cookie from container A against container B (for example,
   with `GET /api/framekit/account`) to verify session persistence.
8. Log in with the persisted administrator credentials.
9. Render with the previously created token.
10. Confirm bootstrap did not recreate or rename the administrator.
11. Confirm the render-job Map is empty after restart.
12. Remove containers, image, temporary consumer, and volume.

The smoke verifies PNG signature and IHDR dimensions without adding an image
decoder.

## Expected files

```text
packages/create-framekit/template/_gitignore
packages/create-framekit/template/.dockerignore
packages/create-framekit/template/.env.example
packages/create-framekit/template/Dockerfile
packages/create-framekit/template/src/app/login/page.tsx
packages/create-framekit/template/src/app/api/framekit/[...action]/route.ts
packages/create-framekit/template/src/app/[section]/[[...slug]]/page.tsx
packages/create-framekit/src/__tests__/
scripts/smoke-docker.mjs
scripts/smoke-tarballs.mjs
```

The first-party Studio receives equivalent thin route adapters and E2E runtime
configuration but does not become a second canonical scaffold.

## Focused tests and checks

- creator copies login, access, private-render, Docker, and environment files;
- generated consumer has exactly six maintained app files;
- generated bindings are absent before generation and correctly recreated;
- `StudioClient` generation includes the safe user prop;
- first boot and recurring startup cover all seven application variables without
  overwriting existing access data;
- the canonical image route succeeds with a session and with a generated API
  token;
- database directories are ignored by Git and Docker;
- image build contains no runtime-only secret or database;
- final process runs as `node` under `tini`;
- `/data` is writable by the runtime user;
- browser install and server startup remain functional;
- named-volume restart preserves users, sessions, and tokens;
- process restart clears temporary render jobs;
- packed packages and generated output contain no database, secret, workspace
  reference, or browser binary.

## Exit gate

Phase 7 is complete when an isolated creator-generated consumer builds and starts
from packed packages, its six-file route shape is exact, and the two-container
Docker smoke proves persistent access data plus ephemeral render jobs under the
documented one-process topology.
