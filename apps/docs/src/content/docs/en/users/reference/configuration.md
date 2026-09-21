---
title: Configuration
description: Configure a FrameKit project with its current environment variables, aliases, and generated-project defaults.
sidebar:
  order: 2
---

FrameKit configuration comes from the generated project, its environment, and the public package entrypoints. Keep secrets in the runtime environment; `.env.example` is a template, not a deployment secret store.

:::caution
Before exposing a production project to an untrusted network, explicitly set
`FRAMEKIT_AUTH_ENABLED=true`. This is the only authentication switch. Missing
or `false` means open mode; any other value is invalid, with no fallback to
`NODE_ENV`, credentials, or SQLite.
:::

## Environment variables

The generated template documents these variables:

| Variable | Default | Used for |
| --- | --- | --- |
| `FRAMEKIT_AUTH_ENABLED` | `false` | The only auth switch. Missing or `false` enables open mode; exactly `true` enables users, sessions, API tokens, and protected Studio/access routes. |
| `FRAMEKIT_ADMIN_USERNAME` | `admin` | Used only when auth is enabled to name the first administrator in an empty database. It must contain 3–64 ASCII letters, numbers, `.`, `_`, or `-`. After a user exists, the bootstrap value is ignored. |
| `FRAMEKIT_ADMIN_PASSWORD` | None | Used only when auth is enabled and the first administrator is bootstrapped. It must contain 12–256 UTF-8 bytes. |
| `FRAMEKIT_DATABASE_PATH` | `.framekit-data/framekit.sqlite` | The auth SQLite database path. Relative paths resolve from the application working directory. `:memory:` uses a non-persistent database. Open mode does not initialize SQLite. |
| `PORT` | `3000` | The server port. It must be an integer from `1` through `65535`. |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Empty | A comma-separated allowlist of exact hostnames for HTTPS remote images. Entries are trimmed and lowercased; IP literals are not accepted. |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | `2` | The maximum number of concurrent image renders. It must be an integer from `1` through `32`. |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | `30000` | The image-render timeout in milliseconds. It must be an integer from `1` through `120000`. |

The development server also accepts `FRAMEKIT_HOST` and `HOST` for its bind hostname. `FRAMEKIT_HOST` takes precedence, then `HOST`, then `localhost`. `PORT` is shared with the image-render configuration and defaults to `3000` there as well.

Remote image hosts must be explicit HTTPS hostnames in the allowlist. An empty allowlist therefore does not authorize a remote image host.

## Authentication modes

In open mode, `/editor` and `/brand` work without login, `/login` redirects to
`/editor`, `/settings` and the access API return not found, and
`POST /api/framekit/images/render` needs no credential. The renderer still
enforces request validation, image restrictions, browser navigation limits,
capacity, timeouts, and cleanup. Development uploads remain protected by a
same-origin check.

With `FRAMEKIT_AUTH_ENABLED=true`, users, sessions, API tokens, protected Studio
routes, and access routes are enabled. `FRAMEKIT_ADMIN_PASSWORD` and
`FRAMEKIT_ADMIN_USERNAME` bootstrap the first administrator only in this mode.
Open mode does not create an anonymous administrator or initialize SQLite.
Changing the switch back to `false` does not delete stored users, sessions, or
tokens; it only stops using those access records until auth is enabled again.

The value is strict: use only `true`, `false`, or leave the variable unset.

## Project aliases

The canonical generated `tsconfig.json` defines these aliases:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@framekit/generated/*": ["./src/generated/framekit/*"]
    }
  }
}
```

Use `@/*` for project source and `@framekit/generated/*` for generated modules. Import FrameKit through its public package entrypoints, for example:

```ts
import { defineTemplate, field } from '@mauriciodmo/framekit'
import { withFrameKit } from '@mauriciodmo/framekit/next'
```

## Next.js defaults

The generated `next.config.ts` uses `withFrameKit()` from `@mauriciodmo/framekit/next`. The wrapper sets the Next.js output to `standalone`, uses `.framekit/next` as `distDir`, and adds a temporary redirect from `/` to `/editor`. A project may pass its other Next.js configuration to the wrapper, but these FrameKit values are part of the generated configuration.

For the generated project layout, see [project structure](/en/users/getting-started/project-structure). For deployment values in the canonical container, see [Docker and persistence](/en/users/deployment/docker-and-persistence).
