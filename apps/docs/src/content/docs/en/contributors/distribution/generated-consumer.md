---
title: Generated consumer verification
description: Create an isolated FrameKit consumer and verify generation, validation, production build, and standalone start.
---

# Generated consumer verification

The creator package contains the canonical template. `create-framekit` copies
that template into a new directory; it does not link the new project back to the
repository or to the installed package. Run this flow outside the FrameKit
checkout so package and path leaks cannot be hidden by workspace resolution.

## Isolated flow

This non-interactive flow leaves installation and generation explicit. `-n`
rejects the creator's install and Git prompts, which makes the pre-generation
state easy to inspect:

```bash
set -eu

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

mkdir "$SMOKE_DIR/runner"
cd "$SMOKE_DIR/runner"
npm init -y
npm install @mauriciodmo/create-framekit
npx --no-install create-framekit "$SMOKE_DIR/consumer" -n

cd "$SMOKE_DIR/consumer"
npm install
npx --no-install framekit generate
npx --no-install framekit check
npx --no-install framekit build

PORT=4317
FRAMEKIT_AUTH_ENABLED=true FRAMEKIT_ADMIN_PASSWORD=framekit-consumer-smoke-password FRAMEKIT_DATABASE_PATH=:memory: HOSTNAME=127.0.0.1 PORT="$PORT" npx --no-install framekit start > "$SMOKE_DIR/start.log" 2>&1 &
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

`framekit start` is a long-running command. This authenticated smoke explicitly
sets `FRAMEKIT_AUTH_ENABLED=true` and a test bootstrap password. Run it only
after a successful build, keep it in the background with its PID and log
captured, poll the consumer's `/login` route for readiness, and let the cleanup
trap stop it and remove the temporary directory. A readiness-only open-mode
check should set `FRAMEKIT_AUTH_ENABLED=false` explicitly. The [create-framekit reference](/en/users/reference/cli/create-framekit)
documents the supported `pnpm` and `npm` creator paths.

For the reproducible package-artifact version of this flow, run the repository
smoke instead of replacing package versions by hand:

```bash
pnpm smoke:tarballs
```

That script packs both public packages, installs each archive in temporary
directories outside the checkout, and runs both an independent core consumer
and a creator-generated consumer.

## What each step proves

| Step | What it proves |
| --- | --- |
| `create-framekit ... -n` | The creator can copy the shipped template into a new, standalone directory. Before generation, the consumer has no installed dependencies or generated FrameKit bindings. |
| `npm install` | The generated project's declared dependencies resolve from the selected package registry or local artifact. |
| `framekit generate` | Source under `src/templates/` and `src/brand/` can produce `src/generated/framekit/templates.ts`, `brands.ts`, `studio-client.tsx`, and `render-client.tsx`, plus copied template assets under `public/framekit/templates/`. |
| `framekit check` | Generation runs first, then every discovered template definition and content variant is validated. The temporary checker under `.framekit/` is removed afterward. This is not a TypeScript check. |
| `framekit build` | The project passes `check`, runs `next build`, and prepares the standalone production output under `.framekit/next/`. |
| `framekit start` | The existing standalone output starts over HTTP. It does not regenerate, validate, or build. |

The [FrameKit CLI reference](/en/users/reference/cli/framekit) is the source for
the command behavior. A successful consumer check must not be inferred from a
package-local unit test or from a build run inside the FrameKit checkout.

## Inspect the copied project

The canonical template's maintained source includes the App Router routes,
`next.config.ts`, `Dockerfile`, `.env.example`, `src/profile.ts`, and the
example under `src/templates/example/`. The canonical route shape contains:

- `src/app/[section]/[[...slug]]/page.tsx` for Studio sections;
- `src/app/api/framekit/[...action]/route.ts` for the FrameKit API;
- `src/app/framekit/render/[id]/page.tsx` for private rendering;
- `src/app/globals.css` and `src/app/layout.tsx`; and
- `src/app/login/page.tsx` for the public login route.

The generated consumer should import reusable code from the public package
entrypoints, such as `@mauriciodmo/framekit/studio/root`,
`@mauriciodmo/framekit/server`, and `@mauriciodmo/framekit/styles.css`. Its
generated modules should import through `@framekit/generated/*`; keep reusable
imports on those published and generated boundaries.

## Source and generated output

Keep the canonical template and the generated consumer distinct:

| Category | Paths | Rule |
| --- | --- | --- |
| Maintained template source | `packages/create-framekit/template/src/`, `next.config.ts`, `Dockerfile`, `.env.example`, and project config | Change these sources when the starter project changes. Rebuild and repack the creator package. |
| Consumer-generated output | `src/generated/framekit/`, `public/framekit/`, `.framekit/`, `.framekit/next/`, `.next/`, `*.tsbuildinfo`, and `next-env.d.ts` | Disposable output. Regenerate or rebuild it; do not hand-edit it or add it to the creator archive. |
| Consumer runtime data | `.framekit-data/` | Persistent SQLite storage when auth is enabled and used. Preserve it across restarts and deployments; it is not a generated registry. Open mode does not initialize it. |

The generated files reference explains the consumer output paths in more detail:
[generated files](/en/users/reference/generated-files). The contributor workflow
also lists the repository's disposable output rules at
[keep generated output disposable](/en/contributors/development/workflow#keep-generated-output-disposable).

## Local and published consumers

`pnpm smoke:tarballs` is the pre-publication local-artifact gate. It verifies
archive contents, public export resolution, the generated consumer's
`generate`/`check`/`build` sequence, standalone readiness, and cleanup. It does
not prove that npm serves the published package or that a Docker image can
install the published version.

After publication, the exact npm registry smoke is a separate manual release
gate. Use exact `CORE_SPEC` and `CREATOR_SPEC` values, verify their `npm view`
versions and the independent `EXPECTED_FRAMEKIT_DIST_TAG` and
`EXPECTED_CREATE_FRAMEKIT_DIST_TAG` values, install them in a temporary runner,
create the consumer, install its exact core version, then repeat `generate`,
`check`, `build`, and `start`. Record the resolved versions and result before
cleanup.
See [E2E and smoke tests](/en/contributors/testing/e2e-and-smoke) for the
distinction between tarball and registry-backed checks.
