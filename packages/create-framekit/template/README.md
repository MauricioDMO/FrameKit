# FrameKit Project

```
pnpm dev
```

Templates live in `src/templates`. A directory containing `template.tsx`
appears automatically in the Studio editor.

If dependencies were not installed when the project was created, run
`pnpm install` first. `pnpm dev` generates the template registry before starting
Studio. To regenerate it explicitly, run `pnpm framekit generate`.

FrameKit projects require Node.js `>=22.13.0`. Use pnpm `>=11.14.0` or npm to
install dependencies.

Shared public company information can live in `src/profile.ts`. The file is
intentionally flexible and can export any clear structure; template authors
should read its comments and ask which values to show when there are multiple
contact options.

Template definitions use an exact `meta` object, `variants`, and field-only
`content` entries. `meta.title` is required; optional metadata is limited to
`description`, `marketingDescription`, and `tags`. A missing title is invalid and
is never derived from the template directory.
Template images live beside the template in `assets/common` or in a directory
named after a content variant. Variant image files use the field key as their
filename. Shared project images belong in `public/assets/<category>` and can be
referenced by an image field with a root-relative value such as
`/assets/logos/brand.svg`.

The included example template uses the inline pattern with `defineTemplate`.
For complex layouts, see the extracted definition pattern with
[`defineTemplateBase`](https://framekit.mauriciodmo.com/en/users/guides/split-template-definition/).

## Available commands

- `pnpm dev` — start the development server
- `pnpm framekit generate` — regenerate the template registry
- `pnpm check` — validate all templates
- `pnpm build` — validate and build for production
- `pnpm start` — start the production server

## Runtime configuration

`.env.example` lists six FrameKit-specific application variables plus the
standard `PORT` process setting. Provide real values through the process
environment or your deployment secret manager; it is a reference file, not a
source for secrets. The image route automatically
infers its private loopback origin as `http://localhost:${PORT}` from trusted
process configuration; `PORT` defaults to `3000`.

| Variable | Consumed by / used for | Required or default |
| --- | --- | --- |
| `FRAMEKIT_ADMIN_USERNAME` | `/api/framekit/login` → `bootstrapUsers()`; username for the first administrator | Optional on first login to an empty database; defaults to `admin` |
| `FRAMEKIT_ADMIN_PASSWORD` | `/api/framekit/login` → `bootstrapUsers()`; password for the first administrator | Required only on first login to an empty database; no default; 12-256 UTF-8 bytes |
| `FRAMEKIT_DATABASE_PATH` | `getDatabase()`; persistent SQLite storage for users, password hashes, sessions, and API-token data | Optional; defaults to `.framekit-data/framekit.sqlite` relative to the working directory; persist its directory |
| `PORT` | Standard process port for the server and private loopback origin | Optional; defaults to `3000`; integer from `1` to `65535` |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | `parseImageRenderConfig()` → `prepareRenderInputs()`; exact remote-image host allowlist | Optional; empty disables remote images |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | `parseImageRenderConfig()` → render pipeline; process-local render capacity | Optional; defaults to `2`, range `1..32` |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | `parseImageRenderConfig()` → request/render deadline and browser timeouts | Optional; defaults to `30000`, range `1..120000` ms |

The first login request calls `bootstrapUsers()` before authentication. With an
empty database, a valid administrator password and optional username create the
first active administrator; once a user exists, changing either bootstrap
variable does not change that user. A successful login sets the HttpOnly
`framekit_session` cookie. Account, token, and user-management routes use that
session; unsafe session requests require the same-origin `Origin` header.

`POST /api/framekit/images/render` accepts either an active same-origin session
cookie or a valid API token in `Authorization: Bearer <API_TOKEN>`. Create API
tokens from Studio settings; the full token is returned only when it is created.
Keep the directory containing the configured database path on persistent storage
when deploying the project; `:memory:` is process-local and is not persistent.

## Docker

The included Dockerfile uses pnpm and sets these non-secret defaults in the
runtime image:

| Variable | Docker default | Purpose |
| --- | --- | --- |
| `NODE_ENV` | `production` | Production Next.js runtime |
| `HOSTNAME` | `0.0.0.0` | Listen on all container interfaces |
| `PORT` | `3000` | HTTP port exposed by the container |
| `FRAMEKIT_DATABASE_PATH` | `/data/framekit.sqlite` | SQLite access-data path |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` | Installed Chromium browser location |

The Dockerfile creates and chowns `/data`, but operators must mount `/data` as
persistent storage when deploying. Provide bootstrap credentials and any
deployment-specific `FRAMEKIT_ALLOWED_IMAGE_HOSTS` through the runtime
environment; `FRAMEKIT_DATABASE_PATH` and the optional render limits can also be
overridden there. Do not place secrets or deployment-specific allowlists in the
Dockerfile or image layers.

## Documentation

- [Documentation](https://framekit.mauriciodmo.com/en/)
- [Documentación](https://framekit.mauriciodmo.com/es/)
