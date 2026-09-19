---
title: Configuration
description: Configure a FrameKit project with its current environment variables, aliases, and generated-project defaults.
sidebar:
  order: 2
---

FrameKit configuration comes from the generated project, its environment, and the public package entrypoints. Keep secrets in the runtime environment; `.env.example` is a template, not a deployment secret store.

## Environment variables

The generated template documents these variables:

| Variable | Default | Used for |
| --- | --- | --- |
| `FRAMEKIT_ADMIN_USERNAME` | `admin` | The username for the first administrator created in an empty database. It must contain 3–64 ASCII letters, numbers, `.`, `_`, or `-`. After a user exists, the bootstrap value is ignored. |
| `FRAMEKIT_ADMIN_PASSWORD` | None | Required only when the first administrator is bootstrapped. It must contain 12–256 UTF-8 bytes. |
| `FRAMEKIT_DATABASE_PATH` | `.framekit-data/framekit.sqlite` | The SQLite database path. Relative paths resolve from the application working directory. `:memory:` uses a non-persistent database. |
| `PORT` | `3000` | The server port. It must be an integer from `1` through `65535`. |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Empty | A comma-separated allowlist of exact hostnames for HTTPS remote images. Entries are trimmed and lowercased; IP literals are not accepted. |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | `2` | The maximum number of concurrent image renders. It must be an integer from `1` through `32`. |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | `30000` | The image-render timeout in milliseconds. It must be an integer from `1` through `120000`. |

The development server also accepts `FRAMEKIT_HOST` and `HOST` for its bind hostname. `FRAMEKIT_HOST` takes precedence, then `HOST`, then `localhost`. `PORT` is shared with the image-render configuration and defaults to `3000` there as well.

Remote image hosts must be explicit HTTPS hostnames in the allowlist. An empty allowlist therefore does not authorize a remote image host.

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
