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
