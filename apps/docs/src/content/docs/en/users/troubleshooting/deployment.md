---
title: Troubleshoot deployment
description: Diagnose startup, Chromium, environment, persistence, proxy, and topology problems in a FrameKit deployment.
sidebar:
  order: 4
---

Use [Deploy FrameKit](/en/users/deployment) for the supported topology and [Docker and persistence](/en/users/deployment/docker-and-persistence) for the canonical image.

## The process does not start

Check the runtime and port first:

- Node.js is `>=22.13.0`.
- `PORT` is an integer from `1` to `65535`.
- Development host selection uses `FRAMEKIT_HOST`, then `HOST`, then `localhost`.
- Production starts only after `pnpm framekit build` has completed successfully.

Run the build and start commands separately so a generation or standalone-output failure is visible:

```bash
pnpm framekit build
pnpm framekit start
```

`start` does not regenerate templates. If source templates changed, run `pnpm framekit check` or `pnpm framekit generate` before rebuilding.

## Chromium is unavailable

Install the browser used by the renderer:

```bash
pnpm framekit browser install
```

On Linux, add `--with-deps`. The canonical Dockerfile performs `framekit browser install --with-deps` in the runner image and sets `PLAYWRIGHT_BROWSERS_PATH=/ms-playwright`. Rebuild the image after changing the browser installation step.

## First login fails on a new deployment

On an empty database, the login request runs bootstrap before credential authentication and needs `FRAMEKIT_ADMIN_PASSWORD` for that bootstrap. `FRAMEKIT_ADMIN_USERNAME` is optional and defaults to `admin`. The password must be 12-256 UTF-8 bytes and the username must satisfy the current account rules.

Set these as runtime environment values before the first login. They bootstrap the first user only; changing them later does not replace existing users. With an empty database, missing or invalid bootstrap configuration returns `503 service_unavailable`. With existing users, incorrect login credentials return `401 unauthorized`. A generic SQLite initialization failure returns `500 internal_error`.

## Account state disappears after a restart

Check `FRAMEKIT_DATABASE_PATH` and its storage:

- The default path is `.framekit-data/framekit.sqlite` relative to the process working directory.
- The canonical Docker image sets the path to `/data/framekit.sqlite`.
- A container must mount `/data` as a durable volume for SQLite state to survive replacement.
- The database directory must be writable by the `node` user in the final image.

Sessions and API-token metadata are SQLite state. Render jobs are process memory and are expected to disappear after a restart even when the database volume is preserved.

## Cookie requests fail behind a proxy

For cookie-authenticated mutations, send the public `Origin` and configure the proxy to forward the public HTTPS scheme and host consistently. A request with an origin that does not match the server's derived origin returns `403`. Use a Bearer token from a trusted server-side caller for image rendering when a browser session is not appropriate.

Do not disable same-origin checks or copy a session cookie into a URL. See [Security and reverse proxies](/en/users/deployment/security-and-reverse-proxies).

## Remote images fail only in production

The image renderer fetches remote images from the server process. Set `FRAMEKIT_ALLOWED_IMAGE_HOSTS` to the exact hostnames required by the templates. HTTPS, raster MIME/signature checks, the 8 MB prepared-image limit, and the redirect limit still apply in every environment.

## Multiple containers do not share render state

The supported deployment is one long-lived Node process per container. Render capacity, the Chromium singleton, and the 120-second render-job map are process-local. A load balancer or replica set cannot assume that a job created in one process can be loaded by another. Use the supported single-process topology instead of treating the in-memory job map as a queue.
