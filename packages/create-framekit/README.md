# @mauriciodmo/create-framekit

Scaffold a new FrameKit project with one command. The generated project
includes a local Studio preview, server-backed Download/Copy, and a server-side
`POST /api/framekit/images/render` PNG API.

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
cd my-project
# Required before the first login when the database is empty.
export FRAMEKIT_ADMIN_PASSWORD='replace-with-a-strong-password'
# Required for server-side rendering on the default local port.
export FRAMEKIT_INTERNAL_ORIGIN='http://127.0.0.1:3000'
pnpm dev
```

The first login against an empty database creates the administrator and needs
`FRAMEKIT_ADMIN_PASSWORD` (12–256 UTF-8 bytes). `FRAMEKIT_ADMIN_USERNAME` is
optional and defaults to `admin`; these bootstrap values are used only while
the database has no users.

## Compatibility

- Node.js `>=22.13.0`
- pnpm `>=11.14.0` when using pnpm

The package manifest does not declare an npm engine range, but the creator supports npm when installing the generated project. The creator is interactive: if no project name is given, it asks for one. It detects which package manager you are using from your environment (`pnpm` or `npm`); if it cannot detect it, it asks you to choose. It then asks whether to install dependencies, and if you are using pnpm, whether to run `pnpm approve-builds`. Finally, it asks whether to initialize a Git repository with an initial commit.

Use `-y` to accept all questions or `-n` to reject them all. When either flag is used without a project name, the project is created in `./framekit`; an undetected package manager defaults to pnpm in this non-interactive mode.

```bash
pnpm dlx @mauriciodmo/create-framekit -y
pnpm dlx @mauriciodmo/create-framekit my-project -n
```

After copying the template, the creator runs `install` and `framekit generate` automatically if you chose to install dependencies. If either step fails, the partially-created project directory is preserved so you can diagnose the issue.

The generated project does not download browsers during dependency
installation. Install FrameKit's Chromium headless shell explicitly from the
project root:

```bash
pnpm framekit browser install
pnpm framekit browser install --with-deps
```

The second form also installs Playwright system dependencies and may require
root or equivalent system-package privileges on Linux. The generated template
includes a pnpm-only `Dockerfile` that uses
`framekit browser install --with-deps`. A suitable `pnpm-lock.yaml` must exist
in the generated project before `docker build`; npm or Yarn scaffolds and
scaffolds created without dependency installation (including `-n`) are not
Docker-ready or validated by this path. Its Studio bootstrap credentials,
database path, and deployment-specific render settings are supplied at runtime
rather than baked into the image. Tarball checks inspect deployment artifacts;
`pnpm smoke:docker -- <exact-published-framekit-version>` performs the live
Docker build and two-container smoke when the published package includes the
browser runtime.

## Runtime configuration

`FRAMEKIT_DATABASE_PATH` is optional and defaults to
`.framekit-data/framekit.sqlite`, relative to the project working directory.
Persist the directory containing this database when deploying. The image route
requires `FRAMEKIT_INTERNAL_ORIGIN`, an HTTP loopback origin; the included
Dockerfile sets the default `http://127.0.0.1:3000`. Optional render settings are
`FRAMEKIT_ALLOWED_IMAGE_HOSTS` (empty disables remote images),
`FRAMEKIT_MAX_CONCURRENT_RENDERS` (default `2`), and
`FRAMEKIT_RENDER_TIMEOUT_MS` (default `30000` ms). Supply credentials and these
settings through the runtime environment or deployment secret manager.

The API route accepts JSON containing `template`, optional `variant`, and
optional `data`, authenticates an active Studio session or an API token created
from Studio settings, and returns `image/png` on success. It is mounted at
`POST /api/framekit/images/render`; the old `/api/v1/images` route is not
maintained. See the [server image API reference](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/reference/public-api.md)
for runtime variables, authentication, validation, bootstrap, and persistence details.

To update the official agent skills in an existing project, run this from the project root:

```bash
pnpm dlx @mauriciodmo/create-framekit update-skills
```

You can pass another project directory as the second argument. The command replaces the official FrameKit skills, removes the legacy `framekit-project-setup`, `framekit-studio-usage`, and `framekit-template-creation` directories, and preserves other skill directories.

For template authoring patterns, see the [Template Authoring Guide](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/guides/template-authoring.md).

For full documentation:
- [Documentation](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/README.md)
- [Documentación](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/es/README.md)

## Test locally

From the repository root, build and run the local CLI without publishing it:

```bash
pnpm --filter @mauriciodmo/create-framekit build && node packages/create-framekit/dist/cli.js ./my-local-framekit
```
