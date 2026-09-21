---
title: Troubleshoot deployment
description: Diagnose startup, Chromium, environment, persistence, proxy, and render-state problems in a FrameKit deployment.
sidebar:
  order: 8
---

Use [Deploy FrameKit](/en/users/deployment) for the supported topology, [Runtime and configuration](/en/users/deployment/runtime) for environment values, and [Docker and persistence](/en/users/deployment/docker-and-persistence) for the canonical image.

Authentication is not inferred from production mode. Missing or `false` means
open mode; set `FRAMEKIT_AUTH_ENABLED=true` explicitly before exposing a
production process to an untrusted network.

## The production process does not start

**Symptom:** `pnpm framekit start` exits without serving the application.

**Probable cause:** The production build has not completed, the runtime or port is invalid, or the built output is unavailable.

**Check:** Confirm Node.js is `>=22.13.0`, `PORT` is an integer from `1` to `65535`, and run the build separately.

**Fix:** Build and start from the project root:

```bash
pnpm framekit build
pnpm framekit start
```

`start` uses the existing production build and does not regenerate templates.

## Chromium is unavailable in production

**Symptom:** The application starts, but server-side PNG rendering fails because Chromium cannot launch.

**Probable cause:** Chromium or its Linux system dependencies are missing from the runtime image.

**Check:** Run the browser installation command in the same environment used by the production process.

**Fix:** Install the browser before building or use the canonical Dockerfile. On Linux, install system dependencies with:

```bash
pnpm framekit browser install --with-deps
```

## First login fails after deployment

**Symptom:** With `FRAMEKIT_AUTH_ENABLED=true`, the first login on an empty database returns a service-unavailable error.

**Probable cause:** `FRAMEKIT_ADMIN_PASSWORD` is missing or invalid, or the optional username is invalid.

**Check:** Confirm the runtime environment has a password of 12–256 UTF-8 bytes and, when set, a username of 3–64 ASCII letters, numbers, `.`, `_`, or `-`.

**Fix:** Set valid runtime values before the first login. The bootstrap values
create the first administrator only and do not replace existing users. They are
ignored when auth is disabled. See [Studio access troubleshooting](/en/users/troubleshooting/access).

## Users or tokens disappear after a restart

**Symptom:** In authenticated mode, accounts, sessions, or API-token metadata are missing after a container replacement or process restart.

**Probable cause:** The SQLite directory is not durable, the configured path changed, or the database directory is not writable.

**Check:** Confirm `FRAMEKIT_DATABASE_PATH`; by default it is `.framekit-data/framekit.sqlite` relative to the process working directory. In the canonical Docker image it is `/data/framekit.sqlite`.

**Fix:** Mount the directory containing the database as durable storage and ensure the runtime user can write it. Do not use `:memory:` when state must survive a restart. Open mode does not initialize SQLite, and switching to it does not delete an existing database.

## Cookie-authenticated requests fail behind a proxy

**Symptom:** With authentication enabled, a browser mutation returns `403` even though the user is signed in.

**Probable cause:** The request `Origin` does not match the public origin derived by the server from the forwarded protocol and host.

**Check:** Confirm that the proxy forwards the public HTTPS scheme and host consistently and that the browser sends the public `Origin`.

**Fix:** Correct the proxy forwarding configuration. Do not disable same-origin checks or put a session cookie in a URL. For server-side image calls, use a Bearer token only when authentication is enabled; open mode needs no credential. See [Security and reverse proxies](/en/users/deployment/security-and-reverse-proxies).

## Remote images fail only after deployment

**Symptom:** A remote image renders locally but fails in production.

**Probable cause:** The production process does not have the exact hostname in `FRAMEKIT_ALLOWED_IMAGE_HOSTS`, or the remote response fails the HTTPS, raster, size, or redirect checks.

**Check:** Compare the runtime allowlist with the image URL's hostname and inspect the remote response from the server environment.

**Fix:** Set the exact required hostnames in the production environment, then retry with an HTTPS PNG, JPEG, WebP, or GIF within the supported size limit. See [Troubleshoot image rendering](/en/users/troubleshooting/rendering).

## Render requests do not work across processes

**Symptom:** A deployment can serve Studio, but a render request fails when the request path crosses process or container boundaries.

**Probable cause:** Render capacity, browser state, and temporary render state are local to the process handling the request.

**Check:** Confirm that the deployment uses the supported one long-lived Node.js process per container and that the image API and private render route reach that same process.

**Fix:** Keep the API request and its private render handoff on the same long-lived process. Put HTTPS and request throttling in front of that process as described in [Deploy FrameKit](/en/users/deployment).
