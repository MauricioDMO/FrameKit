# Step 1 - Contracts and Server Boundary

## Goal

Establish the stable server vocabulary and package boundary before adding image
fetching, in-memory jobs, browser behavior, or Next.js routes.

Later steps must depend on typed configuration and discriminated failures rather
than parsing error text or importing route-specific code.

This step is intentionally executable without Chromium.

## Depends on

- Existing public package entry points and tsdown build.
- Existing `TemplateDefinition`, `TemplateAssetManifest`, field, validation, and
  generated-registry contracts.
- The architecture decisions in this plan's README.

## Deliverables

- A server-only source entry at `packages/framekit/src/server.ts`.
- Server configuration types and strict environment parsing.
- Public request and internal resolved-payload types independent of Next.js.
- One discriminated render-error model with stable codes.
- A constant-time Bearer authentication helper.
- Initial package build/export wiring for `@mauriciodmo/framekit/server`.
- Focused tests and public-import type fixtures.

## Boundary design

The server export owns generic server-rendering behavior. It must not own a
consumer's generated registry or a global environment singleton.

The generated application remains responsible for supplying:

- its registry entries and template loaders;
- `process.env` to the pure configuration parser;
- the incoming `Request` and outgoing `Response`;
- the public API route;
- the private render route;
- its loopback internal origin.

The server package remains responsible for:

- validating server option values;
- stable render failure codes;
- Bearer authentication comparison;
- request/image helpers added in later steps;
- the in-memory render-job store;
- browser and capture orchestration.

No type in `./server` may reference `packages/create-framekit/template`,
`apps/studio`, or `@framekit/generated/*`.

## Proposed public types

Names may change during implementation, but the separation must remain and the
public surface should stay small.

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
}

export interface ImageApiConfig {
  apiKey: string
  render: ImageRenderRuntimeConfig
}
```

The HTTP parser starts from `unknown`; `ImageRenderRequest` does not replace
runtime validation.

The public route resolves and validates data before browser work. The renderer
therefore receives a final serializable payload:

```typescript
export interface ResolvedRenderPayload {
  template: string
  variant: string
  data: Record<string, string | number | boolean>
  assets: TemplateAssetManifest
  width: number
  height: number
}
```

`data` is the output of the canonical resolver after request image overrides are
prepared. The private page must not run `resolveTemplateData(...)` again.

The payload contains no API key, authorization header, job token, loader,
template definition, React node, browser object, filesystem path, request
object, or response object.

## Error model

Use one error class or discriminated object owned by the server package. It must
carry machine-readable information so the public route never matches messages.

```typescript
export type ImageRenderErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'template_not_found'
  | 'request_too_large'
  | 'unsupported_image'
  | 'invalid_template_data'
  | 'image_host_not_allowed'
  | 'image_fetch_failed'
  | 'api_not_configured'
  | 'render_capacity_exhausted'
  | 'render_timeout'
  | 'render_failed'

export interface ImageRenderFailure {
  code: ImageRenderErrorCode
  message: string
  fields?: Record<string, unknown>
  cause?: unknown
}
```

Rules:

- `code` is stable and public.
- `message` is a safe public diagnostic and may improve without changing the
  code.
- `fields` is allowed only for canonical template-data validation errors.
- `cause` is server-side only and is never serialized directly.
- Playwright errors, fetch response bodies, stack traces, signed URLs, and
  secrets never reach the client.
- unknown thrown values are normalized once at the public route boundary to
  `render_failed` unless a lower layer already created a semantic failure.

Browser, job, request-body, and image modules throw semantic failures; they do
not create `Response` objects.

## Environment parser

Implement one pure parser that accepts an explicit environment record:

```typescript
parseImageApiConfig(env: NodeJS.ProcessEnv): ImageApiConfig
```

Do not read `process.env` throughout browser/image/job modules.

The public route uses `apiKey` for authentication and passes only
`config.render` to image preparation/render orchestration. The API key must never
enter the render payload, Map job, browser state, page request, or logs.

### `FRAMEKIT_API_KEY`

- Required in production.
- Reject an absent or empty value.
- Do not trim the configured key or incoming token; accidental whitespace should
  fail rather than silently change a secret.
- Never include the key value in an error/log.

### `FRAMEKIT_INTERNAL_ORIGIN`

- Required in production for the initial implementation.
- Parse with `new URL(...)`.
- Permit only `http:` on loopback.
- Accept `127.0.0.1`, `[::1]`, or `localhost`; examples should use
  `127.0.0.1`.
- Reject credentials, non-root paths, query strings, and fragments.
- Preserve an explicit port.
- Normalize a trailing slash before private render URLs are constructed.

Development may derive a loopback origin in the thin application adapter if the
explicit value is absent, but production must fail closed.

### `FRAMEKIT_ALLOWED_IMAGE_HOSTS`

- Split on commas.
- Trim and lowercase each hostname.
- Remove empty entries and duplicates.
- Treat entries as hostnames, not URLs.
- Reject schemes, credentials, paths, queries, fragments, wildcards, ports, and
  IP literals.
- An empty set is valid and disables remote HTTPS request-image overrides.

This allowlist is used by Node.js remote-image fetching. Chromium never receives
it as permission to access those hosts.

### Numeric limits

Initial configurable values:

```text
FRAMEKIT_MAX_CONCURRENT_RENDERS=2
FRAMEKIT_RENDER_TIMEOUT_MS=30000
```

Parsing rules:

- parse base-10 integers only;
- reject decimals, exponent notation, `NaN`, infinities, negatives, and zero;
- apply conservative upper bounds;
- defaults are `2` simultaneous renders and `30000` milliseconds.

Request/body/image-size constants can remain package constants in v1 rather than
expanding the environment surface prematurely.

### Browser mode

Production server rendering is always headless in v1. Do not add public
`HEADLESS`, `SLOW_MO`, arbitrary launch args, or browser-selection environment
variables until an actual supported deployment requires them.

## Authentication helper contract

Define a pure server helper now; Step 6 integrates it with the route.

Requirements:

- accept exactly one `Authorization` header value;
- require case-insensitive `Bearer` scheme and one non-empty token;
- reject comma-joined/repeated credentials and non-Bearer schemes;
- compare token bytes with Node's timing-safe comparison;
- normalize unequal lengths without returning based on matching prefix/content;
- return only success/failure;
- never log or return either compared value.

Configuration failure is distinct from client authentication failure:

- missing server key -> `api_not_configured`;
- missing or wrong request token -> `unauthorized`.

One shared API key is the complete v1 public auth model. Accounts, multiple keys,
JWT, OAuth, scopes, and persistence are out of scope.

## Server-only export rules

Add a supported import:

```typescript
import {
  parseImageApiConfig,
  authenticateBearer,
  // later: renderTemplateImage, loadRenderRequest
} from '@mauriciodmo/framekit/server'
```

Rules:

- `./server` may import Node built-ins and later `playwright-core`.
- root, `./editor`, `./studio`, and `./dev` client-capable exports must not import
  the server entry.
- importing `@mauriciodmo/framekit` or `/editor` must never pull Playwright into a
  client bundle.
- generated apps must consume supported package exports, never repository source
  paths.
- keep internal helpers unexported unless a generated/first-party adapter needs
  them.

## Expected files

```text
packages/framekit/src/server.ts
packages/framekit/src/server/config.ts
packages/framekit/src/server/config.test.ts
packages/framekit/src/server/errors.ts
packages/framekit/src/server/auth.ts
packages/framekit/src/server/auth.test.ts
packages/framekit/tests/types/server-api.ts
packages/framekit/package.json
packages/framekit/tsdown.config.ts
```

Use fewer source files if config/auth/errors remain clear together; do not create
interfaces for speculative implementations.

## Implementation sequence

1. Add stable error codes and one semantic failure representation.
2. Add `ResolvedRenderPayload` and configuration contracts.
3. Implement strict pure environment parsing.
4. Implement the constant-time Bearer helper.
5. Create `src/server.ts` and export only completed symbols.
6. Wire `./server` into tsdown and `package.json`.
7. Add positive/negative tests and supported-import type fixture.
8. Build the package and inspect client/server dependency boundaries.

## Focused tests

- Every documented error code is accepted and arbitrary strings are rejected.
- `ResolvedRenderPayload` contains only serializable render values and assets.
- Missing API key fails closed in production.
- Development fallback rules do not leak into production configuration.
- Internal origin accepts loopback with a port and rejects public hosts,
  credentials, paths, queries, and fragments.
- Host allowlist parsing normalizes case/whitespace and rejects wildcard/scheme/
  path/port/IP values.
- Numeric parsing accepts defaults/bounded integers and rejects coercion edge
  cases.
- Bearer parsing rejects empty, repeated, Basic, malformed, and wrong tokens.
- Equal and unequal-length token comparisons take the same helper path and never
  expose values.
- `./server` compiles through the public package export.
- root/editor imports do not resolve server-only dependencies.

## Exit gate

Step 1 is complete when:

- the server-only public boundary builds and typechecks without Next.js route
  objects or Chromium;
- auth/config/error behavior is deterministic and covered by focused tests;
- the final render payload contract represents already-resolved data;
- existing package entry points still build without depending on `./server`.
