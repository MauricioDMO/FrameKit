# Testing and Distribution

## Test Commands

FrameKit uses Vitest as the test runner across all workspaces. The following commands are available from the repository root:

From a fresh checkout, build `@mauriciodmo/framekit` before `pnpm test`,
`pnpm typecheck`, or the focused Studio test; Studio's scripts invoke the
FrameKit CLI from the built package. The CI lane builds the public packages
before those checks.

- `pnpm test` — runs Vitest in all workspaces that define a `test` script
- `pnpm --filter @mauriciodmo/framekit test` — runs unit tests for the core package; tests execute in a Node environment, with jsdom enabled for editor tests that require DOM or localStorage
- `pnpm --filter studio test` — runs integration tests for the Studio application; `framekit generate` is called as a precondition step before Vitest runs
- `pnpm --filter @mauriciodmo/create-framekit test` — runs unit tests for the CLI package
- `pnpm test:e2e` — runs the single Chromium critical-path test; install the browser first with `pnpm exec playwright install chromium`
- `pnpm typecheck` — runs `tsc --noEmit` across all packages and additionally type-checks the type fixture suite (positive and negative template cases)
- `pnpm lint` — runs ESLint across all workspaces
- `pnpm build` — full rebuild of all workspaces; the core package is built first, then all dependent workspaces

## What Is Tested

The following areas are covered by the test suite:

**Template system:** Template discovery via the scanner (nested directories, exclusion of dot/underscore-prefixed paths, slug format validation), codegen of the template registry, and runtime template loading.

**Navigation:** Derivation of the navigation tree from the manifest, alphabetical slug ordering, and nested category handling.

**Data resolution:** Application of default values, variant-content precedence, user-edit overrides, actionable unknown-key failures, and the canonical render boundary.

**Definition and validation:** Runtime validation of the canonical metadata/variant/content shape (invalid descriptors, incoherent bounds, decimal dimensions, unsupported top-level properties, missing render) and field-level validators (required, number range, color format, variant switching behavior).

**Editor state:** localStorage persistence and session restore, reset of a single content variant (only that variant's overrides are removed), variant switching (does not mutate other variants' overrides), and clearing of visible errors on reset or variant change.

**CLI:** Argument parsing and error paths, check gating a Next.js build, and discovery of standalone template directories.

**Browser E2E:** One Playwright Chromium flow opens the generated
`redes-sociales/instagram/promocion-cuadrada` registry entry, verifies its
metadata and dimensions, switches variants, edits text/number/choice/boolean/
color fields, checks that an incomplete number draft does not replace the
committed preview value, and exports a PNG with the declared dimensions.

**Type-level fixtures:** Both positive cases (valid templates that must type-check) and negative cases (invalid templates that must produce a `tsc` error, using `@ts-expect-error`) run as part of `pnpm typecheck`.

## What Is Not Tested

The test suite does not cover:

- **Visual regression** — the Chromium E2E validates the PNG signature and header dimensions, but no PNG pixel or visual snapshot comparison tests exist.
- **Browser matrix** — only Chromium's critical path is covered; Firefox, WebKit, visual snapshots, clipboard export, and image upload are not required gates.
- **Production build and start as one smoke** — CI runs production builds, but does not start the generated standalone server; the isolated tarball smoke below covers the build-and-start sequence manually, not Vitest or the Chromium PR lane.
- **Production standalone asset copying** — copying the consumer's public directory and Next static files into the standalone output is not directly unit-tested; template asset discovery and copying are covered by codegen tests.
- **Other operating systems** — Windows has a focused CI consumer smoke, but this documentation does not claim broad Windows or macOS support.
- **Watcher behavior** — signal propagation, file watching under load, and watcher edge cases are outside the current test scope.

## Gate status

The commands in this document are local checks unless explicitly identified as
workflow steps. Running them locally does not count as a CI result.

- The [CI run 33687196859](https://github.com/MauricioDMO/FrameKit/actions/runs/33687196859)
  completed the Ubuntu Node.js `22.13.0`, Ubuntu Node.js `24`, and Chromium jobs
  successfully. Its Windows lane was executed but failed at `Run discovery and
  codegen tests` after installation and public-package builds; later Windows
  steps were skipped. Treat the Windows gate as failed until a rerun passes.
- The [pre-publication tarball smoke record](../../Plans/Future/evidence/tarball-smoke-2026-09-04.md)
  records PASS for both an independent consumer and a creator-generated
  consumer. Repeat this gate for each release.
- The post-publication npm registry smoke remains pending until the exact
  published packages are available and the check passes; it must pass before
  final dist-tag promotion.

## CI Gates Defined in the Workflow

- The Ubuntu workflow lane is configured to run the full repository checks on Node.js `22.13.0` and `24` with pnpm `11.14.0`.
- The Windows workflow lane is configured to run the focused discovery, codegen,
  creator, typecheck, package, and generated-consumer checks on Node.js
  `22.13.0`; the latest recorded execution is the failed run linked above.
- The Ubuntu workflow lane is configured to run the one Chromium E2E on Node.js `22.13.0`; it installs Chromium and starts Studio with `pnpm dev`.

The configured Windows creator smoke uses `create-framekit <directory> -n`,
installs the generated project's dependencies, and runs `framekit generate` and
`framekit check`. It does not claim production-build or browser coverage on
Windows.

## Distribution and Packaging

### @mauriciodmo/framekit

Build the tarball with:

```
pnpm --filter @mauriciodmo/framekit pack
```

The package's `files` list includes `bin/`, `dist/`, `README.md`, and `LICENSE`.

tsdown produces an unbundled ESM output. The following packages remain external (not bundled): `react`, `react-dom`, `next`, `@tabler/icons-react`, `modern-screenshot`, `chokidar`, `tsx`. CSS is compiled separately via the Tailwind CLI and placed in `dist/styles.css`.

A post-build check (`check-dist.ts`) recursively scans all emitted `.js` files under `dist/` for import-boundary violations, verifying that relative imports resolve to files inside the package. It also checks that string targets in `exports` and `bin` are `./...` paths to existing files inside the package.

### @mauriciodmo/create-framekit

Build the tarball with:

```
pnpm --filter @mauriciodmo/create-framekit pack
```

The package's `files` list includes `dist/`, `template/`, `README.md`, and `LICENSE`.

When a user runs `create-framekit`, the `template/` directory is copied from the installed package into their project as a standalone copy, not referenced from the package directory.

## Pre-publication Tarball Smoke Test

Run this version-independent sequence locally from a Bash shell before
publication. The two package
tarballs are built in a temporary directory, and every consumer project is
created outside the repository. Do not run the consumer commands from the
FrameKit checkout.

The canonical reproducible procedure is the following command from the
repository root:

```sh
node scripts/smoke-tarballs.mjs
```

The script keeps all temporary consumers outside the workspace and verifies:

- archive audits for both public tarballs, including expected files, package
  targets, binaries, and rejection of tests, secrets, workspace references,
  local links, and checkout paths;
- an independent consumer installed directly from the `@mauriciodmo/framekit`
  tarball, including public export resolution and `generate`, `check`, and
  `build`;
- a creator-generated consumer, including a clean install, `generate`, `check`,
  `build`, standalone `start`, HTTP readiness, and clean shutdown/cleanup.

The shell sequence below is an optional manual creator-path procedure. It audits
both archives but its consumer flow only creates and runs the creator-generated
consumer; it does not cover the independent core-tarball consumer. Use the
canonical script above when both consumer paths are required.

```bash
set -eu

REPO_ROOT="$PWD"
SMOKE_DIR="$(mktemp -d)"
trap 'rm -rf "$SMOKE_DIR"' EXIT

pnpm --filter @mauriciodmo/framekit build
pnpm --filter @mauriciodmo/create-framekit build
pnpm --filter @mauriciodmo/framekit pack --pack-destination "$SMOKE_DIR"
pnpm --filter @mauriciodmo/create-framekit pack --pack-destination "$SMOKE_DIR"

CORE_TGZ="$(find "$SMOKE_DIR" -maxdepth 1 -name 'mauriciodmo-framekit-*.tgz' -print -quit)"
CREATOR_TGZ="$(find "$SMOKE_DIR" -maxdepth 1 -name 'mauriciodmo-create-framekit-*.tgz' -print -quit)"
test -n "$CORE_TGZ" && test -n "$CREATOR_TGZ"

# Package boundaries: expected files exist and source/tests/secrets do not ship.
tar -tzf "$CORE_TGZ" | rg -q '^package/bin/framekit\.js$'
tar -tzf "$CORE_TGZ" | rg -q '^package/dist/index\.js$'
tar -tzf "$CORE_TGZ" | rg -q '^package/dist/styles\.css$'
tar -tzf "$CREATOR_TGZ" | rg -q '^package/dist/cli\.js$'
tar -tzf "$CREATOR_TGZ" | rg -q '^package/template/package\.json$'
for archive in "$CORE_TGZ" "$CREATOR_TGZ"; do
  if tar -tzf "$archive" | rg -q '(^|/)tests?/|(^|/)node_modules/|(^|/)\.env'; then
    printf 'Unexpected test, dependency, or secret file in %s\n' "$archive" >&2
    exit 1
  fi
done

# Neither archive may retain workspace metadata, local links, or an absolute checkout path.
mkdir "$SMOKE_DIR/inspect-core" "$SMOKE_DIR/inspect-creator"
tar -xzf "$CORE_TGZ" -C "$SMOKE_DIR/inspect-core"
tar -xzf "$CREATOR_TGZ" -C "$SMOKE_DIR/inspect-creator"
for directory in "$SMOKE_DIR/inspect-core/package" "$SMOKE_DIR/inspect-creator/package"; do
  if rg -n --hidden -e 'workspace:' -e 'link:' -e 'file:\.\.' "$directory" || rg -n --hidden -F "$REPO_ROOT" "$directory"; then
    printf 'Workspace reference found in %s\n' "$directory" >&2
    exit 1
  fi
done

# Install the creator in a separate runner and scaffold a project non-interactively.
mkdir "$SMOKE_DIR/runner"
cd "$SMOKE_DIR/runner"
npm init -y
npm install "$CREATOR_TGZ"
npx --no-install create-framekit "$SMOKE_DIR/consumer" -n

# Replace the generated registry dependency with the core tarball, then use the generated project's package manager.
cd "$SMOKE_DIR/consumer"
node --input-type=module - "$CORE_TGZ" <<'NODE'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const [tarball] = process.argv.slice(2)
const packagePath = path.resolve('package.json')
const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
packageJson.dependencies['@mauriciodmo/framekit'] = `file:${path.resolve(tarball)}`
await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)
NODE
npm install
npx --no-install framekit generate
npx --no-install framekit check
npx --no-install framekit build
test -f src/generated/framekit/templates.ts
rg -q '^src/generated/framekit$' .gitignore

# Start the standalone server, poll a Studio route over HTTP, and let the trap clean it up.
PORT=4317
HOSTNAME=127.0.0.1 PORT="$PORT" npx --no-install framekit start > "$SMOKE_DIR/start.log" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true; wait "$SERVER_PID" 2>/dev/null || true; rm -rf "$SMOKE_DIR"' EXIT
node --input-type=module - "$PORT" <<'NODE'
const port = process.argv[2]
const deadline = Date.now() + 30_000

while (Date.now() < deadline) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/editor`)
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

The procedure below does not record a result by itself. See the
[Future execution status](../../Plans/Future/EXECUTION-STATUS.md) for the
repository-specific result and the [current smoke evidence](../../Plans/Future/evidence/tarball-smoke-2026-09-04.md);
repeat this gate for each release. It passes
only when both real tarballs have the expected contents, no
`workspace:`, local-link, or checkout-path references, and the creator-generated consumer
completes generation, check, production build, standalone start, and HTTP
readiness. The exact npm registry smoke after publication remains a separate
maintainer handoff with package specs supplied at release time; see [Post-publication npm registry smoke](#post-publication-npm-registry-smoke-manual-pending-before-promotion).

## Post-publication npm Registry Smoke (Manual, Pending Before Promotion)

This gate remains pending until the packages are available on npm and the check
has completed successfully. Run it only after publication. It is a separate gate
from the pre-publication tarball smoke: it cannot prevent the initial upload,
but a failure blocks promotion to the intended dist-tag. Never publish or
change a dist-tag as part of this check.

Supply these release-time inputs. Both package specs must be exact registry
specs, not ranges; the dist-tag is checked separately:

```bash
set -eu

: "${CORE_SPEC:?Set the exact @mauriciodmo/framekit npm spec}"
: "${CREATOR_SPEC:?Set the exact @mauriciodmo/create-framekit npm spec}"
: "${EXPECTED_DIST_TAG:?Set the intended npm dist-tag}"

CORE_VERSION="$(npm view "$CORE_SPEC" version)"
CREATOR_VERSION="$(npm view "$CREATOR_SPEC" version)"
test "$CORE_SPEC" = "@mauriciodmo/framekit@$CORE_VERSION"
test "$CREATOR_SPEC" = "@mauriciodmo/create-framekit@$CREATOR_VERSION"

# Check the intended dist-tag independently of the consumer smoke.
test "$(npm view @mauriciodmo/framekit "dist-tags.$EXPECTED_DIST_TAG")" = "$CORE_VERSION"
test "$(npm view @mauriciodmo/create-framekit "dist-tags.$EXPECTED_DIST_TAG")" = "$CREATOR_VERSION"

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
  '@mauriciodmo/framekit/editor',
  '@mauriciodmo/framekit/studio',
  '@mauriciodmo/framekit/studio/root',
  '@mauriciodmo/framekit/dev',
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
    const response = await fetch(`http://127.0.0.1:${port}/editor`)
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

Record the result before cleanup: `CORE_SPEC`, `CREATOR_SPEC`, resolved
versions, `EXPECTED_DIST_TAG`, registry, Node/npm versions, timestamp, PASS or
FAIL, and the relevant command output or start log. The creator's declared
FrameKit version/range and the installed exact core version belong in that
record. Do not treat a successful upload as a successful registry gate.

---

[English](./testing-and-distribution.md) · [Español](../../es/development/testing-and-distribution.md)
