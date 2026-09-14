# Step 8 - Verification and Rollout

## Goal

Prove the feature across pure logic, Next.js integration, the process-global
in-memory job handoff, real Chromium, production Docker, and public package
distribution; update documentation; and define a safe compatibility rollout.

## Depends on

- Completion of Steps 1-7 with passing focused exit gates.
- Steps 0.5 and 0.6 package/integration gates, including the minimal starter.
- Completion of all eight phases in
  [Studio Access, API Tokens, and Server-backed Export](../studio-access-and-api-rendering/README.md).
- Built public package tarballs.
- An isolated creator-generated consumer outside the workspace.

## Deliverables

- Final focused and repository-wide test results.
- Production proof that Route Handler/private page share the same `globalThis`
  job store.
- Real Chromium API smoke in final production container.
- Isolated tarball/generated-consumer smoke.
- Seven-file maintained starter inventory and clean generated-binding recovery.
- SQLite-backed Studio access, sessions, API tokens, and persistent-volume proof.
- Package-owned HTTP pipeline and FrameKit-owned browser installation checks.
- Remote-image SSRF/token-leak/browser-network verification.
- Cleanup/resource verification.
- English/Spanish public documentation.
- Changelog + compatibility and migration note.
- Rollout/rollback checklist and known limitations.

Evidence already recorded against the original API-key and browser-export
baseline remains historical proof for Steps 1-7. The active verification
inventory below uses SQLite access data, sessions, API tokens, the seven-file
starter, server-backed Studio export, and persistent Docker storage. Render jobs
remain memory-only.

## Verification strategy

Keep four distinct levels; passing one does not imply the others.

Runtime tests live under the nearest relevant `__tests__/` directory and mirror
the production domain. FrameKit server tests use
`packages/framekit/src/server/__tests__/`; the shared raster and canvas tests use
`packages/framekit/src/shared/__tests__/raster-image.test.ts` and
`packages/framekit/src/editor/components/__tests__/template-canvas.test.tsx`.
Compile-time type fixtures remain under `packages/framekit/tests/types/`, Studio
integration tests under `apps/studio/src/__tests__/`, and root Playwright E2E
under `tests/e2e/`.

| Level | Proves | Does not prove |
|---|---|---|
| Unit/component | Parsing, auth, image fetch policy, Map state, browser state, canvas/markers | Actual Next process layout or browser binary |
| Next integration | Generated registry/routes and production `globalThis` Map handoff | Installed Chromium/system libraries |
| Docker browser smoke | Final standalone app, Chromium capture, packaged assets, binary response | Detailed request and remote-image policy |
| Isolated package smoke | Packed FrameKit/creator artifacts work outside monorepo | Future registry publication/version promotion |

## Focused test inventory

### Contract/config/auth

- strict env parsing and production fail-closed behavior;
- loopback-only internal origin;
- exact allowed-image-host parsing;
- bounded numeric settings;
- constant-time classic `FRAMEKIT_API_KEY` Bearer contract;
- canonical session/API-token authentication, invalid-Bearer precedence, and
  same-origin cookie enforcement;
- stable error-code/status mapping;
- public server export type fixture/client-server boundary.

### Data/image/canvas

- shared canvas receives exact canonical props;
- Studio Download PNG and Copy PNG use the canonical server image route;
- raster signatures + strict base64;
- data URL/root-relative policy;
- remote HTTPS URL exact-host policy;
- manual redirect revalidation/count;
- remote byte/content-type/signature checks;
- remote URL converted to data URL before browser;
- generated manifest never mutated;
- API image override precedence;
- no duplicate base64 in edits/assets.

### Temporary jobs

- process-global Map shared across independently imported bundles/modules;
- ID/token entropy/independence;
- constant-time private token comparison;
- resolved payload contains no API/public auth secret;
- wrong-token/missing/expired indistinguishability;
- idempotent deletion;
- opportunistic expiry cleanup;
- concurrent job isolation;
- no filesystem activity.

### Browser manager

- one Chromium launch for concurrent cold starts;
- reconnect behavior after browser disconnect;
- atomic active-render capacity limit;
- all failure paths release slot/close context/delete job exactly once;
- fixed loopback navigation origin;
- external browser requests blocked;
- private token added only to exact private main document;
- no token on chunks/assets/other requests;
- ready/error/font/image wait behavior;
- timeout/request-abort cancellation;
- PNG signature/root capture;
- import creates no idle/watchdog/signal timers.

### Next routes

- private lookup/header/not-found behavior;
- registry loader/definition dimension/variant mismatch checks;
- no duplicate resolve/validate pipeline in private client;
- deterministic loading/ready/error markers;
- classic and canonical auth-before-body/registry/fetch/browser ordering;
- bounded body/exact JSON shape;
- remote-image preparation before renderer;
- canonical resolve/validate once;
- success/error headers/raw PNG response;
- request abort propagation;
- template and first-party Studio adapter parity;
- handler factory import works without runtime secrets; the adapter contains no
  application-owned HTTP pipeline;
- the same deadline covers slow body reads, image preparation, and capture;
- `/` redirects temporarily to `/editor`; the unified section route preserves
  editor/brand nested slug behavior and rejects unknown sections;
- explicit API/private routes retain precedence and the development asset
  endpoint still works.

### Canonical starter/access/configuration/browser tooling

- final starter has exactly seven maintained `src/app` files: the unified Studio
  page, login page, access route, image route, private render page, layout, and
  global CSS;
- old home/editor/brand pages and sibling render-client binding are absent;
- login/access/image/Studio/private-render files remain thin package bindings;
- both generated client bindings are excluded from the creator template and
  recreated from a clean generated directory without rewriting user files;
- neutral registries remain server-consumable and private render imports exclude
  the Studio shell/catalog graph;
- `withFrameKit` preserves project settings, composes redirects, and rejects
  conflicting reserved settings without mutation;
- packed `./next` imports in ordinary Node without request/browser dependencies;
- existing manual config/explicit routes remain supported for unmigrated apps;
- `framekit browser install` uses FrameKit's pinned Playwright resolution without
  a direct consumer Playwright dependency, including a conflicting consumer pin;
- installer honors the browser path and exit codes; the Docker `--with-deps`
  command produces system libraries and the matching headless shell;
- normal dependency installation and other FrameKit commands do not download
  browser binaries.

## Canonical browser fixture

Use one small template rather than a large visual matrix. It should include:

- fixed known width/height;
- visible text;
- one packaged local image asset;
- one image field accepting data URL;
- representative local font/style path;
- deterministic layout suitable for basic PNG presence/dimension checks without
  cross-platform snapshots.

Prefer the canonical generated example if it can cover these cases clearly.
Otherwise add one focused fixture, not a second application architecture.

## Real Docker/Chromium smoke

Build and run the final generated-consumer image with runtime configuration and
the packaged local image fixture. Remote-image policy remains in focused tests;
the Docker smoke does not maintain certificates, host mappings, or an HTTPS
fixture.

### Startup checks

1. Container process is `tini` -> non-root Node standalone server.
2. HTTP readiness succeeds.
3. `/data` is writable by the runtime user and contains SQLite, WAL, and SHM
   files only after runtime initialization.
4. Public/generated static template assets return `200`.
5. Chromium executable exists under configured browser path.
6. No browser starts before first valid render request.
7. No FrameKit temp render-job directory/file exists.

### API checks

1. Empty-volume boot creates the configured administrator.
2. Missing session/API token -> `401`.
3. Same-origin login and session-authenticated render -> non-empty PNG.
4. Generated API-token render -> non-empty PNG.
5. Response headers, signature, and declared dimensions match.
6. Container replacement with the same volume preserves users, sessions, and
   API tokens while clearing temporary render jobs.

Detailed malformed input, remote-image policy, browser network/token scoping,
capacity, timeout, abort, and cleanup behavior remains in the focused Vitest
suites. The production Playwright E2E separately proves the authenticated route,
private-page handoff, and Chromium capture.

### PNG checks

Without adding a decoder solely for this plan:

- verify eight-byte PNG signature;
- read IHDR width at offset 16 and height at offset 20 as big-endian unsigned
  integers;
- compare with definition dimensions;
- verify non-trivial buffer length;
- optionally inspect deterministic region using already-installed capability.

Do not promise pixel-identical output across Chromium/platform versions.

### Cleanup and lifecycle checks

Focused tests verify job, context, capacity, abort, and timeout cleanup. The
Docker smoke always removes its container, image, and temporary consumer.

## Production Map compatibility smoke

This is a hard architecture gate, not an optional test.

In final standalone/Docker:

1. public route creates a job through the package helper;
2. Chromium/private page loads it through another bundled route/page module;
3. payload is visible only with correct token;
4. deletion in renderer is visible immediately;
5. two concurrent requests remain isolated;
6. restarting the Node process clears all jobs.

If this fails, v1 cannot ship with the Map store. Change the store implementation
behind the same API before release rather than adding per-bundle Maps.

## Isolated tarball consumer smoke

1. Build `@mauriciodmo/framekit` tarball.
2. Build creator tarball.
3. Create a directory outside repository.
4. Generate a project from creator tarball.
5. Install local FrameKit tarball as appropriate.
6. Install dependencies with generated lock/package-manager contract.
7. Check the seven-file source inventory, then run generation/check/build from
   absent generated output, verifying both client bindings are recreated.
8. Inspect installed package/tarballs for workspace paths, secrets, and browser
   binaries.

The registry-backed Docker smoke is separate because it requires an exact
published FrameKit version. It builds the canonical image and verifies one local
asset render without repeating the tarball checks.

Exercise both creator install-and-generate and skip-install workflows. In the
latter, install dependencies before a normal FrameKit generate/check/dev/build
command. Verify the packed config facade in Node and browser installation through
FrameKit's command, with no direct consumer `playwright-core` dependency. Use one
focused resolution test with an unrelated consumer Playwright version to prove
the installer does not pick it up.

## Small smoke harness

A small Node script may build the canonical image, wait for readiness, bootstrap
and log in, reject a request without authentication, verify session and API-token
PNG responses, replace the container while retaining its temporary volume, and
clean up all resources. HTTPS reverse-proxy behavior remains in the browser E2E
rather than adding certificate management to this smoke.

The application itself must not write rendered PNGs/jobs to disk as part of the
runtime path.

## Repository commands

Use repository-standard commands current at implementation time, including:

- install/lock update;
- package lint/test/typecheck/build;
- Studio tests/build;
- creator tests;
- canonical generated app check/build;
- package pack inspection;
- Docker build/run smoke.

Do not document stale exact command/version strings if repository tooling changes
before implementation.

## Performance/resource observations

Record at least:

- warm render duration;
- cold browser first-render duration;
- process RSS before browser, after browser launch, and under configured
  concurrency;
- output PNG size;
- remote image fetch duration/bytes;
- behavior near 12 MB request/8 MB image bounds;
- size/latency impact of large data URLs passing through the private Next page.

These observations are not benchmark promises. They identify whether initial
limits are sane and whether RSC/client serialization of large resolved payloads
needs a future redesign.

## Security review checklist

Release-blocking items:

- auth occurs before body/template/fetch work;
- no API key, API token, or session credential enters job/browser/page/log;
- job token never enters URL/client props/log;
- job token only reaches exact private main document;
- public/private job failures do not create an ID/token oracle;
- `globalThis` Map has TTL + guaranteed normal cleanup;
- no render payload written to filesystem;
- remote URL requires HTTPS + exact allowlisted hostname;
- redirects are manually revalidated/bounded;
- remote IP literals/loopback/private redirects rejected;
- remote response bytes bounded while streaming;
- MIME/signature validated;
- Chromium external network blocked;
- caller cannot select arbitrary browser page/viewport/HTML;
- browser context isolated per render;
- no request secret in error/log;
- Docker runs application/browser as non-root with sandbox limitation documented.

Any failed trust-boundary item blocks completion even if happy-path PNG works.

## Documentation rollout

### English and Spanish

Document:

- public API request/response;
- canonical Studio session/API-token authentication and the compatible classic
  `FRAMEKIT_API_KEY` handler;
- first-boot administrator configuration, recurring environment behavior, HTTPS,
  reverse-proxy login throttling, and persistent SQLite volume ownership;
- exact allowed-image-host configuration;
- data URL/root-relative/remote URL examples;
- fact that remote HTTPS images are downloaded by Node and Chromium does not
  access arbitrary Internet resources;
- Docker build/run;
- `framekit browser install` and `--with-deps`, browser-path configuration, and
  common launch failures; users do not coordinate a separate Playwright pin;
- status/error reference including `image_fetch_failed`;
- request/image/timeout/concurrency limits;
- one-process-per-container + long-lived Node support boundary;
- Chromium sandbox limitation;
- local font/asset recommendation;
- testing/distribution smoke instructions.

### Project/template docs

Update:

- generated template README;
- placeholder `.env.example`;
- supported package imports and implemented signatures for `createImageHandler`,
  `createStudioImageHandler`, `createStudioAccessHandler`, `createRenderClient`,
  `createRenderPage`, `createStudioPage`, `createLoginPage`, and `withFrameKit`;
  the final export map includes `./next`, with no server/browser/auth/shared
  subpaths;
- the seven-file app source tree, consumer-owned routes/styles, and generated
  registry/client bindings; never instruct users to edit generated bindings;
- package/repository AGENTS instructions and skill sources under `Docs/skills/`
  when their public-import or consumer-file maps change; regenerate synchronized
  skill copies through the existing sync command;
- note that Dockerfile is pnpm-specific initially;
- note that Studio Download PNG and Copy PNG use the server route while local
  preview remains client-side;
- note that server-rendered templates should package fonts/styles/assets locally
  rather than relying on remote browser resources.

### Release records

- root `CHANGELOG.md` under `Unreleased`;
- English/Spanish migration notes;
- explicit compatibility and database-backed Studio migration statement;
- known limitations: one process/store, PNG only, no serverless/Edge, no public
  async jobs, no Chromium external network.

### Existing-consumer migration

The seven-file authenticated layout is the default for newly scaffolded
projects. Existing classic API consumers may retain
`createImageHandler(templates)` and `FRAMEKIT_API_KEY`, but adopting
database-backed Studio access is not entirely additive.

Document this order:

1. Upgrade FrameKit and regenerate registries plus client bindings.
2. Configure first-boot administrator credentials and a persistent
   `FRAMEKIT_DATABASE_PATH`; preserve the SQLite files during later upgrades.
3. Add the login and access route adapters.
4. Update the unified section adapter to use the authenticated
   `createStudioPage()` contract and generated `StudioClient` user prop.
5. Bind the canonical image route with `createStudioImageHandler(templates)`;
   retain a separate classic route only when an external API-key consumer needs
   it.
6. Adopt `withFrameKit` where appropriate, preserve custom Next settings, install
   FrameKit's browser, and verify login, existing URLs, PNG output, persistence,
   and project styles before removing obsolete files or dependencies.

Do not move template data/assets or require a hidden generated Next application.

## Observability acceptance

Operational logs may include only:

- coarse request/job correlation ID;
- template slug;
- result code;
- duration;
- PNG byte length;
- browser launch/disconnect lifecycle;
- remote image fetch coarse host/result only if logging policy permits hostname.

Never include API keys, API/session tokens, credential hashes, field data,
base64, full URL/query, response bodies, or raw Playwright exceptions in public
logs.

## Rollout sequence

1. Retain the completed Steps 1-7 rendering evidence.
2. Complete Studio Access, API Tokens, and Server-backed Export Phases 1-8.
3. Build and pack both public packages and generate an isolated seven-file
   consumer.
4. Run focused, repository, browser, tarball, reverse-proxy, and two-container
   persistence gates against the final architecture.
5. Update English/Spanish docs, changelog, migration, and rollback notes.
6. Release only when every final checklist item passes.

## Rollback

Rolling back to the previous package may restore the classic image handler and
browser-based Studio behavior with `FRAMEKIT_API_KEY`, but database-backed Studio
access is not additive. Keep the SQLite volume intact during rollback so a later
retry preserves users and tokens. Never downgrade or delete access data
implicitly; removal is an explicit operator action.

Template definitions and generated assets still require no data migration.

## Final acceptance checklist

- [ ] Classic API-key and canonical session/API-token auth contracts work and
  fail closed.
- [ ] Exact request parsing/body limits pass.
- [ ] Local/data/remote image preparation works.
- [ ] Node remote fetch redirect/size/MIME/signature policy passes.
- [ ] Chromium makes no unexpected external request.
- [ ] Private token is scoped to one document request.
- [ ] Map handoff works in final standalone/Docker.
- [ ] Map jobs clean up after success/error/abort/timeout.
- [ ] Canonical resolve/validate runs once before browser.
- [ ] Private page renders already-resolved data.
- [ ] Browser capacity/timeout/isolation pass.
- [ ] Raw PNG headers/signature/dimensions pass.
- [ ] Studio Download PNG and Copy PNG use the canonical server image route.
- [ ] Packed packages work outside workspace.
- [ ] Starter has seven maintained app files and clean generation restores client
  bindings.
- [ ] SQLite access data survives container replacement; render jobs do not.
- [ ] HTTPS reverse-proxy same-origin login, mutation, and image rendering pass.
- [ ] Root/editor/brand URLs, unknown-section handling, and reserved routes work.
- [ ] Config preset imports safely and preserves project settings.
- [ ] Public route is only a binding to the complete package HTTP handler.
- [ ] One deadline/abort signal covers body, images, and capture.
- [ ] Browser installation uses FrameKit's pin without consumer version management.
- [ ] Docker runs non-root with matching Chromium.
- [ ] Logs contain no sensitive request data.
- [ ] English/Spanish docs/changelog/migration notes are current.

## Exit gate

Step 8 is complete when all final acceptance items pass in the supported
long-lived single-process Node/Docker runtime and public documentation accurately
states the limitations and security model.
