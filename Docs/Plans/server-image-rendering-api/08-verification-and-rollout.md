# Step 8 - Verification and Rollout

## Goal

Prove the feature across pure logic, Next.js integration, the process-global
in-memory job handoff, real Chromium, production Docker, and public package
distribution; update documentation; and define a safe additive rollout.

## Depends on

- Steps 1-7 complete with focused exit gates.
- Built public package tarballs.
- An isolated creator-generated consumer outside the workspace.

## Deliverables

- Final focused and repository-wide test results.
- Production proof that Route Handler/private page share the same `globalThis`
  job store.
- Real Chromium API smoke in final production container.
- Isolated tarball/generated-consumer smoke.
- Remote-image SSRF/token-leak/browser-network verification.
- Cleanup/resource verification.
- English/Spanish public documentation.
- Changelog + additive migration note.
- Rollout/rollback checklist and known limitations.

## Verification strategy

Keep four distinct levels; passing one does not imply the others.

| Level | Proves | Does not prove |
|---|---|---|
| Unit/component | Parsing, auth, image fetch policy, Map state, browser state, canvas/markers | Actual Next process layout or browser binary |
| Next integration | Generated registry/routes and production `globalThis` Map handoff | Installed Chromium/system libraries |
| Docker browser smoke | Final standalone app, Node remote fetch, Chromium capture, fonts/assets, binary response | Published npm tarballs |
| Isolated package smoke | Packed FrameKit/creator artifacts work outside monorepo | Future registry publication/version promotion |

## Focused test inventory

### Contract/config/auth

- strict env parsing and production fail-closed behavior;
- loopback-only internal origin;
- exact allowed-image-host parsing;
- bounded numeric settings;
- constant-time Bearer contract;
- stable error-code/status mapping;
- public server export type fixture/client-server boundary.

### Data/image/canvas

- shared canvas receives exact canonical props;
- Studio export/copy remains functional;
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
- public auth-before-body/registry/fetch/browser ordering;
- bounded body/exact JSON shape;
- remote-image preparation before renderer;
- canonical resolve/validate once;
- success/error headers/raw PNG response;
- request abort propagation;
- template and first-party Studio adapter parity.

## Canonical browser fixture

Use one small template rather than a large visual matrix. It should include:

- fixed known width/height;
- visible text;
- one packaged local image asset;
- one image field accepting data URL;
- one image field accepting allowlisted HTTPS URL (fetched by Node);
- representative local font/style path;
- deterministic layout suitable for basic PNG presence/dimension checks without
  cross-platform snapshots.

Prefer the canonical generated example if it can cover these cases clearly.
Otherwise add one focused fixture, not a second application architecture.

## Real Docker/Chromium smoke

Build/run final generated-consumer image with runtime secrets and a controlled
HTTPS image fixture.

The remote fixture should be under test control so redirect/content-type/size
behavior can be deterministic. If CI uses a private CA, install that CA only in
the smoke environment rather than disabling TLS verification globally.

### Startup checks

1. Container process is `tini` -> non-root Node standalone server.
2. HTTP readiness succeeds.
3. Public/generated static template assets return `200`.
4. Chromium executable exists under configured browser path.
5. No browser starts before first valid render request.
6. No FrameKit temp render-job directory/file exists.

### API checks

1. Missing API token -> `401`.
2. Wrong token -> same `401`, no template detail.
3. Malformed JSON -> `400` after valid auth.
4. Unknown template -> `404` after auth.
5. Invalid variant/data -> `400`/`422` before browser.
6. Valid default/local asset request -> non-empty PNG.
7. Valid request data URL -> non-empty PNG.
8. Valid allowlisted HTTPS image -> Node fetch succeeds and PNG includes it.
9. Non-allowlisted HTTPS host -> `422` before outbound request.
10. Controlled redirect to allowed host -> works within redirect bound.
11. Redirect to loopback/private IP/unallowlisted host -> rejected before target
    request.
12. Unsupported remote Content-Type/signature -> `415`.
13. Remote response over byte bound -> `413` or documented size semantic.
14. Remote upstream/network failure -> `502 image_fetch_failed`.
15. Requests above render capacity -> bounded success + `503`, no unbounded wait.
16. Deliberately stalled render -> `504` and cleanup.
17. Client abort -> remote fetch/browser work stops without lingering job/context.

### Browser network/token checks

Instrument the controlled environment to prove:

- Chromium never directly requests the external image fixture;
- Node.js is the component making that HTTPS request;
- browser requests remain loopback/internal plus expected data/browser-internal
  resources;
- private `x-framekit-render-token` appears only on
  `/__framekit/render/<id>` main document;
- Next chunks, public assets, generated template assets, API routes, and any
  blocked external request never receive that token.

Any token leak or external Chromium request outside the documented policy blocks
release.

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

After success, error, timeout, and abort:

- render-job Map returns to zero relevant entries;
- active render count returns to zero;
- context is closed;
- browser may remain open for process reuse;
- process restart naturally clears job Map/browser state;
- no render data is persisted to disk;
- logs contain no API key, private token, base64, field content, or full signed
  remote URL.

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
7. Run generation/check/build.
8. Build/run Docker image.
9. Configure API key + allowed test image host at runtime.
10. Exercise local/data/remote image API requests.
11. Verify output PNG and Map cleanup.
12. Inspect installed package/tarballs for workspace paths/secrets/browser
    binaries.

## Small smoke harness

A small Node script may:

- wait for app readiness;
- send authenticated JSON request;
- write raw response bytes to a temp `.png` only inside the test harness;
- verify headers/signature/IHDR;
- issue concurrent requests;
- test 401/422/502/503/504 cases;
- stop container and report coarse diagnostics.

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
- API key never enters job/browser/page/log;
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
- one Bearer API key configuration;
- exact allowed-image-host configuration;
- data URL/root-relative/remote URL examples;
- fact that remote HTTPS images are downloaded by Node and Chromium does not
  access arbitrary Internet resources;
- Docker build/run;
- browser installation/common launch failures;
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
- supported package imports including `./server`;
- note that Dockerfile is pnpm-specific initially;
- note that Studio client export remains available;
- note that server-rendered templates should package fonts/styles/assets locally
  rather than relying on remote browser resources.

### Release records

- root `CHANGELOG.md` under `Unreleased`;
- English/Spanish migration notes;
- explicit additive API statement;
- known limitations: one process/store, PNG only, no serverless/Edge, no public
  async jobs, no Chromium external network.

## Observability acceptance

Operational logs may include only:

- coarse request/job correlation ID;
- template slug;
- result code;
- duration;
- PNG byte length;
- browser launch/disconnect lifecycle;
- remote image fetch coarse host/result only if logging policy permits hostname.

Never include API key/token, field data, base64, full URL/query, response bodies,
or raw Playwright exception in public logs.

## Rollout sequence

1. Merge additive server package internals/exports.
2. Merge shared canvas/image preparation without changing Studio export.
3. Merge Map job + browser/private route behind generated integration.
4. Prove production Map sharing.
5. Merge public route and Docker support.
6. Run full isolated package/Docker smoke.
7. Update docs/changelog/migration notes.
8. Release only when every final checklist item passes.

## Rollback

The feature is additive. Rollback may remove/disable the generated public API
route and Docker documentation while leaving existing Studio/client export
untouched.

Do not migrate existing template data or rewrite generated assets for this
feature, so rollback should not require data migration.

## Final acceptance checklist

- [ ] Public auth contract works and fails closed.
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
- [ ] Studio current export remains functional.
- [ ] Packed packages work outside workspace.
- [ ] Docker runs non-root with matching Chromium.
- [ ] Logs contain no sensitive request data.
- [ ] English/Spanish docs/changelog/migration notes are current.

## Exit gate

Step 8 is complete when all final acceptance items pass in the supported
long-lived single-process Node/Docker runtime and public documentation accurately
states the limitations and security model.
