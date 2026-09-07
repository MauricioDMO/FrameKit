# Task 1 Report: Canonical Private Render Route

## Changed Files

Implementation changed exactly these requested source files:

- `packages/create-framekit/template/src/app/__framekit/render/[id]/page.tsx`
- `packages/create-framekit/template/src/app/__framekit/render/[id]/render-client.tsx`

Required report file:

- `.superpowers/sdd/05-private-next-render-route/task-1-report.md`

No generated output, Studio files, public API route, package internals, or
permanent test route were changed.

## Decisions

- The server page uses the Next.js 16 `Promise<{ id: string }>` params
  signature, reads `headers()` once asynchronously, and passes only the
  validated `ResolvedRenderPayload` returned by `loadRenderRequest`.
- Invalid or missing private job credentials all resolve through `notFound()`.
- The route exports the Node.js runtime, forced dynamic rendering, zero
  revalidation, `fetchCache = 'force-no-store'`, and noindex/nofollow metadata.
- The client resolves the generated registry by exact template slug, calls the
  lazy loader, validates the default export with
  `validateTemplateDefinition`, and checks dimensions plus an own variant key
  against the payload.
- Client failures use only coarse markers: `template_not_found`,
  `template_load_failed`, `invalid_definition`, `job_definition_mismatch`, and
  `render_component_failed`.
- The client passes the already-resolved payload data, assets, and variant
  directly to one `TemplateCanvas`. It does not resolve or validate template
  data again.
- Lazy loading has cancellation protection. A small effect changes the state
  from loading to ready after the canvas render commits. A minimal error
  boundary preserves the coarse render failure protocol for template render
  exceptions.

## Commands and Outputs

### Passed

`pnpm --filter @mauriciodmo/framekit build`

```text
tsdown: Build start
tailwindcss: Done in 186ms
tsx scripts/check-dist.ts: passed
```

`pnpm --filter @mauriciodmo/create-framekit test`

```text
Test Files  2 passed (2)
Tests       30 passed (30)
```

`pnpm --filter @mauriciodmo/create-framekit typecheck`

```text
$ tsc --noEmit
```

`pnpm --filter @mauriciodmo/create-framekit build`

```text
tsdown: Build start
tsx scripts/check-dist.ts .: passed
```

`git diff --check`

```text
passed with no output
```

The commit hook also completed the recursive lint and skill synchronization:

```text
packages/create-framekit lint: Done
packages/framekit lint: Done
apps/studio lint: Done
```

Lint reported one pre-existing warning in
`packages/framekit/src/server/render-job.ts:113` for the unused `_options`
parameter, with zero errors.

### Blocked By Existing Local Template Install

`pnpm exec tsc --noEmit --incremental false --project packages/create-framekit/template/tsconfig.json`

```text
[ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL] Command "tsc" not found
```

`pnpm --dir packages/create-framekit/template exec tsc --noEmit --incremental false --project tsconfig.json`

```text
Cannot find module '@mauriciodmo/framekit/server'
Module '@mauriciodmo/framekit/editor' has no exported member 'TemplateCanvas'
Cannot find module '@mauriciodmo/framekit/server'
The existing example template also failed on missing 'field' and related old API types
```

`pnpm --dir packages/create-framekit/template check`

```text
FrameKit: 1 template
SyntaxError: The requested module '@mauriciodmo/framekit' does not provide an export named 'field'
```

The canonical template has a stale standalone `node_modules` FrameKit install
that predates the existing server/editor exports. The local package build and
focused scaffolding checks passed; no dependency manifest or generated output
was changed to work around the stale install.

## Commit Hashes

- Parent before implementation: `c7d8714af861baebd90f1f21c80e22667ff9327a`
- Implementation: `3d4f27ff974ce56f42329a626a47756e2070f284`

## Concerns

- The canonical template’s installed dependencies need refreshing in a clean
  consumer install before its own `tsc`, `framekit check`, or Next build can
  validate the new route end to end.
- No focused route/component tests were added because the brief explicitly
  limits this task to the two canonical source files.

## Review Fix Report

### Findings Fixed

- Template render failures are now handled by an outer `RenderErrorBoundary`
  whose fallback directly renders the sole
  `data-framekit-render-state="error"` marker with
  `data-framekit-render-error="render_component_failed"`. The ready/loading
  `<main>` is inside the boundary, so a thrown canvas render cannot leave a
  ready parent with zero capture roots.
- Async render state now stores the payload reference with the state. If a
  retained client instance receives a different payload, the derived state is
  immediately loading with no capture root until the new payload's entry,
  definition, dimensions, and variant have been checked. Loader and readiness
  updates also verify the current payload snapshot.

### Fix Checks

`pnpm --filter @mauriciodmo/create-framekit test`

```text
Test Files  2 passed (2)
Tests       30 passed (30)
```

`pnpm --filter @mauriciodmo/create-framekit typecheck`

```text
$ tsc --noEmit
```

`pnpm --filter @mauriciodmo/create-framekit build`

```text
tsdown: Build start
tsx scripts/check-dist.ts .: passed
```

`git diff --check`

```text
passed with no output
```

The fix commit hook completed recursive lint and skill synchronization. It
reported zero errors and the same pre-existing warning at
`packages/framekit/src/server/render-job.ts:113` for the unused `_options`
parameter.

The previously recorded canonical-template `tsc` and `framekit check` blocks
remain unchanged: the ignored standalone template install still lacks the
current FrameKit `server`, `field`, and editor exports. No dependency manifest
or generated output was changed to work around it.

### Fix Commit Details

- Parent before fix: `e9548012cb0924ac33ef42819ffc6b6d44f6ea7f`
- Fix: `32dd0f0f188e2faf554dfbd45369248be325f6d7`
- Fix implementation file: `packages/create-framekit/template/src/app/__framekit/render/[id]/render-client.tsx`
- Report update is committed separately after this fix.

### Remaining Concerns

- The canonical template's installed dependencies still need refreshing in a
  clean consumer install for end-to-end Next/template validation.
- The fix remains covered by package-level checks only; no permanent route or
  focused test file was added within the task scope.
