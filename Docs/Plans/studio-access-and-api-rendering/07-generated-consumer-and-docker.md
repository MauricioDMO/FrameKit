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

The maintained `src/app` inventory becomes exactly seven files:

```text
[section]/[[...slug]]/page.tsx
login/page.tsx
api/framekit/[...action]/route.ts
api/v1/images/route.ts
framekit/render/[id]/page.tsx
globals.css
layout.tsx
```

The login, access, image, Studio, and private-render files contain only static
route configuration and supported package bindings. Do not move reusable auth
or database behavior into the starter.

Generated `templates.ts`, `brands.ts`, `studio-client.tsx`, and
`render-client.tsx` remain absent from the creator template and are recreated by
normal FrameKit generation.

Update creator, tarball smoke, and documentation assertions that currently
require a five-file application.

## Generated configuration

The starter `.env.example` documents:

```text
FRAMEKIT_ADMIN_USERNAME=admin
FRAMEKIT_ADMIN_PASSWORD=replace-with-a-secure-password
FRAMEKIT_DATABASE_PATH=.framekit-data/framekit.sqlite
FRAMEKIT_INTERNAL_ORIGIN=http://127.0.0.1:3000
FRAMEKIT_ALLOWED_IMAGE_HOSTS=
FRAMEKIT_MAX_CONCURRENT_RENDERS=2
FRAMEKIT_RENDER_TIMEOUT_MS=30000
FRAMEKIT_API_KEY=
```

Explain that administrator values are first-empty-database inputs, while
`FRAMEKIT_API_KEY` remains available for the classic handler and one-time legacy
import.

The starter `_gitignore` and `.dockerignore` exclude `.framekit-data` so local
credentials cannot enter source control or image build contexts.

## Docker persistence

Keep the current multi-stage build, pinned Chromium installation, `tini`, and
non-root runtime. In the runner stage:

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
or publish any of them in package tarballs or Docker layers.

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
2. Start container A with first-boot admin credentials and legacy API key.
3. Log in and create a generated API token.
4. Render one PNG with that token.
5. Stop and remove container A without deleting the volume.
6. Start container B from the same image and volume without changing account
   data.
7. Log in with the persisted administrator credentials.
8. Render with the previously created token.
9. Confirm bootstrap did not recreate or rename the administrator.
10. Confirm the render-job Map is empty after restart.
11. Remove containers, image, temporary consumer, and volume.

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
packages/create-framekit/template/src/app/api/v1/images/route.ts
packages/create-framekit/template/src/app/[section]/[[...slug]]/page.tsx
packages/create-framekit/src/__tests__/
scripts/smoke-docker.mjs
scripts/smoke-tarballs.mjs
```

The first-party Studio receives equivalent thin route adapters and E2E runtime
configuration but does not become a second canonical scaffold.

## Focused tests and checks

- creator copies login, access, image, private-render, Docker, and environment
  files;
- generated consumer has exactly seven maintained app files;
- generated bindings are absent before generation and correctly recreated;
- `StudioClient` generation includes the safe user prop;
- database directories are ignored by Git and Docker;
- image build contains no environment secret or database;
- final process runs as `node` under `tini`;
- `/data` is writable by the runtime user;
- browser install and server startup remain functional;
- named-volume restart preserves users, sessions, and tokens;
- process restart clears temporary render jobs;
- packed packages and generated output contain no database, secret, workspace
  reference, or browser binary.

## Exit gate

Phase 7 is complete when an isolated creator-generated consumer builds and starts
from packed packages, its seven-file route shape is exact, and the two-container
Docker smoke proves persistent access data plus ephemeral render jobs under the
documented one-process topology.
