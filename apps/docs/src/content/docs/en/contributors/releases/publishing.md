---
title: Publishing a release
description: Run FrameKit's pre-publication, publication, and post-publication package gates without selecting release values in advance.
---

# Publishing a release

This procedure applies only to the public packages
`@mauriciodmo/framekit` and `@mauriciodmo/create-framekit`. The root workspace,
Studio, and the documentation site are private and are not publish targets.
Keep the package versions, release-time npm dist-tag, exact registry specs, and
final dist-tag as values supplied during the release. This page does not select
any of them.

## Before publication

Run release commands from the repository root with the Node.js and pnpm
versions declared by the repository. Check the runtime contract first:

```bash
pnpm check:runtime
```

Build the public packages in order. Build FrameKit first so generated consumers
and the creator workflow resolve its current built output:

```bash
pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
```

Run the repository gates, then create both package archives for inspection:

```bash
pnpm lint
pnpm test
pnpm typecheck
pnpm build
pnpm --filter @mauriciodmo/framekit pack
pnpm --filter @mauriciodmo/create-framekit pack
```

The package manifests run a build during `prepack`, and each public package has
lint, test, and type-check checks in `prepublishOnly`. The explicit build order
above still matters when diagnosing stale output or inspecting the artifacts.

## Inspect tarballs and isolated consumers

The version-independent pre-publication gate is:

```bash
pnpm smoke:tarballs
```

`tooling/smoke-tarballs.mjs` creates both tarballs in a temporary directory
outside the checkout and checks their expected files, manifest targets, binary
shebangs, and package boundaries. It rejects tests, secrets, browser binaries,
workspace references, local links, local `file:` references, and checkout paths.

The same command runs two isolated consumer paths:

- an independent consumer installed from the FrameKit tarball, with public
  export resolution and `framekit generate`, `framekit check`, and
  `framekit build`;
- a consumer generated from the creator tarball, with a clean install,
  generated bindings, `generate`, `check`, production `build`, standalone
  `start`, HTTP readiness, authentication and route checks, and cleanup.

These are local artifact checks before publication. They do not prove that npm
serves the package or that a Docker image can install it. The [distribution guide](/en/contributors/distribution) and [generated consumer guide](/en/contributors/distribution/generated-consumer) describe the artifact and consumer boundaries in detail.

## CI and browser gates

Review the current CI result for the change. The workflow runs the full Linux
verification lane on Node.js `22.13.0` and `24`, a focused Windows generated-
consumer and packaging lane on Node.js `22.13.0`, and a Chromium E2E lane on
Linux. The Linux lane builds both public packages, runs lint, tests,
type-checking, the workspace build, and package dry-run checks.

When the change affects browser or Studio behavior, run the current Chromium
gate locally with the same browser installation used by CI:

```bash
pnpm install --frozen-lockfile
pnpm exec playwright install --with-deps chromium
pnpm test:e2e
```

The CI workflow does not run the tarball or Docker smoke scripts. Those remain
separate release gates. See [continuous integration](/en/contributors/testing/ci)
and [E2E and smoke tests](/en/contributors/testing/e2e-and-smoke) for their
scopes and limits.

## Publish selected packages

Check the npm session and publish only the public package or packages included
in this release. Use a release-time npm dist-tag that is not the final
promotion tag. If both packages are being released, publish FrameKit first:

```bash
npm whoami
: "${PUBLISH_TAG:?Set the release-time npm dist-tag}"
# Run only the commands for packages included in this release.
pnpm --filter @mauriciodmo/framekit publish --access public --tag "$PUBLISH_TAG"
pnpm --filter @mauriciodmo/create-framekit publish --access public --tag "$PUBLISH_TAG"
```

Do not use `npm publish --workspace` or `npm publish --prefix`; this workspace
defines package ownership through pnpm. Do not add `--otp` to the publish
command. If npm requests an OTP, enter it in the interactive terminal.

## After publication

### Docker smoke

After the exact FrameKit package is available from npm, run the registry-backed
Docker check when the release includes the generated Docker consumer path:

```bash
pnpm smoke:docker -- <exact-published-framekit-version>
```

The script requires one exact published semver. It verifies the package through
npm, builds and runs the generated image, checks its non-root `node` user and
`tini` entrypoint, exercises authentication and PNG rendering, and checks
persistence across container replacement. It is not a substitute for the local
tarball smoke, unit tests, type-checking, or Chromium E2E.

### npm registry smoke

Run the post-publication npm smoke only after the selected packages are
available in the registry. The smoke checks both public package contracts, but
the two packages do not have to be part of the same release. Supply exact,
release-time values for `CORE_SPEC` and `CREATOR_SPEC`, plus one expected tag
for each package:

- For a package included in this handoff, use its exact newly published spec and
  the release-time tag used for that package's publication.
- For an unchanged package, use its existing exact published spec and its
  existing intended tag. Do not require the unchanged package to receive the
  new publication tag.

Use `EXPECTED_FRAMEKIT_DIST_TAG` for `@mauriciodmo/framekit` and
`EXPECTED_CREATE_FRAMEKIT_DIST_TAG` for `@mauriciodmo/create-framekit`. If both
packages are released together, both values may be the same release-time tag.
If only one package is released, only that package uses the release-time tag;
the other value remains the unchanged package's intended tag.

The complete current registry smoke is reproducible from a Bash shell outside
the checkout context used by the temporary consumer:

```bash
set -eu

: "${CORE_SPEC:?Set the exact @mauriciodmo/framekit npm spec}"
: "${CREATOR_SPEC:?Set the exact @mauriciodmo/create-framekit npm spec}"
: "${EXPECTED_FRAMEKIT_DIST_TAG:?Set FrameKit's expected npm dist-tag}"
: "${EXPECTED_CREATE_FRAMEKIT_DIST_TAG:?Set create-framekit's expected npm dist-tag}"

CORE_VERSION="$(npm view "$CORE_SPEC" version)"
CREATOR_VERSION="$(npm view "$CREATOR_SPEC" version)"
test "$CORE_SPEC" = "@mauriciodmo/framekit@$CORE_VERSION"
test "$CREATOR_SPEC" = "@mauriciodmo/create-framekit@$CREATOR_VERSION"

# Check each package's expected tag independently.
test "$(npm view @mauriciodmo/framekit "dist-tags.$EXPECTED_FRAMEKIT_DIST_TAG")" = "$CORE_VERSION"
test "$(npm view @mauriciodmo/create-framekit "dist-tags.$EXPECTED_CREATE_FRAMEKIT_DIST_TAG")" = "$CREATOR_VERSION"

SMOKE_DIR="$(mktemp -d)"
SERVER_PID=""
cleanup() {
  if test -n "$SERVER_PID"; then
    kill "$SERVER_PID" 2>/dev/null || true
    wait "$SERVER_PID" 2>/dev/null || true
  fi
  rm -rf "$SMOKE_DIR"
}
trap cleanup EXIT

# The runner and consumer are outside the FrameKit checkout.
mkdir "$SMOKE_DIR/runner"
cd "$SMOKE_DIR/runner"
npm init -y >/dev/null
npm install "$CREATOR_SPEC" "$CORE_SPEC"
test -x node_modules/.bin/create-framekit
test -x node_modules/.bin/framekit
test -f node_modules/@mauriciodmo/create-framekit/dist/cli.js
test -f node_modules/@mauriciodmo/framekit/bin/framekit.js
node --input-type=module <<'NODE'
for (const specifier of [
  '@mauriciodmo/framekit',
  '@mauriciodmo/framekit/client',
  '@mauriciodmo/framekit/dev',
  '@mauriciodmo/framekit/editor',
  '@mauriciodmo/framekit/next',
  '@mauriciodmo/framekit/server',
  '@mauriciodmo/framekit/studio',
  '@mauriciodmo/framekit/studio/root',
  '@mauriciodmo/framekit/styles.css',
]) console.log(specifier, import.meta.resolve(specifier))
NODE

npx --no-install create-framekit "$SMOKE_DIR/consumer" -n
cd "$SMOKE_DIR/consumer"
CORE_VERSION="$CORE_VERSION" node --input-type=module <<'NODE'
import { readFile, writeFile } from 'node:fs/promises'

const packagePath = 'package.json'
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
const declared = packageJson.dependencies?.['@mauriciodmo/framekit']
if (typeof declared !== 'string' || declared.length === 0) throw new Error('Creator template has no FrameKit dependency')
console.log(`Creator template FrameKit dependency: ${declared}`)
packageJson.dependencies['@mauriciodmo/framekit'] = process.env.CORE_VERSION
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
NODE
npm install
CORE_VERSION="$CORE_VERSION" node --input-type=module <<'NODE'
import { readFile } from 'node:fs/promises'

const installed = JSON.parse(await readFile('node_modules/@mauriciodmo/framekit/package.json', 'utf8'))
if (installed.version !== process.env.CORE_VERSION) throw new Error(`Unexpected FrameKit version: ${installed.version}`)
NODE
npx --no-install framekit generate
npx --no-install framekit check
npx --no-install framekit build
test -f src/generated/framekit/templates.ts

PORT=4318
HOSTNAME=127.0.0.1 PORT="$PORT" npx --no-install framekit start > "$SMOKE_DIR/start.log" 2>&1 &
SERVER_PID=$!
node --input-type=module - "$PORT" <<'NODE'
const port = process.argv[2]
const deadline = Date.now() + 30_000

while (Date.now() < deadline) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/login`)
    if (response.ok) process.exit(0)
  } catch {
    // The standalone server may still be starting.
  }
  await new Promise((resolve) => setTimeout(resolve, 250))
}

console.error(`Studio was not ready on port ${port}`)
process.exit(1)
NODE
```

Before cleanup runs, record `CORE_SPEC`, `CREATOR_SPEC`, both expected package
tags, the resolved versions, registry, Node.js and npm versions, timestamp,
PASS or FAIL, relevant command output, and `$SMOKE_DIR/start.log`. The
creator's declared FrameKit version or range and the installed exact core
version belong in that record. The `cleanup` trap stops the standalone server
and removes the temporary runner and consumer. Never publish or change a
dist-tag as part of this check. A successful npm upload is not a successful
registry gate; a registry-smoke failure blocks final promotion, not the initial
upload.

## Promote only after the gates

Do not promote a package to its final dist-tag until the local publication
gates, applicable CI and browser checks, tarball smoke, and post-publication
registry checks have passed. After the Docker check when applicable, promote
only the packages released in this handoff, using the exact versions returned
by the registry smoke:

```bash
npm dist-tag add <package>@<resolved-version> <final-dist-tag>
```

The command above is a release-time handoff. This page intentionally does not
choose a version or a final dist-tag.
