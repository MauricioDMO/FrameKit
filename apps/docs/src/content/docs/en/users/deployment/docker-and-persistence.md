---
title: Docker and persistence
description: Build and run the canonical FrameKit container with Chromium, a non-root process, and durable SQLite storage.
sidebar:
  order: 3
---

The generated consumer template includes a multi-stage Dockerfile for the supported long-lived Node deployment. It builds the Next.js standalone output, installs Chromium with Linux dependencies, runs as the `node` user, and starts through `tini`.

## Build and run

From a generated project containing the canonical `Dockerfile`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml`:

```bash
docker build --tag framekit-app .
docker volume create framekit-data
docker run --detach \
  --publish 3000:3000 \
  --env FRAMEKIT_ADMIN_PASSWORD='replace-with-a-strong-password' \
  --mount type=volume,source=framekit-data,target=/data \
  --name framekit-app \
  framekit-app
```

The template Dockerfile uses pnpm and requires both `pnpm-lock.yaml` and `pnpm-workspace.yaml`. If project creation omitted dependency installation, run `pnpm install` from the project root before `docker build`. Pass the remaining public configuration through the container environment as needed. Do not copy a secret `.env` file into the image. The container listens on port `3000` and the image sets `/data/framekit.sqlite` as the default `FRAMEKIT_DATABASE_PATH`; the runtime environment can override it.

**Warning:** Do not use `.env.example` unchanged as the container's `--env-file`. Its `FRAMEKIT_DATABASE_PATH=.framekit-data/framekit.sqlite` overrides the Docker default `/data/framekit.sqlite`, so SQLite will not use the mounted `/data` volume. Omit that variable for the container or set it explicitly to `/data/framekit.sqlite`, and keep the other secrets in the runtime environment.

## What the image does

The build stages use Node 22 and pnpm `11.14.0`. The builder runs `pnpm build` and checks for `.framekit/next/standalone/server.js`. The runner installs production dependencies and executes `framekit browser install --with-deps`.

The runner sets these image-level variables:

| Variable | Image value | Meaning |
| --- | --- | --- |
| `NODE_ENV` | `production` | Runtime mode. |
| `HOSTNAME` | `0.0.0.0` | Container bind hostname. |
| `PORT` | `3000` | Container and renderer port. |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` | Installed Chromium location. |
| `FRAMEKIT_DATABASE_PATH` | `/data/framekit.sqlite` | Default SQLite path set by the image; the runtime environment can override it. |

`NODE_ENV`, `HOSTNAME`, and `PLAYWRIGHT_BROWSERS_PATH` are image operational settings, not public FrameKit configuration choices. `FRAMEKIT_ADMIN_PASSWORD`, `FRAMEKIT_ADMIN_USERNAME`, `FRAMEKIT_ALLOWED_IMAGE_HOSTS`, and render limits remain deployment environment values.

The final image creates `/data`, makes it writable by `node`, exposes port `3000`, drops root privileges with `USER node`, and uses `/usr/bin/tini --` as its entrypoint before `node server.js`.

## SQLite persistence

Mount `/data` as durable storage if users, sessions, and API-token metadata must survive container replacement. Without a durable mount, the image's prepared directory is part of the container filesystem and can be lost when the container is replaced. Ensure a bind mount or volume is writable by the `node` user.

SQLite persistence does not persist render jobs. Render jobs are held in process memory, have a 120-second TTL, and are intentionally unavailable after a process restart. A replacement container can recover the database-backed account and token state while an in-flight or test render job is gone.

## Restart check

After the first login and token creation, restart or replace the container while keeping the same `/data` volume. The account and session database should remain available. A render job created before the process replacement should not be expected to remain available; submit a new image request instead.
