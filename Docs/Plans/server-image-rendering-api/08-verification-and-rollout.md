# Step 8 - Verification and Rollout

## Goal

Prove the feature across pure logic, Next.js integration, real Chromium,
production Docker, and public package distribution; update public documentation;
and define a safe additive rollout without introducing a release version in the
plan.

## Depends on

- Steps 1-7 completed with their focused exit gates.
- Built public package tarballs.
- An isolated creator-generated consumer outside the workspace.

## Deliverables

- Final focused and repository-wide test results.
- One real Chromium API smoke in the production container.
- One isolated tarball/generated-consumer smoke.
- Security and cleanup verification.
- English and Spanish public documentation.
- Changelog and additive migration note.
- Rollout/rollback checklist and known limitations.

## Verification strategy

Keep four distinct levels. Passing one does not imply the others.

| Level | Proves | Does not prove |
|---|---|---|
| Unit/component | Parsing, security rules, state transitions, cleanup calls, UI markers | Browser binary or production packaging |
| Next integration | Registry/routes/private page/handler composition | Installed Chromium/system libraries |
| Docker browser smoke | Real standalone app, Chromium capture, fonts/assets, shutdown | Published npm tarballs |
| Isolated package smoke | Public package/creator artifacts work outside workspace | Future registry publication/version promotion |

## Focused test inventory

Each owning step adds tests immediately. Step 8 audits that the final inventory
covers these behaviors without duplicating every case in a browser.

### Contract/config/auth

- strict env parsing and production failure-closed behavior;
- loopback-only internal origin;
- exact host allowlist normalization/rejection;
- bounded numeric settings;
- constant-time Bearer contract;
- stable error-code/status mapping;
- server export type fixture and client/server boundary.

### Data/image/canvas

- shared canvas receives exact canonical props;
- Studio export/copy remains functional;
- raster signatures and strict base64;
- data URL, root-relative path, and HTTPS allowlist policy;
- generated asset manifest is never mutated;
- API image override precedence;
- no duplicate base64 in serialized edits/assets.

### Temporary jobs

- ID/token entropy format and independence;
- safe immediate-child paths and owner-only files;
- strict shape/version/size read;
- wrong-token/missing/expired indistinguishability;
- idempotent normal cleanup;
- bounded stale cleanup;
- concurrent job isolation.

### Browser manager

- one launch for concurrent cold starts;
- initialization/close/disconnect races;
- atomic context-capacity limit;
- all failure paths release/close/delete exactly once;
- fixed navigation origin and network redirect policy;
- ready/error/font/image wait behavior;
- timeout cancellation;
- PNG signature/root capture;
- idle/context backstop and graceful shutdown.

### Next routes

- private lookup/header/not-found behavior;
- registry loader/definition/dimension/variant checks;
- deterministic loading/ready/error markers;
- public auth-before-body/registry/browser ordering;
- bounded body and exact JSON shape;
- canonical validation before browser;
- success/error headers and raw PNG response;
- request abort propagation;
- template and first-party Studio adapter parity.

## Canonical browser fixture

Use one small template rather than a large visual matrix. It must include:

- fixed known width and height;
- text visible in output;
- one packaged common or variant image asset;
- one image field that can receive a data URL;
- one image field that can receive an allowlisted HTTPS URL;
- a font/style path representative of real templates;
- deterministic colors/layout suitable for basic pixel-presence checks if
  needed, without snapshot comparison.

Prefer the canonical generated example if it can cover these cases clearly.
Otherwise add one focused fixture, not a second application.

## Real Docker/Chromium smoke

Build and run the final generated-consumer image. Use runtime secrets and a
controlled HTTPS image fixture whose certificate is trusted by Chromium in the
test environment. If CI provisions a private certificate authority, install
that CA only in the smoke environment; never set production
`ignoreHTTPSErrors` merely to make the test pass. Avoid an uncontrolled
third-party CDN that can make the gate flaky.

### Startup checks

1. Container process is `tini` -> non-root Node standalone server.
2. HTTP readiness succeeds on the public application route.
3. Public/generated static template assets return `200`.
4. Chromium executable is present under `/ms-playwright`.
5. No browser starts before the first valid render request.

### API checks

1. Missing token returns `401`.
2. Wrong token returns `401` with no template detail.
3. Malformed JSON returns `400` after valid auth.
4. Unknown template returns `404` after valid auth.
5. Invalid variant/data returns `400`/`422` before browser capture.
6. Valid default asset request returns non-empty PNG.
7. Valid base64 image request returns non-empty PNG containing the intended
   rendered region.
8. Valid allowlisted HTTPS image renders.
9. Non-allowlisted image host returns `422` before remote request.
10. Concurrent requests above configured capacity receive bounded success plus
    `503`, never process OOM or an unbounded wait.
11. A deliberately stalled resource reaches `504` and cleans all resources.

### PNG checks

Without adding a PNG dependency:

- verify the eight-byte PNG signature;
- read IHDR width at byte offset 16 and height at offset 20 as big-endian
  unsigned integers;
- compare with definition dimensions;
- verify buffer length is non-trivial;
- where practical, inspect a small deterministic pixel/region only with an
  already-installed capability; do not add a decoder solely for this plan.

The gate does not promise pixel-identical output across Chromium/platform
versions.

### Cleanup and lifecycle checks

- successful render leaves no matching job file;
- invalid/timeout/browser-error render leaves no job file;
- context count returns to zero;
- idle-close behavior can be unit-tested with fake timers rather than waiting 30
  minutes in smoke;
- SIGTERM during/after a render closes Chromium and container exits cleanly;
- container restart has no persisted render data;
- logs contain no API key, token, base64, field content, temp path, or signed
  remote URL.

## Isolated tarball consumer smoke

Follow the repository distribution boundary:

1. Build `@mauriciodmo/framekit` tarball.
2. Build `@mauriciodmo/create-framekit` tarball.
3. Create a temporary directory outside the repository.
4. Install/run the creator tarball to generate a project.
5. Replace generated registry dependency with the local FrameKit tarball as
   required by existing distribution instructions.
6. Install from a clean lockfile with no workspace resolution.
7. Run `framekit generate` and `framekit check`.
8. Run the production build.
9. Build the generated Dockerfile from that isolated project.
10. Run the real API smoke against that container.
11. Stop/remove container and temporary consumer.
12. Assert neither package/tarball/output contains workspace or repository-local
    paths.

The smoke must use packed artifacts. A passing workspace Studio test cannot
replace it.

## Small smoke harness

Prefer one Node standard-library script over a new test framework. It may:

- wait for HTTP readiness with a bounded retry deadline;
- issue authenticated requests with native `fetch`;
- write PNG only into its temporary test directory when diagnosis needs it;
- inspect PNG signature/dimensions with `Buffer`;
- check expected statuses/codes;
- terminate child/container processes and clean temp files in `finally`.

Do not commit generated PNG artifacts or secrets.

## Repository commands

After package manifest changes, first update/install dependencies:

```bash
pnpm install
```

Focused checks:

```bash
pnpm --filter @mauriciodmo/framekit test
pnpm --filter @mauriciodmo/framekit typecheck
pnpm --filter @mauriciodmo/framekit build
pnpm --filter studio test
pnpm --filter studio typecheck
pnpm --filter @mauriciodmo/create-framekit test
```

Repository checks:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```

Package checks:

```bash
pnpm --filter @mauriciodmo/framekit pack
pnpm --filter @mauriciodmo/create-framekit pack
```

Then execute the isolated consumer and Docker smoke described above.

## Performance/resource observations

This release does not set a throughput SLA, but the smoke/manual record should
capture enough baseline data to catch obvious regressions:

- cold browser launch duration;
- warm render duration;
- output bytes;
- container memory before browser, during one render, and after context close;
- behavior at configured concurrency `2`;
- browser idle close/restart through focused timer tests.

Do not add a benchmark framework or promise production capacity from one CI
machine. The goal is evidence that limits work and resources return after use.

## Security review checklist

- Public auth executes before template/data detail.
- Missing production key fails closed.
- Internal origin is loopback-only.
- Caller cannot supply top-level navigation URL.
- Image hosts use exact matching, no suffix/wildcard bypass.
- Browser redirects are revalidated.
- `file:` and private/unexpected network requests are blocked.
- Base64 MIME and signatures match.
- Body/image limits are enforced before browser work.
- Job paths cannot traverse or follow unsafe entries.
- Job file permissions and expiry are verified on Linux.
- Private token is not placed in URL/client props/logs.
- Browser contexts do not share cookies/storage.
- Capacity is atomic and bounded.
- Container runs non-root and documents disabled Chromium sandbox.
- Docker image/tarballs contain no secrets/temp data.

Any failed trust-boundary item blocks completion even if happy-path PNG output
works.

## Documentation rollout

Implementation updates at minimum:

### English and Spanish

- public API request/response reference;
- API key and allowed-host configuration;
- base64/URL/project asset examples;
- Docker build/run instructions;
- browser installation and common launch failures;
- status/error reference;
- request, image, timeout, and concurrency limits;
- security warning for allowlisted hosts and disabled Chromium sandbox;
- explicit long-lived Node/Docker support boundary;
- testing/distribution smoke instructions.

### Project/template docs

- generated template README;
- an environment example containing placeholders only;
- supported package import list including `./server`;
- note that the Dockerfile is pnpm-specific initially;
- note that Studio's current client export remains available.

### Release records

- root `CHANGELOG.md` under `Unreleased`;
- English and Spanish rolling migration guides;
- explicit additive/no-template-source-migration statement unless final code
  introduces a real source change;
- link from the eventual GitHub issue to this plan and implementation.

Do not write changelog/migration entries during planning; they are implementation
deliverables.

## Observability acceptance

Allowed operational logs:

- internal correlation/render ID;
- template slug;
- coarse phase durations;
- stable success/error code;
- active context count;
- browser start/disconnect/idle close;
- output byte length.

Forbidden logs:

- API key or authorization header;
- private job token;
- field values or request body;
- base64 content;
- full signed remote URLs;
- temporary JSON or path;
- browser page HTML containing user values.

A metrics/tracing vendor is out of scope. Structured console logs are sufficient
initially if they follow these rules.

## Rollout sequence

1. Merge only after all focused and repository checks pass.
2. Build tarballs and isolated consumer before choosing/publishing a version.
3. Dogfood in `apps/studio` with the API key configured privately.
4. Deploy one container with conservative concurrency `2` and known image hosts.
5. Exercise default asset, base64, and allowlisted remote image cases.
6. Observe memory, latency, cleanup, and error codes.
7. Expand replicas at the deployment layer if needed; do not increase per-process
   concurrency without evidence.
8. Publish/promote packages only through the repository's normal explicit
   maintainer release process.

No release number or npm dist-tag is selected by this plan.

## Rollback

The feature is additive:

- removing/unsetting `FRAMEKIT_API_KEY` fails the API closed with `503`;
- existing Studio client-side PNG export remains available;
- no persisted database/schema rollback exists;
- temporary files disappear through cleanup/container restart;
- rollback can redeploy the previous package/container without data migration.

Do not implement an additional feature flag unless deployment cannot safely
control route availability through configuration.

## Final acceptance checklist

- [ ] Every prior step exit gate passes.
- [ ] Unit/component/integration suites cover all listed trust boundaries.
- [ ] Repository lint, test, typecheck, and build pass.
- [ ] Both public packages pack cleanly.
- [ ] Isolated generated consumer installs/builds without workspace paths.
- [ ] Production Docker image builds from clean context.
- [ ] Real Chromium returns correct-dimension PNG for normal data.
- [ ] Project asset, base64, and allowlisted HTTPS image cases pass.
- [ ] Unauthorized, malformed, blocked-host, capacity, and timeout cases return
      documented results.
- [ ] Success/failure/abort leave no job/context leak.
- [ ] SIGTERM closes browser and container exits cleanly.
- [ ] Logs and artifacts contain no secrets or request payloads.
- [ ] English/Spanish docs, changelog, migration note, and import lists are
      updated.
- [ ] Existing Studio browser export/copy still works.

## Exit gate

Step 8 and the complete plan are finished only when all checklist items are
checked with real command/smoke evidence. A successful unit suite or workspace
build alone is not sufficient.
