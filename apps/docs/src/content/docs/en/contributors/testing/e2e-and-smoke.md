---
title: E2E and smoke tests
description: Run Chromium browser checks and distribution smoke tests for FrameKit consumers and containers.
---

# E2E and smoke tests

These checks exercise boundaries that package-local Vitest suites do not. Run
them from the repository root after the focused checks for the change.

## Chromium E2E

Install the browser used by the repository workflow, then run the root E2E
script:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

The root `playwright.config.ts` discovers `e2e/**/*.spec.ts` and uses a Desktop
Chrome device against `http://localhost:3000`. Its web server command builds
`@mauriciodmo/framekit`, builds Studio, and starts the production Studio
server with `FRAMEKIT_AUTH_ENABLED=true`, test-only administrator credentials,
and an in-memory database. Private authenticated scenarios must set the switch
explicitly; the application default remains open mode.

### Studio flow

`e2e/studio.spec.ts` checks that the login route is public and, with the explicit
auth switch, protected routes redirect without credentials. The authenticated flow opens the generated
template route, checks metadata and declared dimensions, switches variants,
edits text, number, color, choice, and boolean fields, and verifies that an
incomplete number draft does not replace the committed preview value. It then
downloads a PNG and checks its PNG signature, header, and declared dimensions.

### Image API flow

`e2e/image-api.spec.ts` checks the authenticated production image API with both
a Studio session and an API token. It verifies rejected unauthenticated access,
PNG response headers, the PNG signature, and the rendered dimensions. An
open-mode image smoke should set `FRAMEKIT_AUTH_ENABLED=false` explicitly and
verify credential-free rendering separately.

The E2E command is a Chromium critical-path check. It does not promise visual
pixel regression coverage, a complete browser matrix, clipboard coverage, or
coverage of every Studio interaction. Firefox and WebKit are not configured
as CI gates.

## Tarball smoke

Run the version-independent packaging smoke from the repository root:

```bash
pnpm smoke:tarballs
```

The script in `tooling/smoke-tarballs.mjs` creates both public tarballs in a
temporary directory outside the checkout. It checks expected archive entries,
package targets, binaries, and package boundaries. It rejects tests, secrets,
browser binaries, workspace references, local links, and checkout paths.

It then verifies two isolated consumer paths:

- an independent consumer installed from the `@mauriciodmo/framekit` tarball,
  including public export resolution, `framekit generate`, `framekit check`,
  and `framekit build`;
- a consumer created by the `@mauriciodmo/create-framekit` tarball, including a
  clean install, generated bindings, `generate`, `check`, production `build`,
  standalone `start`, an explicit `FRAMEKIT_AUTH_ENABLED=false` open baseline,
  an authenticated `FRAMEKIT_AUTH_ENABLED=true` start with bootstrap, token and
  image coverage, and clean shutdown.

This smoke proves that the packed artifacts can be installed and used outside
the checkout. It is not a Vitest suite, does not run a live Docker build or
container, and does not download a browser. Those checks remain separate.

## Docker smoke

Run this release-time check with an exact published FrameKit version:

```bash
pnpm smoke:docker -- <exact-published-framekit-version>
```

`tooling/smoke-docker.mjs` resolves that exact version from npm, copies the
canonical consumer to a temporary directory, creates a lockfile using the
published package, builds the generated Docker image, and runs it with a
persistent volume. It checks the image's non-root `node` user and `tini`
entrypoint, waits for readiness, runs an explicit `FRAMEKIT_AUTH_ENABLED=false`
open-mode scenario with credential-free rendering, then runs an explicit
`FRAMEKIT_AUTH_ENABLED=true` authenticated scenario that rejects an
unauthenticated image request, logs in, creates an API token, and verifies a PNG
response. It also replaces the container to check persisted account and token
behavior and confirms that a temporary render job is not retained after
replacement.

Docker smoke is a registry-backed operational release gate. It requires Docker
and an exact published package version, and it does not replace unit tests,
type-checking, browser E2E, or the tarball smoke. It also does not provide
visual regression or a full browser matrix.

## Compare the gates

| Check | Artifact and environment | Proves | Does not prove |
| --- | --- | --- | --- |
| Chromium E2E | Production Studio build and real Chromium with auth explicitly enabled | Critical login, editing, image API, and PNG paths | Open-mode behavior, pixel equality, clipboard gate, Firefox/WebKit, or every UI flow |
| Tarball smoke | Locally packed public tarballs and temporary consumers | Package contents, public exports, generated consumer build, standalone readiness | Docker image behavior or browser installation |
| Docker smoke | Exact npm package in the generated Docker image in both explicit modes | Registry-backed container build, startup, open/auth behavior, persistence, authentication, and PNG API behavior | Unit-test coverage, visual coverage, or broad browser support |

For package ownership and generated-consumer procedures, use the approved
[distribution guide](/en/contributors/distribution) and [generated consumer
guide](/en/contributors/distribution/generated-consumer).
