# Step 1 - Contracts and Server Boundary

## Goal

Establish the stable vocabulary and server-only package boundary before adding
filesystem, browser, or Next.js behavior. Later steps must be able to depend on
typed configuration and discriminated failures without importing route-specific
code or parsing error messages.

This step is intentionally executable without Chromium.

## Depends on

- Existing public package entry points and tsdown build.
- Existing `TemplateDefinition`, `TemplateAssetManifest`, field, validation, and
  generated-registry contracts.
- The decisions in [README.md](./README.md).

## Deliverables

- A server-only source entry at `packages/framekit/src/server.ts`.
- Server configuration types and strict environment parsing.
- Public request/result types that do not depend on Next.js route objects.
- One discriminated render-error model with stable codes.
- Initial package build/export wiring for `@mauriciodmo/framekit/server`.
- Focused tests and type fixtures proving the boundary.

## Boundary design

The server export owns generic render behavior. It must not own a consumer's
generated registry or environment singleton.

The generated application remains responsible for supplying:

- its registry entries and template loaders;
- process environment values;
- the incoming `Request` and outgoing `Response`;
- the private render route;
- its internal loopback origin.

The server package remains responsible for:

- validating server option values;
- stable render failure codes;
- temporary render payload types;
- browser/job orchestration added in later steps;
- utilities shared by the public and private routes.

No type in this entry may reference `packages/create-framekit/template`,
`apps/studio`, or `@framekit/generated/*`.

## Proposed public types

Names may change during implementation, but the separation must remain. Keep the
surface smaller than the internal implementation.

```typescript
export interface ImageRenderRequest {
  template: string
  variant?: string
  data?: Record<string, unknown>
}

export interface ImageRenderRuntimeConfig {
  internalOrigin: URL
  allowedImageHosts: ReadonlySet<string>
  maxConcurrentRenders: number
  renderTimeoutMs: number
  browserHeadless: boolean
  browserSlowMoMs: number
}

export interface ImageApiConfig {
  apiKey: string
  render: ImageRenderRuntimeConfig
}

export type ImageRenderErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'template_not_found'
  | 'request_too_large'
  | 'unsupported_image'
  | 'invalid_template_data'
  | 'image_host_not_allowed'
  | 'api_not_configured'
  | 'render_capacity_exhausted'
  | 'render_timeout'
  | 'render_failed'
```

The input parser starts from `unknown`; the interface does not replace runtime
validation. A request received from HTTP is not trusted merely because the route
casts it to `ImageRenderRequest`.

The final render payload is separate from the public request:

```typescript
interface NormalizedRenderPayload {
  template: string
  variant: string
  edits: Record<string, unknown>
  assets: TemplateAssetManifest
  width: number
  height: number
}
```

This internal payload contains only serializable values. It never contains a
template definition, React node, loader function, browser object, filesystem
path, API key, or incoming request object.

## Error model

Use one error class or discriminated object owned by the server package. It must
carry enough machine-readable information for the public route to map it without
matching text.

```typescript
interface ImageRenderFailure {
  code: ImageRenderErrorCode
  message: string
  fields?: Record<string, unknown>
  cause?: unknown
}
```

Implementation rules:

- `code` is stable and public.
- `message` is diagnostic and may improve without an API version change.
- `fields` is permitted only for canonical template-data errors.
- `cause` is server-side only and never serialized directly.
- stack traces and Playwright errors never reach the client response.
- unknown thrown values are normalized exactly once at the route boundary to
  `render_failed`.

Keep the HTTP status map next to the route or in a pure server helper. Browser,
job-store, and image-input modules throw semantic failures; they do not know
about `Response` objects.

## Environment parser

Implement one pure parser that accepts an explicit environment record. Do not
read `process.env` throughout browser and route modules.

```typescript
parseImageApiConfig(env: NodeJS.ProcessEnv): ImageApiConfig
```

The public route uses `apiKey` for authentication and passes only
`config.render` to browser orchestration. The API key must never enter a
temporary job, browser manager, context option, page header, or renderer log.

Parsing rules:

### `FRAMEKIT_API_KEY`

- Required in production.
- Trim neither the configured key nor the incoming token; whitespace is part of
  a secret and accidental whitespace should fail visibly.
- Reject an empty value.
- Do not include its value in an error.

### `FRAMEKIT_INTERNAL_ORIGIN`

- Required in production.
- Parse with `new URL(...)`.
- Permit only `http:` on loopback for the initial Docker deployment.
- Accept `127.0.0.1`, `[::1]`, or `localhost`; prefer `127.0.0.1` in examples.
- Reject credentials, paths other than `/`, query strings, and fragments.
- Preserve an explicit port.
- Normalize a trailing slash before render URLs are constructed.

Development may derive the current request origin in the thin route when no
explicit value exists, but this fallback is not accepted in production.

### `FRAMEKIT_ALLOWED_IMAGE_HOSTS`

- Split on commas.
- Trim and lowercase each hostname.
- Remove empty entries and duplicates.
- Parse entries as hostnames, not full URLs.
- Reject entries containing schemes, credentials, paths, query strings,
  fragments, wildcard characters, or IP literals.
- An empty set is valid and rejects all remote image overrides.

### Numeric limits

- Parse base-10 integers only.
- Reject decimals, exponent notation, `NaN`, infinities, negatives, and zero
  where a positive value is required.
- Apply conservative upper bounds so configuration cannot accidentally allow an
  unbounded queue or multi-hour request.
- Defaults are `2` concurrent renders and `30000` milliseconds.

### Browser flags

- `FRAMEKIT_BROWSER_HEADLESS` defaults to `true`.
- Accept explicit `true`/`false`, not generic truthiness.
- Reject `false` when `NODE_ENV=production`.
- `FRAMEKIT_BROWSER_SLOW_MO_MS` defaults to `0` and follows bounded integer
  parsing.

## Authentication helper contract

Define a pure server helper now; Step 6 integrates it with the route.

Requirements:

- Accept exactly one `Authorization` header.
- Require the case-insensitive `Bearer` scheme and one non-empty token.
- Reject additional comma-joined credentials.
- Compare bytes with Node's constant-time comparison.
- Normalize unequal lengths without returning early based on matching content.
- Return only success/failure; do not log or return the compared values.

Configuration failure is distinct from client authentication failure:

- missing server key -> `api_not_configured`;
- missing or wrong request token -> `unauthorized`.

## Server-only export rules

Add a new supported import:

```typescript
import type {
  ImageApiConfig,
  ImageRenderErrorCode,
  ImageRenderRequest,
  ImageRenderRuntimeConfig,
} from '@mauriciodmo/framekit/server'
```

At this phase, the entry may export only types, configuration parsing, auth, and
errors. Later steps add job and render functions.

Required package constraints:

- add `server: 'src/server.ts'` to tsdown entries;
- add a `./server` export with type/import/default targets;
- preserve unbundled ESM output;
- prevent the root, editor, Studio, and development entries from re-exporting
  server symbols;
- ensure client entry output has no transitive `node:*` import;
- add a type fixture that imports only supported `./server` symbols;
- update dist checks to cover the new declared export through their existing
  generic manifest scan rather than adding a special-case check.

The Playwright dependency is not required to finish this step. Step 4 adds it
when the server entry first imports the package at runtime.

## Expected files

```text
packages/framekit/src/server.ts
packages/framekit/src/server/config.ts
packages/framekit/src/server/errors.ts
packages/framekit/src/server/auth.ts
packages/framekit/src/server/config.test.ts
packages/framekit/src/server/auth.test.ts
packages/framekit/tests/types/server-api.ts
packages/framekit/tsdown.config.ts
packages/framekit/package.json
```

Use fewer files if config/auth/errors remain clear together. Do not create
interfaces with one speculative implementation.

## Implementation sequence

1. Add error codes and a single normalization/error representation.
2. Add pure environment parsing with explicit defaults and upper bounds.
3. Add the constant-time Bearer helper.
4. Create `src/server.ts` and export only the completed symbols.
5. Wire `./server` into tsdown and `package.json`.
6. Add positive and negative unit tests.
7. Add a supported-import type fixture.
8. Build the package and inspect emitted client/server dependency boundaries.

## Focused tests

- Every documented error code is accepted by the type and no arbitrary string
  is accepted.
- Missing API key fails closed in production.
- Development fallback rules do not leak into production parsing.
- Internal origin accepts loopback with a port and rejects public hosts,
  credentials, paths, and fragments.
- Host parsing normalizes case/whitespace and rejects wildcard/scheme/path/IP
  values.
- Numeric parsing accepts defaults and bounded integers, rejecting all coercion
  edge cases.
- Production cannot disable headless mode.
- Bearer parsing handles header/scheme casing but rejects empty, repeated, basic,
  malformed, and incorrect tokens.
- `@mauriciodmo/framekit/server` type imports compile.
- Existing supported client imports continue compiling without server modules.
- Built root/editor/Studio chunks contain no `playwright-core` or new `node:*`
  dependency caused by the server entry.

## Exit gate

Step 1 is complete when:

- the new server entry builds and is importable through the public package map;
- configuration and auth behavior are deterministic and covered without Next.js
  or Chromium;
- downstream steps can throw a stable semantic error and receive normalized
  configuration;
- no existing client entry or Studio behavior changes;
- focused package tests, typecheck, and build pass.
