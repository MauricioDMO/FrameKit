# Step 7 - Packaging and Docker

- **Status:** Planned; FrameKit owns the browser dependency and install command.

## Goal

Make the future server renderer a valid public package feature and produce a generated
consumer Docker image containing the matching Chromium headless shell, required
system libraries, Next.js standalone server, and no embedded secrets.

The planned final runtime uses in-memory jobs only; no writable render-job
directory or persistent volume is required.

## Depends on

- Completion of Steps 1-6 with passing focused exit gates.
- [Step 0.6](./00.6-minimal-consumer-integration.md) minimal starter, generated
  bindings, and configuration facade.
- Current public package build, creator copy behavior, and standalone production
  build.
- Repository Node/pnpm requirements.

## Deliverables

- Final server/client/Next configuration exports and declarations, including the
  package-owned HTTP handler and the Step 0.6 boundaries.
- One pinned `playwright-core` production dependency owned by FrameKit; consumer
  applications do not maintain a separate direct dependency for installation.
- Explicit `framekit browser install [--with-deps]` using that resolved dependency.
- No Chromium download during ordinary dependency installation.
- Canonical generated `Dockerfile` and `.dockerignore`.
- Correct standalone copy/start behavior.
- Creator tests proving the minimal routes/deployment files are copied and
  generated bindings are recreated rather than included in the template.
- Package/tarball checks proving Chromium binaries/secrets/workspace references
  are not published.
- Locally runnable production image ready for Step 8 real-browser smoke.

## Dependency strategy

### `@mauriciodmo/framekit`

- Keep the existing pinned `playwright-core` production dependency for `./server`
  and the browser-install CLI.
- Keep it external in unbundled tsdown output.
- Pin the version used for package development/tests.
- Consumers that never use server rendering remain supported without browser
  binaries; the JavaScript dependency itself does not install Chromium.
- Do not add full `playwright` or `@playwright/test` to production dependencies.
- Ordinary `pnpm install` must not download browser binaries.

### Generated template and Studio

- Do not add a direct production `playwright-core` dependency just to expose its
  CLI. Use the FrameKit command after installing normal application dependencies.
- Resolve browser installation from FrameKit's own dependency location, including
  strict pnpm layouts and consumers with an unrelated Playwright version.
- Update the FrameKit pin and lockfile together. Browser revision installed in
  Docker must come from the same resolution the runtime uses.
- Development-only browser testing dependencies remain separate from this
  production installation contract; verify their compatibility when used.

## FrameKit browser command

Public commands:

```bash
framekit browser install
framekit browser install --with-deps
```

Contract:

- Default installs only the Chromium headless shell required by the renderer.
- `--with-deps` also installs the corresponding system dependencies using the
  pinned Playwright CLI; document its system privileges and platform support.
- Resolve the published CLI entry from FrameKit's installed `playwright-core`
  package, then invoke it with the existing child-process helper and fixed
  arguments for Chromium/headless-shell installation. Verify the exact upstream
  arguments against the pinned version during implementation.
- Do not invoke a global executable, download a floating CLI with `npx`, or infer
  a version from the consumer's direct dependencies.
- Honor `PLAYWRIGHT_BROWSERS_PATH` consistently in installer and runtime, and
  propagate child exit codes. Reject unsupported extra arguments.
- Add one branch to the current FrameKit CLI and one small implementation module;
  reuse existing process/runtime checks rather than introducing a command framework.
- Do not expose arbitrary launch arguments, browser families, or version selectors.
- Installing dependencies or running generate/check/dev/build/start never
  downloads browsers. A missing runtime browser produces the existing safe render
  failure; operational guidance points to the FrameKit install command.

The Dockerfile and deployment environment still belong to the application.
FrameKit owns revision selection and invocation, not a browser binary tarball.

## Package export and build

Target manifest shape after the server-rendering feature is complete:

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
- root/editor/studio client graphs do not reference server output;
- `client.js` preserves its directive and private render dependency boundary;
- `next.js` and declarations resolve and import during configuration evaluation
  without a request context or server/browser runtime;
- package `files` publishes only intended bin/dist/docs/license artifacts;
- no Chromium binary, Map debug dump, Docker output, test fixture, secret, or
  repository-local path enters package tarball;
- public type fixtures compile against package exports, not source aliases.

The `./server` export already includes the Steps 1-5 runtime and Step 0.5 page
helper; Step 6 adds the high-level handler. Step 0.6 adds `./next` and extends
`./studio/root`. Verify the complete export map rather than treating this as the
first server export. Update shipped API documentation only as the corresponding
gates pass; no server/browser/auth/shared subpaths are introduced.

## Generated application integration

Final integration inside `packages/create-framekit/template/`:

```text
Dockerfile
.dockerignore
.env.example
next.config.ts
src/app/layout.tsx
src/app/globals.css
src/app/[section]/[[...slug]]/page.tsx
src/app/api/v1/images/route.ts
src/app/framekit/render/[id]/page.tsx
```

No browser-shutdown `src/instrumentation.ts` is required by the v1 design.

Creator-focused assertions:

- deployment files copied with exact names;
- hidden `.dockerignore` preserved;
- exactly five maintained files exist under starter `src/app`;
- the old home/editor/brand pages and local render-client binding are absent;
- generated client bindings are absent from the copied template/tarball and
  recreated alongside the registries through normal FrameKit commands;
- browser installation succeeds without a direct consumer `playwright-core`
  dependency, including strict pnpm resolution;
- no `workspace:*` ranges/repository-local paths in generated output;
- generated app can install, generate, check, and build.

Do not hand-edit generated registry files while adding routes.

The reusable package owns HTTP/render behavior, client-binding generation, and
browser installation. The generated application and Studio own the thin Next
routes and deployment settings; routes stay out of `packages/framekit/src/server/`.
Keep `packages/create-framekit/src/`
small and do not add `services/`, `utils/`, `lib/`, or `commands/` directories.

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
- Preserve the FrameKit CLI and its own production dependencies for the runner's
  explicit browser install command; no direct consumer Playwright CLI is needed.

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

1. Make production Node dependencies and the FrameKit CLI available.
2. Install `tini` as root.
3. Run `framekit browser install --with-deps` as root with the configured browser path.
4. Verify the installed headless shell matches FrameKit's runtime dependency.
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
    && ./node_modules/.bin/framekit browser install --with-deps \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder --chown=node:node /app/.framekit/next/standalone ./
USER node
EXPOSE 3000
ENTRYPOINT ["/usr/bin/tini", "--"]
CMD ["node", "server.js"]
```

This is planning pseudocode. Verify the FrameKit wrapper's pinned upstream
arguments, pnpm standalone layout, ownership, and whether copying all production
`node_modules` remains necessary. Prefer a smaller runner later if a clean real
build proves it can contain only the standalone traced dependencies plus browser
install/runtime requirements.

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
- `@mauriciodmo/framekit/server` runtime code produced by Steps 1-7;
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
packages/framekit/src/tooling/cli/index.ts
packages/framekit/src/tooling/cli/browser.ts
packages/framekit/src/tooling/cli/__tests__/browser.test.ts
packages/framekit/tests/types/server-api.ts
packages/create-framekit/template/package.json
packages/create-framekit/template/Dockerfile
packages/create-framekit/template/.dockerignore
packages/create-framekit/template/.env.example
packages/create-framekit/src/__tests__/runtime.test.ts
packages/create-framekit/src/__tests__/cli.test.ts
apps/studio/package.json
pnpm-lock.yaml
```

Runtime tests live under the nearest relevant `__tests__/` directory and mirror
the production domain. Compile-time type fixtures remain under
`packages/framekit/tests/types/`; root Playwright E2E remains under
`tests/e2e/`.

## Implementation sequence

1. Confirm the package-owned `playwright-core` pin and runtime/browser compatibility.
2. Add the explicit FrameKit browser command and focused dependency-resolution tests.
3. Finalize server/client/Next exports, externalization, types, and lockfile changes.
4. Add Dockerfile/.dockerignore/.env.example using the FrameKit command and
   preserve Step 0.6's minimal routes.
5. Add creator inventory/generation/browser-command assertions.
6. Build FrameKit, Studio, and canonical generated consumer.
7. Build Docker from a clean context with no pre-existing local build output.
8. Verify final standalone Map sharing, route assets, user, browser path, and
   browser launch.
9. Pack public packages and inspect tarball contents/references.
10. Optimize runner dependency copying only after the working production shape is
    proven.

## Focused tests and checks

- Frozen dependency install succeeds with committed lockfile.
- Installation uses FrameKit's intended Playwright resolution even when the
  consumer has another version or no direct Playwright dependency.
- CLI delegates fixed shell-install arguments, honors browser path, propagates
  errors, rejects unsupported arguments, and does not download during ordinary
  dependency install or other FrameKit commands.
- FrameKit package emits valid `server` targets.
- Client-capable entries remain free of server dependencies.
- Creator copies deployment files and the five-file application integration;
  generated bindings are reproduced and obsolete wrappers are absent.
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
- the minimal source inventory and clean generated-binding recovery pass;
- `framekit browser install` works from an isolated packed consumer without a
  consumer-managed Playwright pin, and the Docker variant installs system deps;
- a clean Docker build starts the standalone consumer and launches matching
  Chromium as non-root;
- final standalone proves the `globalThis` Map handoff;
- no secret/browser binary/workspace reference leaks into public tarballs;
- focused creator/package checks and repository build pass.
