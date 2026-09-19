---
title: Runtime and configuration
description: Configure the Node runtime, Chromium renderer, database, image hosts, capacity, and render timeout.
sidebar:
  order: 2
---

## Runtime requirements

Generated projects target Node.js `>=22.13.0` and pnpm `>=11.14.0`. The server-side renderer requires the Playwright Chromium browser:

```bash
pnpm framekit browser install
```

On Linux machines where browser system dependencies are not already installed, use:

```bash
pnpm framekit browser install --with-deps
```

Build before starting production:

```bash
pnpm framekit build
pnpm framekit start
```

The browser is a singleton for the process. Each request receives an isolated browser context and page, and the request releases its capacity, page, context, and temporary render job during cleanup. The browser is not closed automatically after inactivity, and the public server API does not provide a shutdown operation for normal request handling.

## FrameKit variables

These are the application variables in the canonical template. Values are read by the bootstrap, database, development server, or image-render configuration at the points described below.

| Variable | Default | Contract and read point |
| --- | --- | --- |
| `FRAMEKIT_ADMIN_USERNAME` | `admin` | Optional bootstrap username for the first user in an empty database. It must be 3-64 ASCII letters, numbers, `.`, `_`, or `-`. It is not a later user-sync setting. |
| `FRAMEKIT_ADMIN_PASSWORD` | None | Required only while bootstrapping the first user in an empty database. It must be 12-256 UTF-8 bytes. Keep it in the runtime environment. |
| `FRAMEKIT_DATABASE_PATH` | `.framekit-data/framekit.sqlite` | SQLite path resolved from the process working directory when the database opens. `:memory:` is explicitly non-persistent. |
| `PORT` | `3000` | A decimal port from `1` to `65535`. It configures the server port and the renderer's private loopback origin. |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Empty | Comma-separated exact hostnames for HTTPS remote image inputs. Hostnames are lowercased, limited to 253 characters, and IP literals are rejected. Empty disables remote image fetching. |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | `2` | Positive integer from `1` to `32`. It limits active renders in the process. |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | `30000` | Positive integer from `1` to `120000` milliseconds. It aborts or cancels render work after the configured duration. Page and context cleanup is attempted in `finally`; that cleanup wait has no separate documented limit. |

The image handler parses its render configuration when it handles an image request. An invalid port, allowlist, capacity, or timeout value returns `api_not_configured` rather than silently using an invalid value.

## Development server host variables

`FRAMEKIT_HOST` and `HOST` apply to `framekit dev`, not to the public image-render configuration. The development server chooses `FRAMEKIT_HOST` first, then `HOST`, then `localhost`. `PORT` is shared and defaults to `3000`; invalid values outside `1-65535` stop startup.

The development server also exposes the protected `POST /framekit/assets` upload route for Studio image uploads. That route is a development-server capability and is not part of `/api/framekit/**` production API routing.

## Render lifecycle

The process allows only the configured number of simultaneous renders. A render uses a temporary job identifier and token in a process-local `Map`; the job has a 120-second TTL and is deleted after the request completes. The job store is lost on restart. The renderer creates a headless Chromium context with the template dimensions, blocks unrelated navigation, waits for fonts and images, captures a PNG, and closes the request context and page.
