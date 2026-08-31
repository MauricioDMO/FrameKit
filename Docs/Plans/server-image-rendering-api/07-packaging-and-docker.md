# Step 7 - Packaging and Docker

## Goal

Make the server renderer a valid public package feature and produce a generated
consumer Docker image containing the matching Chromium headless shell, required
system libraries, Next.js standalone server, and no embedded secrets.

The final runtime uses in-memory jobs only; no writable render-job directory or
persistent volume is required.

## Depends on

- Steps 1-6 implemented and passing focused exit gates.
- Current public package build, creator copy behavior, and standalone production
  build.
- Repository Node/pnpm requirements.

## Deliverables

- Final `@mauriciodmo/framekit/server` export/declarations.
- One compatible pinned `playwright-core` version across package development,
  canonical generated app, Studio, and lockfile.
- No Chromium download during ordinary dependency installation.
- Canonical generated `Dockerfile` and `.dockerignore`.
- Correct standalone copy/start behavior.
- Creator tests proving deployment/routes are copied.
- Package/tarball checks proving Chromium binaries/secrets/workspace references
  are not published.
- Locally runnable production image ready for Step 8 real-browser smoke.

## Dependency strategy

### `@mauriciodmo/framekit`

- Add `playwright-core` for the `./server` runtime boundary.
- Keep it external in unbundled tsdown output.
- Pin the version used for package development/tests.
- Choose dependency/peer-optional packaging so existing consumers that never use
  `./server` remain supported without browser binaries.
- Do not add full `playwright` or `@playwright/test` to production dependencies.
- Ordinary `pnpm install` must not download browser binaries.

### Generated template and Studio

- Install the exact selected `playwright-core` version as a direct production
  dependency where Docker/browser installation commands require a stable CLI.
- Keep canonical template, Studio, package development, and lockfile on the same
  intended version.
- Browser revision installed in Docker must come from that exact package/lock
  resolution; never install a floating Playwright CLI separately.

## Package export and build

Final manifest shape:

```json
{
  "./server": {
    "types": "./dist/server.d.ts",
    "import": "./dist/server.js",
    "default": "./dist/server.js"
  }
}
```

Required checks:

- tsdown emits `server.js` + declarations;
- all emitted relative imports resolve inside package `dist`;
- server output keeps `playwright-core` external as intended;
- root/editor/studio exports do not reference server output;
- package `files` publishes only intended bin/dist/docs/license artifacts;
- no Chromium binary, Map debug dump, Docker output, test fixture, secret, or
  repository-local path enters package tarball;
- public type fixtures compile against package exports, not source aliases.

Update public import documentation only when implementation is ready to ship.

## Generated application integration

Add to `packages/create-framekit/template/`:

```text
Dockerfile
.dockerignore
src/app/api/v1/images/route.ts
src/app/__framekit/render/[id]/page.tsx
src/app/__framekit/render/[id]/render-client.tsx
```

No browser-shutdown `src/instrumentation.ts` is required by the v1 design.

Creator-focused assertions:

- deployment files copied with exact names;
- hidden `.dockerignore` preserved;
- generated package includes compatible `playwright-core` dependency;
- no `workspace:*` ranges/repository-local paths in generated output;
- generated app can install, generate, check, and build.

Do not hand-edit generated registry files while adding routes.

## Docker stages

Use a pnpm multi-stage build based on `node:22-bookworm-slim`, adapted to the
actual FrameKit standalone output.

### Stage 1 - `base`

Responsibilities:

- `FROM node:22-bookworm-slim`;
- Corepack/pnpm setup;
- `WORKDIR /app`;
- base CA certificates/runtime prerequisites;
- apt list cleanup in the same layer.

Do not install Chromium in generic build stages.

### Stage 2 - `build-deps`

- Copy package/lock/workspace metadata first.
- `pnpm install --frozen-lockfile` with BuildKit cache where practical.
- Do not run Playwright browser install.
- `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` may be explicit even though
  `playwright-core` should not auto-download.

### Stage 3 - `prod-deps`

- Install production dependency graph with frozen lockfile.
- Preserve the direct `playwright-core` CLI needed by runner browser install if
  this strategy is retained after real verification.

### Stage 4 - `builder`

- Start from full build dependencies.
- Copy application source.
- Run `pnpm build` / canonical FrameKit build command only.
- Do not add unrelated Prisma/database build steps.
- Assert standalone output location under `.framekit/next/standalone`.
- Rely on existing `framekit build` behavior to copy `public` and Next static
  assets beside the standalone server.

### Stage 5 - `runner`

Initial runtime environment:

```dockerfile
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000
ENV FRAMEKIT_INTERNAL_ORIGIN=http://127.0.0.1:3000
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
```

Runtime steps:

1. Make compatible production Node dependencies/Playwright CLI available.
2. Install `tini` as root.
3. Run the pinned Playwright CLI to install Chromium system dependencies.
4. Install only Chromium headless shell if supported by the selected version.
5. Clean apt metadata.
6. Ensure browser files are readable by the non-root Node user.
7. Copy the final standalone server contents from builder into `/app`.
8. Switch to `USER node`.
9. Expose `3000`.
10. Use `ENTRYPOINT ["/usr/bin/tini", "--"]`.
11. Start `node server.js`.

There is no FrameKit temp render directory to create/chown because jobs live in
process memory.

## Dockerfile shape

Planning pseudocode:

```dockerfile
# syntax=docker/dockerfile:1.7
FROM node:22-bookworm-slim AS base
# corepack, certs, workdir

FROM base AS build-deps
# frozen full install

FROM base AS prod-deps
# frozen production install

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

This is planning pseudocode. Verify exact Playwright commands, pnpm standalone
layout, ownership, and whether copying all production `node_modules` remains
necessary. Prefer a smaller runner later if a clean real build proves it can
contain only the standalone traced dependencies plus browser install/runtime
requirements.

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

- `FRAMEKIT_API_KEY` is supplied at runtime, never Docker `ARG`/baked secret.
- `FRAMEKIT_ALLOWED_IMAGE_HOSTS` is supplied at runtime.
- `FRAMEKIT_INTERNAL_ORIGIN` may default in the image because it is non-secret and
  tied to container topology.
- max concurrency/render timeout may be runtime env values.
- never copy `.env` files into image layers.
- document `docker run --env-file ...` only with placeholder/example values.

Node.js needs outbound HTTPS access only when a configured allowed remote image
host is used. Chromium itself is still blocked by application-level browser
routing from arbitrary external network access.

## Sandbox and container user

The initial browser launch uses `--no-sandbox` and
`--disable-setuid-sandbox`. Do not claim the Chromium sandbox is active.

Mitigations:

- application/browser run as non-root;
- browser top-level navigation fixed to loopback;
- browser external network blocked;
- Node remote-image fetch constrained by exact HTTPS allowlist/redirect policy;
- narrow filesystem permissions;
- deployment-level CPU/memory/process limits where appropriate.

## Standalone verification

Final copied server must contain/resolve:

- `server.js`;
- `.framekit/next/static` in expected location;
- copied `public` and generated template assets;
- public/private route chunks;
- `@mauriciodmo/framekit/server` runtime code;
- `playwright-core` runtime JavaScript;
- access to matching browser executable under `PLAYWRIGHT_BROWSERS_PATH`;
- no workspace symlink that points outside the image.

Critical architecture check:

- public API route/private page in final standalone must share the same process
  `globalThis` render-job store.

Test startup using only final-stage contents, not builder filesystem.

## Package manager boundary

The initial generated Dockerfile is pnpm-specific, matching FrameKit repository
policy. The generated project must have a suitable `pnpm-lock.yaml` before image
build. Do not imply npm/yarn neutrality until corresponding deployment paths are
implemented/tested.

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

## Implementation sequence

1. Select/pin one compatible `playwright-core` version.
2. Update package/template/Studio dependencies and lockfile.
3. Finalize `./server` export, tsdown externalization, and types.
4. Add generated Dockerfile/.dockerignore and route integration copies.
5. Add creator-copy assertions.
6. Build FrameKit, Studio, and canonical generated consumer.
7. Build Docker from a clean context with no pre-existing local build output.
8. Verify final standalone Map sharing, route assets, user, browser path, and
   browser launch.
9. Pack public packages and inspect tarball contents/references.
10. Optimize runner dependency copying only after the working production shape is
    proven.

## Focused tests and checks

- Frozen dependency install succeeds with committed lockfile.
- All workspaces resolve intended Playwright core version.
- FrameKit package emits valid `server` targets.
- Client-capable entries remain free of server dependencies.
- Creator copies Dockerfile, `.dockerignore`, public/private routes.
- Generated app contains no workspace-local dependency paths.
- `framekit check` and production build succeed.
- Docker build does not run unrelated DB steps or install all browser families.
- Final container runs non-root Node under `tini`.
- Chromium headless shell launches from configured browser path.
- Public/static/generated assets return `200`.
- API/private routes are present.
- Public/private server bundles share process-global job Map.
- No render-job files/directories are created.
- Tarballs contain no Chromium, secrets, Docker output, tests, or local paths.

## Exit gate

Step 7 is complete when:

- public server export is installable from packed package;
- creator output contains all application-owned routes/deployment files;
- a clean Docker build starts the standalone consumer and launches matching
  Chromium as non-root;
- final standalone proves the `globalThis` Map handoff;
- no secret/browser binary/workspace reference leaks into public tarballs;
- focused creator/package checks and repository build pass.
