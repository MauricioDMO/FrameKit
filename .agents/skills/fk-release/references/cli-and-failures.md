# CLI And Installation Failures

## Template Discovery

- `src/templates` missing: create it; generation otherwise fails with `ENOENT`.
- Empty catalog: add a directory containing `template.tsx`.
- Invalid path: every directory segment must be lowercase kebab-case: `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- Directories starting with `.` or `_` are ignored.
- A directory without `template.tsx` is treated as a category and scanned below it.

## Build And Start

- `framekit build` validation failure: run `framekit check` to get template, variant data, and field errors. Check does not test rendering or PNG export.
- `framekit start` cannot find a server: run `framekit build` first.
- Multiple server candidates: ensure a single Next.js build output and remove nested output that confuses server discovery.

## Generated Project Installation

- A target directory must not already exist, including an empty directory.
- Native dependency installation failures require Python, make, and a C++ toolchain when no compatible prebuilt binary exists.
- Do not treat `pnpm install --ignore-scripts` as a general fix. Use it only for diagnosis; rebuild affected packages and verify the consumer with `framekit check` and `framekit build` afterward.
- `create-framekit` keeps a partially created project when installation fails so it can be diagnosed.

## Environment-sensitive failures

- `create-framekit` detects the package manager from `npm_config_user_agent`. npm
  and pnpm normally provide it; when it is absent or unknown, interactive runs
  prompt for a manager and `-y`/`-n` runs default to pnpm.
- On Windows, creator child commands run through `ComSpec`, falling back to
  `cmd.exe`. A missing package-manager or Git command is usually a `PATH` issue;
  confirm the required executable resolves before changing FrameKit settings.
- `NO_COLOR=1` only disables creator terminal styling. It does not change
  generation, validation, or build behavior.
- `PLAYWRIGHT_BROWSERS_PATH` is inherited by `framekit browser install` and tells
  Playwright where to discover browser binaries. Use it only when the release
  environment needs a non-default browser registry. The Docker template sets
  `/ms-playwright` itself.
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` is Docker build plumbing: the generated
  Dockerfile uses it during dependency installation and installs Chromium later
  with `framekit browser install --with-deps`.
- `CI` changes Playwright's reporter, retry, and focused-test behavior. The
  Docker smoke also passes `CI=1` to its child commands. It is not a consumer
  application setting.
- `NEXT_TELEMETRY_DISABLED=1` is passed to Next.js by repository CI and the
  Playwright web server; it disables Next.js telemetry for those checks and is
  not required by a normal consumer.
- `FRAMEKIT_TEST_FAIL` belongs only to the creator test fakes. It makes a fake
  npm or pnpm command exit with code `7` when its first argument matches the
  variable; never use it to diagnose a real installation.
- `NODE_EXTRA_CA_CERTS` is release-smoke plumbing only for an HTTPS fixture that
  uses a private test CA. The current tarball and Docker smokes do not need it;
  keep TLS verification enabled and do not treat it as consumer configuration.

## Development Diagnostics

- `framekit dev` port conflict: set `PORT` to an available integer from 1 through 65535. Use `FRAMEKIT_HOST` or `HOST` for the bind address.
- `framekit dev` watches every file and directory under `src/templates` and
  `src/brand`; additions, edits, and deletions trigger registry regeneration.
  Next HMR can also update an already loaded template preview. If a change is
  not reflected, inspect the terminal for a generation or HMR error.
- If TypeScript cannot resolve `@framekit/generated/templates`, map
  `@framekit/generated/*` to `src/generated/framekit/*` in `tsconfig.json`.
