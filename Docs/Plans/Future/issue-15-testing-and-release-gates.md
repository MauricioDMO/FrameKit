# Issue #15 — Testing and Release Gates

- **GitHub issue:** https://github.com/MauricioDMO/FrameKit/issues/15
- **Status:** Active; GitHub issue state is authoritative.
- **Release:** No version preselected; versions are runtime inputs to release checks.
- **Depends on:** Focused coverage delivered with #2–#14.

## Objective

Close the remaining cross-layer test gaps and define reproducible, versionless
repository and distribution gates. Keep per-issue contract verification,
per-PR CI, pre-publication tarball validation, and post-publication registry
validation distinct so none is mistaken for a release-version plan.

## Current baseline

- Ubuntu CI runs Node.js `22.13.0` and `24` with pnpm `11.14.0`, runtime checks,
  builds, lint, tests, typecheck, workspace build, and package dry runs.
- Windows CI uses Node.js `22.13.0` but only builds and dry-packs
  `@mauriciodmo/create-framekit`; it does not exercise the runtime or a generated
  consumer.
- Unit, type, jsdom component, codegen, CLI, creator, and first-party Studio
  integration tests exist. Issues #3–#14 own the focused additions required by
  their contracts.
- There is no real-browser E2E, production build/start smoke, PNG browser smoke,
  or automated isolated tarball consumer.
- Tarball installation is documented as a manual external check. CI dry-pack
  output and `check-dist` validate useful boundaries but do not prove that both
  tarballs install and work together outside the workspace.
- No post-publication exact-version npm installation gate exists.

## Three gate levels

### 1. Per-issue contract gate

Each active implementation issue closes with its own focused runtime, type,
component, integration, documentation, changelog, migration, and generated
consumer work. Issue #15 audits that final matrix and adds only cross-layer gaps;
it does not recreate a second test suite for every canonical rule.

### 2. Permanent pull-request CI

#### Linux

Keep the supported Node.js matrix `22.13.0` and `24`, both with pnpm `11.14.0`.
Each lane runs the runtime contract check, frozen install, lint, tests,
typecheck, workspace build, and dry package inspection. Simplify duplicate build
steps only when dependency order and equivalent coverage remain explicit.

#### Windows

Use Node.js `22.13.0` and pnpm `11.14.0` for one focused smoke lane that:

- installs with the frozen lockfile;
- builds both public packages;
- runs path/discovery/creator-focused tests and workspace typecheck;
- creates a project non-interactively;
- verifies generated-project installation or its isolated creation API as
  appropriate for CI;
- runs `framekit generate` and `framekit check` in that consumer;
- dry-inspects both public packages.

Do not claim production-build, browser, or full Windows support from a creator
pack dry run alone.

#### Chromium

Add one Playwright Chromium critical-path E2E on Ubuntu with the minimum Node.js
runtime. Reuse one canonical mixed-field template instead of creating a large
browser fixture matrix. The flow must:

1. start Studio and open a generated-registry template;
2. confirm canonical metadata;
3. change variant and edit text, number, choice, boolean, and color;
4. observe updated preview output;
5. trigger one invalid edit and confirm the last valid preview/error behavior;
6. export a non-empty PNG and verify its declared dimensions.

Image upload remains covered by focused integration tests unless the E2E can
exercise it without making the critical path flaky. Clipboard export, pixel
snapshots, and one E2E per control are not required.

macOS is not a mandatory matrix lane until FrameKit explicitly claims verified
macOS support or a platform-specific failure justifies it.

### 3. Distribution gate

#### Before publication

After maintainers choose package versions during release preparation, run the
version-independent repository checks and build real tarballs for only the two
public packages. In an isolated temporary consumer outside the workspace:

- inspect expected tarball files and reject source-only tests, secrets,
  workspace references, or local repository paths;
- install the FrameKit tarball in a basic consumer and run generate/check/build;
- install the creator tarball, create a project non-interactively, replace its
  registry dependency with the FrameKit tarball, and install with a clean
  lockfile;
- run generate, check, and production build in the generated project;
- run `framekit start`, wait for readiness, request a Studio route over HTTP,
  and shut the process down cleanly;
- run the critical Chromium flow against the isolated consumer when practical.

Make this sequence reproducible with one small Node stdlib smoke script or the
existing documented commands plus a checked result record. Do not introduce a
release framework merely to wrap commands.

#### After publication, before promotion

Accept exact published package specs as inputs. Install from npm, not a
workspace or local tarball; verify package exports/binaries, create a project,
confirm the creator's installed FrameKit version/range, and run generate,
check, build, start, and an HTTP request. Verify the intended dist-tag separately.

A failed registry smoke blocks promotion to the recommended `latest` tag. It
cannot prevent the initial package upload, so pre-publication and
post-publication results must not be conflated. Publication and dist-tag changes
remain an explicit maintainer handoff.

## Final coverage matrix

| Layer | Trigger | Required coverage |
|---|---|---|
| Focused unit/type/component/integration | Owning issue and PR | Canonical contract and rejection cases |
| Ubuntu Node 22.13/24 | Every PR | Full repository verification and dry packs |
| Windows Node 22.13 | Every PR | Paths, both packages, creator, generation, check |
| Chromium Node 22.13 | Protected CI gate | Studio typed editing, invalid preview, PNG |
| Isolated tarballs | Release preparation | Real package contents, generated consumer, build/start |
| Exact npm versions | After publication, before promotion | Registry install and package compatibility |

## Fixture policy

Reuse the generated starter and small inline fixtures. Maintain only a canonical
mixed-field template, focused invalid definitions/data, nested/private discovery
fixtures, and isolated generated consumer. Do not add legacy, migration, stale
registry, duplicate per-error projects, or a second full application fixture.

## Ordered implementation steps

1. Map existing and planned #2–#14 tests to the final contract and identify only
   missing cross-layer assertions. Keep ownership links to their execution plans.
2. Update tests and documentation terminology to canonical metadata, variants,
   fields, typed resolution, registry, Studio, and intentional `v1` invalidation.
3. Strengthen Windows CI to build both public packages and exercise a generated
   project through generation and check using non-interactive commands.
4. Add the single Chromium critical-path test and its minimal CI setup. Keep
   browser installation/cache work in one lane rather than every Node matrix job.
5. Add or document the smallest reproducible isolated-tarball smoke, including
   package-content assertions, generated project, production start, HTTP
   readiness, cleanup, and no-workspace-reference checks.
6. Define the post-publication exact-package smoke inputs and result checklist;
   do not embed a version or dist-tag in repository code.
7. Update English/Spanish testing and release docs plus canonical release skills
   with the three gate levels, commands, claims, and known exclusions.
8. Update the root `Unreleased` changelog and both rolling migration guides; as
   this adds verification rather than changing user data, record an explicit
   no-migration note.
9. Run focused tests, full CI-equivalent checks, browser E2E, real tarball smoke,
   and package inspection. Record any manual post-publication handoff separately.

## Verification

- All commands in the Ubuntu and Windows jobs complete on their declared
  runtime and pnpm versions.
- Type fixtures cover all canonical kinds, content/override types, metadata,
  variants, registry entries, and rejected unsupported properties.
- Component/integration tests cover native controls, typed persistence, resolver
  failures, last-valid preview, image behavior, watcher, codegen, and Studio.
- Chromium downloads a non-empty PNG whose header dimensions match the template
  without introducing a PNG parsing dependency.
- Both real tarballs contain expected files, no workspace references, and work
  in an isolated creator-generated project through production start.
- Exact npm package smoke is documented and parameterized for the release
  handoff; no unpublished version is assumed.
- English/Spanish docs and release skills state accurately what automated and
  manual checks prove and do not claim macOS, broad browser, or visual coverage.

## Completion criteria

- Canonical contract coverage has no known cross-layer gap between public types,
  runtime, generated registry, Studio, creator, and packaged consumer.
- Permanent CI covers supported Node versions, meaningful Windows behavior, and
  one real Chromium path.
- Pre-publication tarball and post-publication registry gates are reproducible
  and clearly separated.
- Failed required checks block merge or release promotion through documented
  repository policy; no fixed release version is encoded.
- Documentation, changelog, rolling guides, skills, tests, and plan/issue links
  satisfy the shared Definition of Done.

## Out of scope

- Selecting, publishing, promoting, deprecating, or tagging a package version.
- A version-specific release workflow; issue #16 is obsolete.
- Legacy compatibility, deprecation diagnostics, or source migration tests.
- Mandatory macOS, Firefox, WebKit, broad visual regression, or large-catalog
  load testing.
- Exhaustive E2E duplication of focused field and validation tests.
- npm credentials, Trusted Publishing setup, or automatic dist-tag mutation.
