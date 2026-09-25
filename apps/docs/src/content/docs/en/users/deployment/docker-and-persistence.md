---
title: Docker and persistence
description: Build and run the canonical FrameKit container, understand each Dockerfile stage, and persist authenticated state safely.
sidebar:
  order: 3
---

The generated FrameKit project includes a production-oriented multi-stage `Dockerfile`. It builds the Next.js standalone output, installs Chromium only in the runtime image, runs the application as the non-root `node` user, and starts through `tini`.

## Build and run

From a generated project containing the canonical `Dockerfile`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`:

```bash
docker build --tag framekit-app .
docker volume create framekit-data
docker run --detach \
  --publish 3000:3000 \
  --env FRAMEKIT_AUTH_ENABLED=false \
  --mount type=volume,source=framekit-data,target=/data \
  --name framekit-app \
  framekit-app
```

This explicit open-mode example needs no login, user, token, or SQLite database.
For an authenticated deployment, enable auth and provide the bootstrap secret:

```bash
docker run --detach \
  --publish 3000:3000 \
  --env FRAMEKIT_AUTH_ENABLED=true \
  --env FRAMEKIT_ADMIN_PASSWORD='replace-with-a-strong-password' \
  --mount type=volume,source=framekit-data,target=/data \
  --name framekit-app \
  framekit-app
```

Do not copy a secret `.env` file into the image. Pass secrets at runtime. The container listens on port `3000` and defaults `FRAMEKIT_DATABASE_PATH` to `/data/framekit.sqlite`.

:::caution
Do not use `.env.example` unchanged as the container's `--env-file`. Its local-development database path would override `/data/framekit.sqlite`, which prevents SQLite from using the mounted `/data` volume.
:::

## Dockerfile stages

The Dockerfile is split so build-time dependencies and runtime dependencies remain separate.

### `base`

```dockerfile
FROM node:22-bookworm-slim AS base
```

This stage provides the shared foundation for every later stage. It:

- uses Node.js 22 on Debian Bookworm slim;
- enables Corepack and activates pnpm `11.14.0`;
- sets `/app` as the working directory; and
- installs only the shared system package `ca-certificates`.

Keeping this setup in one stage avoids repeating Node and pnpm configuration.

### `build-deps`

This stage installs the full dependency graph required to compile the application:

```dockerfile
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install --frozen-lockfile
```

`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` prevents Playwright from downloading Chromium during dependency installation. The browser is not needed to install packages or compile the application, and downloading it here would duplicate browser files across Docker layers.

The pnpm store uses a BuildKit cache mount so repeated builds can reuse downloaded packages.

### `prod-deps`

This stage installs only production dependencies:

```dockerfile
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 pnpm install --prod --frozen-lockfile
```

The final runtime image copies `node_modules` from this stage instead of carrying development dependencies from the builder.

### `builder`

The builder copies the source tree and runs:

```bash
pnpm build
```

FrameKit generates the production Next.js standalone output under `.framekit/next/standalone/`. The Dockerfile immediately checks for:

```text
.framekit/next/standalone/server.js
```

This makes the image build fail early if the expected production artifact was not generated.

### `runner`

The final stage contains only what is needed to execute the built application.

It copies production dependencies, installs `tini`, and then runs:

```bash
./node_modules/.bin/framekit browser install --with-deps
```

This installs Chromium and the Linux libraries required by the FrameKit renderer. `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` gives the browser a predictable location inside the image.

The stage then copies the generated standalone application, creates `/data`, changes ownership to the `node` user, drops root privileges, exposes port `3000`, and starts the application with:

```text
/usr/bin/tini -- node server.js
```

`tini` acts as PID 1 and forwards Unix signals correctly, which helps the Node process shut down cleanly when the container is stopped.

## Image environment

The runner sets these image-level defaults:

| Variable | Image value | Meaning |
| --- | --- | --- |
| `NODE_ENV` | `production` | Runs the application in production mode. |
| `HOSTNAME` | `0.0.0.0` | Accepts traffic from outside the container. |
| `PORT` | `3000` | Application and renderer port. |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` | Location of the installed Chromium browser. |
| `FRAMEKIT_DATABASE_PATH` | `/data/framekit.sqlite` | Default SQLite location for authenticated deployments. |

The Dockerfile does not enable authentication. Set `FRAMEKIT_AUTH_ENABLED` explicitly at runtime.

## Why the image runs as `node`

The browser installation step requires root privileges because Linux packages are installed with `apt`. After the image is prepared, FrameKit itself does not need to run as root.

The Dockerfile therefore creates the writable `/data` directory, assigns it to `node`, and switches to:

```dockerfile
USER node
```

This reduces the privileges available to the application process while still allowing SQLite to write to `/data`.

## SQLite persistence

Mount `/data` as durable storage when authentication is enabled and users, sessions, or API-token metadata must survive container replacement.

Without a durable volume or bind mount, the database lives in the disposable container filesystem.

Open mode does not initialize SQLite, so `/data` is not required for account persistence when `FRAMEKIT_AUTH_ENABLED=false`.

SQLite persistence does not persist render jobs. Render jobs live in process memory and are intentionally lost when the process is restarted or replaced.

## Restart check

For authenticated mode, after the first login and token creation, restart or replace the container while keeping the same `/data` volume. The account and token state should remain available.

A render job created before process replacement should not be expected to survive; submit a new render request instead.
