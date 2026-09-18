# FrameKit CLI Reference

## Usage

```
framekit <generate|check|dev|build|start>
framekit browser install [--with-deps]
```

All `framekit` commands use `process.cwd()` as the project root. The standard
commands reject extra positional arguments or options; the browser command
accepts only the optional `--with-deps` flag. There is no `--help`, `--version`,
or configuration file flag. There is no way to specify an alternate templates
directory; FrameKit always scans `src/templates`.

---

## `create-framekit`

`create-framekit` is the project scaffolding CLI distributed as `@mauriciodmo/create-framekit`. It accepts an optional project directory and the `-y` and `-n` flags:

```sh
create-framekit [project-directory] [-y|-n]
```

The CLI copies the starter template into a new directory, optionally installs dependencies, and—when installation is selected and succeeds—generates the template catalog. It can also optionally initialize Git. It refuses to overwrite an existing directory, including an empty one.

Without `-y` or `-n`, when no project directory is provided, it asks for one. It detects `pnpm` or `npm` from the environment and asks you to choose when detection is unavailable. The remaining prompts are:

- Install dependencies? Default: yes.
- Run `pnpm approve-builds` when using pnpm and installing dependencies? Default: yes.
- Initialize a Git repository and create an initial commit? Default: yes.

`-y` accepts all prompts and `-n` rejects them all. When either flag is used
without a directory, the project is created in `./framekit`. An undetected
package manager defaults to `pnpm` in this mode.

### `create-framekit update-skills`

Updates the official skills in an existing project:

```sh
create-framekit update-skills [project-directory]
```

```sh
pnpm dlx @mauriciodmo/create-framekit update-skills
npm exec --yes @mauriciodmo/create-framekit -- update-skills ./my-framekit
```

If no project directory is provided, it defaults to `.` (the current working directory). The command copies the official skills shipped by the installed `create-framekit` package, replacing the official skill directories. Other or custom skill directories are preserved. The command does not update application files.

For local repository development, build and run the CLI without publishing it:

```sh
pnpm sync:skills
pnpm --filter @mauriciodmo/create-framekit build
node packages/create-framekit/dist/cli.js update-skills ./my-local-framekit
```

In the repository checkout, `pnpm sync:skills` runs `scripts/sync-skills.mjs`. It
reads `Docs/skills/**` and replaces `.agents/skills/**` and
`packages/create-framekit/template/.agents/skills/**`. When run from an installed
package, `update-skills` reads the public skills packaged in
`template/.agents/skills/**` and copies them to the target project's
`.agents/skills/**`; it does not read `Docs/skills/**` directly. The target
directory must already exist.

Colors are enabled for terminal output and can be disabled with `NO_COLOR=1`.

---

## Application environment variables

The generated template's `.env.example` lists six FrameKit-specific application
runtime variables plus the standard `PORT` process setting. It is a reference;
provide real values through the process environment or a secret manager, not by
storing credentials in the file.

```dotenv
FRAMEKIT_ADMIN_USERNAME=admin
FRAMEKIT_ADMIN_PASSWORD=replace-me-with-a-strong-password
FRAMEKIT_DATABASE_PATH=.framekit-data/framekit.sqlite
# Standard process port for the server and private loopback origin; defaults to 3000.
PORT=3000
FRAMEKIT_ALLOWED_IMAGE_HOSTS=
FRAMEKIT_MAX_CONCURRENT_RENDERS=2
FRAMEKIT_RENDER_TIMEOUT_MS=30000
```

| Variable | Consumption | Default, range, or validation |
| --- | --- | --- |
| `FRAMEKIT_ADMIN_USERNAME` | Used when the first administrator is bootstrapped in an empty SQLite database. | Optional; defaults to `admin`; 3–64 ASCII letters, numbers, `.`, `_`, or `-`. |
| `FRAMEKIT_ADMIN_PASSWORD` | Used only to bootstrap the first administrator in an empty SQLite database. | Required only for that bootstrap; no default; 12–256 UTF-8 bytes. |
| `FRAMEKIT_DATABASE_PATH` | SQLite path for users, sessions, migrations, and API tokens. | Defaults to `.framekit-data/framekit.sqlite`, relative to `process.cwd()`; `:memory:` is process-local and not persistent. |
| `PORT` | Standard process port used by Next.js and private loopback rendering. | Optional; defaults to `3000`; integer from `1` to `65535`. |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Optional allowlist for remote image hostnames. | Optional; empty or unset disables remote hosts; accepts exact DNS hostnames separated by commas. |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | Process-local limit for simultaneous renders. | Optional; defaults to `2`; integer from `1` to `32`. |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | End-to-end image-render deadline and browser timeout. | Optional; defaults to `30000` ms; integer from `1` to `120000` ms. |

The image renderer automatically infers its private loopback origin as
`http://localhost:${PORT}` from trusted process configuration. `PORT` defaults
to `3000`.

The image-render configuration is read per request. Once any user exists, the
login flow ignores the bootstrap variables; changing them does not rename or
change the password of an existing account. Use persistent storage for
`FRAMEKIT_DATABASE_PATH` when users, sessions, and tokens must survive restarts.

The current API uses a session cookie or a database-backed API token sent as
`Authorization: Bearer <API_TOKEN>`.

### Tool and environment variables

Keep the six FrameKit-specific application variables distinct from the standard
`PORT` process setting and from variables belonging to the development server,
Docker, CI, or Playwright.

#### Development (`framekit dev`)

`framekit dev` resolves the host as `FRAMEKIT_HOST` → `HOST` → `localhost` and
reads `PORT`, which defaults to `3000`; `PORT` must be an integer from `1` to
`65535`. The image renderer uses the trusted `PORT` value to infer its private
loopback origin as `http://localhost:${PORT}`.

#### Docker

The canonical generated `Dockerfile` sets `NODE_ENV=production`,
`HOSTNAME=0.0.0.0`, `PORT=3000`, and
`PLAYWRIGHT_BROWSERS_PATH=/ms-playwright` in the final image, along with the
database default `FRAMEKIT_DATABASE_PATH=/data/framekit.sqlite`. The render
route derives its private loopback origin as `http://localhost:${PORT}` from
that trusted process configuration. The final image
creates and chowns `/data`; operators must mount `/data` as persistent storage.
Provide credentials and deployment-specific application settings when starting
the container. Docker dependency stages use
`PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`; the final image installs the browser
explicitly with `framekit browser install --with-deps`.

#### CI

The CI workflow sets `NEXT_TELEMETRY_DISABLED=1`. `CI` is not an application
variable: Playwright reads it for test behavior, and the Docker smoke script
passes it to child processes. `CI` does not replace any of the six FrameKit-specific
application variables.

#### Playwright

`playwright.config.ts` uses `CI` to forbid `test.only`, enable one retry, and
switch to the `line` reporter. Its `webServer` injects
`FRAMEKIT_HOST=localhost`, `HOSTNAME=localhost`, `PORT=3000`,
`FRAMEKIT_ADMIN_USERNAME=admin`,
`FRAMEKIT_ADMIN_PASSWORD=framekit-e2e-password`,
`FRAMEKIT_DATABASE_PATH=:memory:`,
`NEXT_TELEMETRY_DISABLED=1`. The E2E CI job installs Chromium with
`pnpm exec playwright install --with-deps chromium`; this is separate from the
explicit browser installation used by Docker.

## `framekit browser install`

Installs the browser runtime explicitly through FrameKit's pinned
`playwright-core` dependency:

```sh
framekit browser install
framekit browser install --with-deps
```

Both forms install only Chromium's headless shell. `--with-deps` also asks the
Playwright CLI to install system dependencies and may require root or
equivalent system-package privileges on Linux. The command honors
`PLAYWRIGHT_BROWSERS_PATH` and rejects every other argument. Dependency
installation, `generate`, `check`, `dev`, `build`, and `start` do not download
browser binaries.

The generated consumer's canonical `Dockerfile` is pnpm-only and uses
`framekit browser install --with-deps`; it does not invoke Playwright directly.
Before `docker build`, the project must contain a suitable `pnpm-lock.yaml`.
Consumers scaffolded for npm or Yarn, and scaffolds created without dependency
installation, are not Docker-ready or validated by this path.

---

## Server image API

The generated consumer exposes a Node.js-only `POST /api/framekit/images/render`
route using the unified `createFrameKitApiHandler(templates)` adapter from
`@mauriciodmo/framekit/server`. The image action delegates to
`createStudioImageHandler(templates)`. The JSON request contains a required `template`
slug and optional `variant` and `data`:

```json
{ "template": "example", "variant": "en", "data": {} }
```

Send an active Studio session cookie or `Authorization: Bearer <API_TOKEN>`;
cookie-authenticated requests must be same-origin. Success returns `200` with
`image/png`; failures return stable JSON errors. The image renderer automatically
infers its private loopback origin as `http://localhost:${PORT}` from trusted
process configuration; `PORT` defaults to `3000`. The optional
`FRAMEKIT_ALLOWED_IMAGE_HOSTS`, `FRAMEKIT_MAX_CONCURRENT_RENDERS`, and
`FRAMEKIT_RENDER_TIMEOUT_MS` variables configure remote-image access and render
limits. The API requires the explicitly installed headless shell.

The generated route uses the Phase 6 authentication model. On the first login,
when the database has no users, `FRAMEKIT_ADMIN_USERNAME` (default `admin`) and
the required `FRAMEKIT_ADMIN_PASSWORD` bootstrap the administrator. Later
requests use a same-origin session cookie or a database API token. The generated
route uses only the SQLite-backed authentication model.

The tarball smoke checks the generated route and deployment files; it does not
claim a live Docker build or browser/container validation.

---

## `framekit generate`

Scans `src/templates` for template directories and generates the project-local template registry. This command is optional: `dev`, `check`, and `build` generate automatically; `start` does not. See [GitHub issue #12](https://github.com/MauricioDMO/FrameKit/issues/12).

The scan registers each non-hidden, non-underscore-prefixed directory containing a `template.tsx` file. Subdirectories within a template directory are not traversed; internal components, definitions, and assets are not treated as child templates.

If no templates are found, the command exits with code 1 and prints an error message identifying the empty directory. The output file is written only when its content has changed.

Output is written to `src/generated/framekit/templates.ts`. The generated module has one runtime export, `templates: TemplateRegistryEntry[]`. Each entry includes `slug`, `segments`, validated `meta` data, `width` and `height`, `variants`, declaration-ordered `variantKeys`, an `assets` manifest, and a lazy `load` function for the template definition. A template title is available as `meta.title`; there are no top-level `title`, `templateManifest`, or `templateRegistry` outputs. Generation also writes `src/generated/framekit/brands.ts` for the optional brand catalog. This source-side generated output is distinct from `.framekit/next`, which is the Next.js build output configured by `distDir`.

Assets are read from `assets/common` and `assets/<variant>`. Supported image files are copied to `public/framekit/templates/<slug>/...`, and the manifest URLs point to those copied files. Non-hidden asset subdirectories, invalid names, and duplicate keys are rejected; regenerating removes the previous generated asset tree first.

During generation, every discovered `template.tsx` is imported and validated with `tsx`. Import and definition-validation failures report the path to the affected `template.tsx`.

```sh
framekit generate
# FrameKit: 3 templates
```

---

## `framekit check`

Validates every template definition and its resolved content across all declared variants.

The command first runs `generate`, which imports and validates every template with `tsx`, to ensure the registry is current. It then creates a temporary checker directory inside `.framekit/` and writes a temporary TypeScript file that imports every template via bundled `tsx`. This uses the consumer's own `tsconfig`, so TypeScript imports, TSX syntax, and path aliases resolve the same way they do during development.

For each template, `validateTemplateDefinition` checks the canonical structure of the definition: metadata, dimensions (width and height must be positive finite integers), fields, variants, field-only content, and the render function. For each variant declared in the definition, `resolveTemplateData` resolves the template data with no user edits (empty user data object), and `validateTemplateData` checks the resolved values: required fields are present, number fields respect min/max/step constraints, and color fields use valid hexadecimal values.

The temporary checker directory is always deleted after the check completes, whether it passes or fails.

Structured errors are reported per template, per variant, and per field:

```
/path/to/src/templates/example/template.tsx: content.en.title: required
/path/to/src/templates/example/template.tsx: content.en.count: number_too_small (min: 3)
```

The check process exits with code `1` when it reports validation errors. Definition errors use the same `file: message` format, for example `.../template.tsx: render must be a function`.

`framekit check` is not a TypeScript typecheck and does not call `render` or test PNG export. Use `next build` for type checking.

```sh
framekit check
```

---

## `framekit dev`

Starts a development server with live template registry updates.

Before starting the server, the command runs `generate` to produce the initial registry. It then starts a Next.js dev server with Turbopack and custom HTTP server handling, including WebSocket upgrades for Hot Module Replacement.

The template watcher observes every file and directory under `src/templates`. Additions, edits, and deletions trigger regeneration. Changes to any path under `src/brand` trigger regeneration as well; other paths under `src` do not. Only one generation runs at a time; if a change arrives while a generation is in progress, the pending change is picked up by the in-progress generation before it exits.

FrameKit itself resolves the development server hostname and port from the following environment variables (in priority order):

| Variable        | Default | Notes                                                  |
| --------------- | ------- | ------------------------------------------------------ |
| `FRAMEKIT_HOST` | `HOST`  | Fallback chain: `FRAMEKIT_HOST` → `HOST` → `localhost` |
| `PORT`          | `3000`  | Must be an integer between 1 and 65535                 |

`framekit dev` passes these values to its development HTTP server. An occupied
port is an error; it is not automatically replaced with the next port.

The command handles `SIGINT` and `SIGTERM` gracefully, closing the server before exiting.

```sh
FRAMEKIT_HOST=0.0.0.0 PORT=4000 framekit dev
# FrameKit Studio: http://0.0.0.0:4000
```

---

## `framekit build`

Runs validation and then builds the production Next.js application.

The command first runs `framekit check`, so the registry is generated automatically and all validation runs before the Next.js build. If validation fails, the build is aborted and the Next.js build step is never executed. If validation passes, `next build` is run.

After a successful build, the standalone server output directory is located by searching for a `server.js` file whose adjacent traced output contains `.framekit/next/BUILD_ID`. Exactly one such file must be found; the command fails if zero or multiple candidates are discovered.

Once the standalone server is located, the following assets are copied beside it:

- `public/` directory, if it exists
- `.framekit/next/static/` directory

This ensures the standalone server can serve static assets without a CDN.

```sh
framekit build
```

---

## `framekit start`

Starts the production standalone server. It does not generate the template registry.

The command searches for exactly one `server.js` file inside `.framekit/next/standalone/` whose adjacent traced output directory contains a `BUILD_ID` file. If zero or more than one candidate is found, the command fails with an error. `framekit start` does not resolve production host or port options: it launches `server.js` with the parent environment inherited.

| Variable | Production standalone behavior |
| -------- | ------------------------------ |
| `HOSTNAME` | Read by Next's generated standalone server |
| `PORT` | Read by Next's generated standalone server |
| `KEEP_ALIVE_TIMEOUT` | Inherited and read by Next's generated standalone server |
| `FRAMEKIT_HOST`, `HOST` | Not mapped to `HOSTNAME` |

`start` itself does not generate or copy registry output; it only locates and launches the existing standalone server.

The standalone server is launched as a child process with an inherited environment. Exit codes and signals are propagated to the parent process.

```sh
framekit start
```

---

## General CLI Behavior

- All commands operate on `process.cwd()` as the project root.
- There is no `--help`, `--version`, or configuration file flag.
- There is no way to specify an alternate templates directory.
- `generate` is optional; `dev`, `check`, and `build` generate automatically, while `start` does not.
- Child processes inherit the parent's environment and stdio.
- Temporary files are cleaned up even on failure.

## Operational verification gates

The permanent repository gates are versionless: Ubuntu runs the full checks on Node.js `22.13.0` and `24` with pnpm `11.14.0`; Windows runs focused generated-consumer checks on Node.js `22.13.0`; and Ubuntu runs the Chromium Studio and image API critical paths on Node.js `22.13.0`. The corresponding repository commands include `pnpm check:runtime`, `pnpm lint`, `pnpm test`, `pnpm typecheck`, `pnpm build`, `pnpm test:e2e`, and dry package inspection with `pnpm --filter <package> pack --dry-run`.

Distribution checks are separate. During release preparation, maintainers choose package versions and run the real tarball smoke in an isolated consumer; after publication, exact npm package specs and the intended dist-tag are supplied to a separate registry smoke before promotion. No release version is selected or encoded by the versionless repository gates. See [Testing and Distribution](../development/testing-and-distribution.md) for the reproducible sequences.

[English](./cli.md) | [Español](../../es/reference/cli.md)
