# Step 7 - Packaging and Docker

## Goal

Make the server renderer a valid public package feature and produce a generated
consumer Docker image containing the matching Chromium headless shell, required
system libraries, Next.js standalone server, and no embedded secrets.

## Depends on

- Steps 1-6 implemented and passing focused tests.
- Current public package build, creator copy behavior, and standalone production
  build.
- pnpm `11.14.0` and Node.js `>=22.13.0` repository requirements.

## Deliverables

- Final `@mauriciodmo/framekit/server` export and declarations.
- One exact compatible `playwright-core` version across package development,
  canonical template, Studio, and lockfile.
- No browser download during normal dependency installation.
- Canonical template `Dockerfile` and `.dockerignore`.
- Correct Next.js standalone copy/start behavior.
- Creator tests proving deployment files are copied.
- Package/tarball checks proving browser binaries and workspace references are
  not published.
- One locally runnable production container ready for Step 8 smoke tests.

## Dependency strategy

### `@mauriciodmo/framekit`

- Add `playwright-core` as the runtime expected by `./server`.
- Keep it external in unbundled tsdown output.
- Install an exact version in package development so tests/build resolve it.
- Declare a compatible peer relationship for consumers of `./server`.
- Mark the peer optional only if existing consumers that never import `./server`
  must remain installable without Playwright; the generated canonical project
  still installs it directly.
- Do not add `playwright` or `@playwright/test` to production dependencies.

### Generated template and Studio

- Add the exact selected `playwright-core` version as a direct production
  dependency.
- Keep the same exact version in both applications and package development.
- This direct dependency guarantees a root
  `node_modules/.bin/playwright-core` for Docker commands under pnpm.
- Update the root lockfile through `pnpm install`.

The browser revision installed by the CLI must come from the exact package in
the lockfile. Never install a floating Playwright CLI independently in Docker.

## Package export and build

Final manifest entry:

```json
{
  "./server": {
    "types": "./dist/server.d.ts",
    "import": "./dist/server.js",
    "default": "./dist/server.js"
  }
}
```

Required build checks:

- tsdown emits `server.js` and declarations;
- all emitted relative imports resolve inside package `dist`;
- `server.js` retains external `playwright-core` import;
- root/editor/Studio exports do not reference server output;
- package `files` continues to publish only intended `bin`, `dist`, docs/license;
- Chromium binaries, temp files, Docker output, and source tests are absent from
  the tarball;
- `check-dist.ts` validates the new manifest targets through its generic scan;
- public type fixtures compile against package exports, not source aliases.

Update repository instructions that enumerate supported public imports only when
the implementation is ready to ship.

## Generated application integration

Add to `packages/create-framekit/template/`:

```text
Dockerfile
.dockerignore
src/instrumentation.ts
src/app/api/v1/images/route.ts
src/app/__framekit/render/[id]/page.tsx
src/app/__framekit/render/[id]/render-client.tsx
```

The creator already copies the template directory into an independent project.
Add creator-focused assertions for:

- deployment files copied with exact names;
- hidden files such as `.dockerignore` preserved;
- package dependency includes `playwright-core`;
- no workspace ranges or repository-local paths in generated output;
- generated project can install, generate, check, and build.

Do not hand-edit generated registry files while adding these source routes.

## Docker stages

Use the supplied `node:22-bookworm-slim` and pnpm multi-stage structure, adapted
to FrameKit's actual build output.

### Stage 1 - `base`

Responsibilities:

- `FROM node:22-bookworm-slim`;
- enable Corepack;
- configure `PNPM_HOME`/`PATH`;
- set `WORKDIR /app`;
- install only base certificates/runtime prerequisites needed before specialized
  stages;
- remove apt lists in the same layer.

Do not install Chromium in the base stage because build-only stages do not need
it.

### Stage 2 - `build-deps`

- Copy `package.json`, `pnpm-lock.yaml`, and `pnpm-workspace.yaml` first.
- Install all dependencies with `pnpm install --frozen-lockfile` and a BuildKit
  pnpm-store cache mount.
- Do not run `playwright install` here.
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` may remain explicit, but
  `playwright-core` itself must not rely on install-time browser downloads.

### Stage 3 - `prod-deps`

- Copy the same package/lock/workspace metadata.
- Run `pnpm install --prod --frozen-lockfile` with cache mount.
- Preserve root `.bin/playwright-core` for the runner installation commands.

### Stage 4 - `builder`

- Start from `build-deps`.
- Copy application source.
- Run only `pnpm build`.
- Do not run `prisma generate`; FrameKit has no Prisma build step.
- Assert/document that output is `.framekit/next/standalone`.
- Rely on `framekit build` to copy `public` and Next static assets beside the
  standalone server.

### Stage 5 - `runner`

Set:

```dockerfile
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV FRAMEKIT_INTERNAL_ORIGIN=http://127.0.0.1:3000
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
```

Then:

1. Copy production `node_modules` from `prod-deps` so the CLI exists.
2. As root, install `tini`.
3. Run `./node_modules/.bin/playwright-core install-deps chromium`.
4. Run
   `./node_modules/.bin/playwright-core install --only-shell chromium`.
5. Clean apt lists.
6. Ensure the non-root `node` user can read the installed browser files.
7. Copy the contents of `/app/.framekit/next/standalone/` from `builder` into
   `/app`.
8. Ensure the FrameKit temp directory can be created under normal `/tmp` by
   `node`; do not grant application write access to source/build directories.
9. Switch to `USER node`.
10. Expose `3000`.
11. Use `ENTRYPOINT ["/usr/bin/tini", "--"]`.
12. Start `CMD ["node", "server.js"]`.

Do not copy `/app/dist` or `/app/generated`; those are not the generated
consumer's production server output.

## Dockerfile shape

The final implementation should remain close to this shape, with exact package
commands verified against the selected Playwright version:

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS base
# corepack, certs, workdir

FROM base AS build-deps
# full frozen install

FROM base AS prod-deps
# production frozen install

FROM build-deps AS builder
COPY . .
RUN pnpm build

FROM base AS runner
ENV NODE_ENV=production \
    HOSTNAME=0.0.0.0 \
    PORT=3000 \
    FRAMEKIT_INTERNAL_ORIGIN=http://127.0.0.1:3000 \
    PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

COPY --from=prod-deps --chown=node:node /app/node_modules ./node_modules
RUN apt-get update \
    && apt-get install -y --no-install-recommends tini \
    && ./node_modules/.bin/playwright-core install-deps chromium \
    && ./node_modules/.bin/playwright-core install --only-shell chromium \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=node:node /app/.framekit/next/standalone ./
USER node
EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
```

This is planning pseudocode. The implementation must verify whether Playwright's
install commands and file ownership require separate layers/permissions for the
selected version.

## `.dockerignore`

Exclude at minimum:

```text
node_modules
.framekit
.next
dist
coverage
.git
.github
*.log
.env
.env.*
!.env.example
```

Also exclude editor/OS files and local tarballs. Do not exclude source templates,
public assets, package metadata, lockfile, or required Next configuration.

## Runtime secrets and configuration

- `FRAMEKIT_API_KEY` is supplied with runtime environment/secrets, never `ARG`
  or `ENV` containing a real value in the Dockerfile.
- `FRAMEKIT_ALLOWED_IMAGE_HOSTS` is supplied at runtime.
- `FRAMEKIT_INTERNAL_ORIGIN` defaults in the image because it is non-secret and
  tied to container topology.
- Never copy `.env` files into the image.
- Document a minimal `docker run --env-file ...` example using placeholder
  values, not real secrets.

## Sandbox and container user

The accepted browser controller uses `--no-sandbox` and
`--disable-setuid-sandbox`. Mitigate that unavoidable reduction by:

- running the application as non-root;
- navigating only to the private loopback route;
- enforcing remote host allowlists and request interception;
- keeping container filesystem permissions narrow;
- applying deployment CPU/memory/process limits outside the image.

Do not claim the Chromium sandbox is active.

## Standalone verification

The copied standalone server must contain/resolve:

- `server.js`;
- `.framekit/next/static` in the location expected by configured `distDir`;
- copied `public` files and generated template assets;
- server route chunks for public/private endpoints;
- runtime `playwright-core` JavaScript;
- access to `/ms-playwright` browser executable;
- no workspace symlinks that point outside the image.

Test server startup with only final-stage contents, not the builder filesystem.

## Package manager boundary

The initial Dockerfile is pnpm-specific, matching the supplied baseline and
repository policy. The generated project must have a `pnpm-lock.yaml` before
building the image. An npm-specific generated Dockerfile is out of scope; docs
must state the requirement instead of implying package-manager neutrality.

## Expected files

```text
packages/framekit/package.json
packages/framekit/tsdown.config.ts
packages/framekit/tests/types/server-api.ts
packages/create-framekit/template/package.json
packages/create-framekit/template/Dockerfile
packages/create-framekit/template/.dockerignore
packages/create-framekit/src/*.test.ts
apps/studio/package.json
pnpm-lock.yaml
AGENTS.md
```

The exact creator test file follows the existing suite.

## Implementation sequence

1. Select and pin one `playwright-core` version everywhere.
2. Run root `pnpm install` and inspect lockfile resolution.
3. Finalize `./server` export, tsdown entry, externalization, and types.
4. Add direct app/template dependencies and confirm root CLI resolution.
5. Add Dockerfile and `.dockerignore` to canonical template.
6. Add creator-copy assertions for deployment files/dependencies.
7. Build FrameKit, Studio, and canonical generated consumer.
8. Build the Docker image with no pre-existing local build output.
9. Inspect final image startup, user, browser path, static assets, and routes.
10. Pack both public packages and inspect tarball contents/workspace references.

## Focused tests and checks

- `pnpm install --frozen-lockfile` succeeds after the committed lock update.
- All workspaces resolve one intended Playwright core version.
- FrameKit package build emits valid `server` targets.
- Client entries remain free of server dependencies.
- Creator copies Dockerfile, `.dockerignore`, routes, and instrumentation.
- Generated package has no `workspace:*` dependency.
- `framekit check` and `framekit build` succeed in generated consumer.
- Docker build does not run Prisma or download full Playwright browser families.
- Final container runs as `node` under `tini` and starts `server.js`.
- Chromium headless shell launches from `/ms-playwright`.
- Public/static/generated assets return `200` from final container.
- API/private routes are present.
- Tarballs contain no Chromium, temp jobs, Docker build output, secrets, or local
  paths.

## Exit gate

Step 7 is complete when:

- the public server export is installable from the packed package;
- creator output contains all application-owned integration/deployment files;
- a clean Docker build starts the standalone consumer and launches matching
  Chromium headless shell as non-root;
- no secret/browser binary/workspace reference leaks into public tarballs;
- focused creator/package checks and repository build pass.
