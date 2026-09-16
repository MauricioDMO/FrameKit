# Create a Project

## Prerequisites

- Node.js 22.13.0 or later.
- pnpm 11.14.0 or later when using pnpm. The package manifest does not declare an npm engine range; the creator supports npm for installing generated projects.

The creator checks the Node.js version before creating the project and checks
the pnpm version before installing with pnpm.

## Create the project

Run:

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
```

The creator is interactive. If you do not provide a project name as an argument and do not use `-n` or `-y`, it asks for one. It detects which package manager you are using (`pnpm` or `npm`) from your environment; if it cannot detect it, it asks you to choose. It then asks:

- Whether to install dependencies (default: yes).
- If you are using **pnpm** and chose to install dependencies: whether to run `pnpm approve-builds` to approve build scripts interactively (default: yes).
- Whether to initialize a Git repository with an initial commit (default: yes).

Use `-y` to accept all prompts or `-n` to reject them all:

```bash
pnpm dlx @mauriciodmo/create-framekit -y
pnpm dlx @mauriciodmo/create-framekit my-project -n
```

When either flag is used without a project name, the CLI creates the `framekit` directory. In that mode, an undetected package manager defaults to `pnpm` without prompting.

After copying the template, if you chose to install dependencies the creator runs `pnpm install` (or `npm install`) and then `pnpm framekit generate` (or `npm exec -- framekit generate`). If either step fails, the partially-created project directory is preserved so you can diagnose the issue.

The CLI prints a colored header and completion message when it runs in a terminal. Set `NO_COLOR=1` to disable colors.

### Interactive options

- The project name can be passed as the optional `[project-directory]` argument. If it is omitted without `-n` or `-y`, the CLI asks for it; with either flag, it uses `framekit`.
- `-y` accepts all prompts and `-n` rejects them all. The `--y` and `--n` forms are invalid.
- The package manager is detected from the environment. If it cannot be detected, choose `pnpm` or `npm` interactively.
- Dependency installation defaults to yes.
- `pnpm approve-builds` is offered only when pnpm is selected and dependencies are installed. It defaults to yes.
- Git repository initialization with an initial commit defaults to yes.
- The destination must not exist, including an empty directory.

### Test locally without publishing

From the FrameKit repository root, build and run the local CLI directly:

```bash
pnpm --filter @mauriciodmo/create-framekit build && node packages/create-framekit/dist/cli.js ./my-local-framekit
```

The command uses the local `create-framekit` build and does not require publishing the package. The generated project still installs the FrameKit version declared by its template.

## Configure the runtime

Review the generated `.env.example` and provide these values through the
runtime environment. On the first login, when the configured database has no
users, `FRAMEKIT_ADMIN_PASSWORD` bootstraps the first administrator and
`FRAMEKIT_ADMIN_USERNAME` optionally sets the username (default: `admin`).
After a user exists, these bootstrap variables are ignored:

| Variable | Purpose | Default or requirement |
| --- | --- | --- |
| `FRAMEKIT_ADMIN_USERNAME` | First administrator username | Optional; `admin` |
| `FRAMEKIT_ADMIN_PASSWORD` | First administrator password | Required only on first login with an empty database; no default; 12-256 UTF-8 bytes |
| `FRAMEKIT_DATABASE_PATH` | SQLite users, sessions, and API tokens | `.framekit-data/framekit.sqlite`, relative to the working directory |
| `FRAMEKIT_INTERNAL_ORIGIN` | Private origin for server-side PNG rendering | Required by the image route; HTTP loopback origin |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Exact HTTPS hostnames permitted for remote raster images | Optional; empty disables remote images |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | Concurrent server-render limit | Optional; `2` (maximum `32`) |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | Server-render timeout in milliseconds | Optional; `30000` (maximum `120000`) |

After the first user exists, changing the administrator variables does not
change that user. Persist the directory containing the database path when the
project runs in a container. See the [runtime environment reference](../reference/public-api.md#runtime-environment-variables)
for complete variable behavior and validation details, and the [CLI reference](../reference/cli.md)
for the separate development and production environment rules.

## Deploy with Docker

The included Dockerfile sets these non-secret defaults in the runtime image:

| Variable | Default |
| --- | --- |
| `NODE_ENV` | `production` |
| `HOSTNAME` | `0.0.0.0` |
| `PORT` | `3000` |
| `FRAMEKIT_INTERNAL_ORIGIN` | `http://127.0.0.1:3000` |
| `PLAYWRIGHT_BROWSERS_PATH` | `/ms-playwright` |

Provide administrator credentials and any deployment-specific image-host
allowlist through the runtime environment. Do not put secrets in the Dockerfile
or bake them into image layers.

## Start development

Navigate to the project directory and start the development server:

```bash
cd my-project
pnpm dev
```

Studio opens at [http://localhost:3000](http://localhost:3000). The root path `/` redirects to `/editor`.

The generated project includes one bilingual example template. After dependencies
are installed and the registry is generated, it is visible in the editor.

## Validate and build

Use the following commands to work with the project:

- `pnpm dev` — regenerates the template registry before starting Studio and watches every path under `src/templates` for changes.
- `pnpm check` — regenerates the template catalog and validates all definitions and content variants.
- `pnpm build` — regenerates and validates the registry through `framekit check`, then creates a production-optimized build.
- `pnpm start` — starts the production server without regenerating the registry.

The generated project does not include `test`, `lint`, or `typecheck` scripts.

---

[Español](./../../es/getting-started/create-project.md)
