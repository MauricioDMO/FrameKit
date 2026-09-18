# Public API Reference

## Entry Points and Exports

### `@mauriciodmo/framekit` (root)

The root entry point provides the core runtime API for defining, validating, and rendering templates, along with all associated types.

The canonical definition uses `meta`, `width`, `height`, `fields`, `variants`,
field-only `content`, and `render({ data, assets, variant, width, height })`.
`meta` requires a non-empty `title` and may include `description`,
`marketingDescription`, and `tags`. See the [template contract](./template-contract.md)
for the full shape, and [GitHub issue #3](https://github.com/MauricioDMO/FrameKit/issues/3)
for the metadata contract.

The semantic field contract is defined by [GitHub issue #5](https://github.com/MauricioDMO/FrameKit/issues/5).
The choice field contract is defined by [GitHub issue #6](https://github.com/MauricioDMO/FrameKit/issues/6).
The boolean field contract is defined by [GitHub issue #7](https://github.com/MauricioDMO/FrameKit/issues/7).
The number field contract is defined by [GitHub issue #8](https://github.com/MauricioDMO/FrameKit/issues/8).

`field.number` requires a finite numeric `defaultValue`, does not accept
`required`, and supports the native `input` control by default or the native
`slider` control when explicit finite `min` and `max` bounds are supplied. Any
supplied `min` and `max` bounds must be finite and ordered, and `step` must be
finite and positive; it defaults to `1` with native numeric/range semantics. Number content, edits,
resolved data, and render props are finite numbers. Numeric strings are rejected
without coercion, and an incomplete local editor draft is not render data.

**Runtime exports**

| Export                       | Description                                                                                                                                                                    |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `defineTemplate`             | Defines and validates the versionless canonical template shape with metadata, fields, variants, content, and a render function                                                |
| `defineTemplateBase`         | Defines and validates a template base without a render function                                                                                                                |
| `field`                      | Collection of field descriptor builders (`field.text`, `field.color`, `field.number`, `field.image`, `field.choice`, `field.boolean`)                                      |
| `Markdown`                   | Renders supported markdown content with inline formatting and optional lists                                                                                                   |
| `validateTemplateBase`       | Validates the canonical template shape without requiring a render function                                                                                                    |
| `validateTemplateData`       | Validates template data against a template definition                                                                                                                          |
| `validateTemplateDefinition` | Validates the structural integrity of a template definition                                                                                                                    |
| `resolveTemplateData`        | `resolveTemplateData(definition, variant, edits, assets?)`; applies defaults -> variant content -> user edits, then image assets                                |
| `getVariants`                | `getVariants(definition: TemplateBase): string[]`; returns the content variant keys of `definition.content`                                                                     |
| `getDefaultValues`           | `getDefaultValues(fields: Record<string, FieldDescriptor>): Record<string, string \| number \| boolean>`; extracts field defaults                                          |

**Type exports**

| Type                          | Description                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------------- |
| `TemplateFieldKind`           | Discriminant union type for field kinds: `"text"` \| `"color"` \| `"number"` \| `"image"` \| `"choice"` \| `"boolean"`       |
| `ImageFieldScope`             | Scope for image assets: `"common"` \| `"variant"`                                                   |
| `BaseFieldDescriptor`         | Base shape shared by text, color, and image field descriptors                                           |
| `FieldDescriptor`             | Full field descriptor union across all field kinds                                                      |
| `TextFieldDescriptor`         | Descriptor for multiline text fields, including optional `minLength` and `maxLength`                         |
| `ColorFieldDescriptor`        | Descriptor for color fields                                                                             |
| `NumberFieldDescriptor`       | Descriptor for number fields with a required finite numeric default, optional finite bounds and step, and native input/slider control                         |
| `ImageFieldDescriptor`        | Descriptor for project-backed image fields                                                             |
| `ChoiceFieldDescriptor`       | Descriptor for ordered closed-set string options and a required default value                          |
| `BooleanFieldDescriptor`      | Descriptor for binary values with an optional boolean default (`false` when omitted); Studio uses a native checkbox |
| `TemplateAssetManifest`       | Generated common and variant asset URL maps                                                            |
| `TemplateMeta`                | Exact metadata object with required `title` and optional `description`, `marketingDescription`, and `tags` |
| `TemplateVariants`             | Default content variant and optional display labels                                                  |
| `TemplateContent`              | Variant-keyed record of field-only content values                                                   |
| `TemplateContentEntry`        | Partial field-value record for one content variant                                                  |
| `TemplateBase`                | Base type for a template containing field definitions                                                   |
| `TemplateDefinition`          | Complete template definition combining base structure with configuration                                |
| `TemplateRenderProps`         | Props passed to a template's render function, including finite numbers for number fields                |
| `TemplateRegistryEntry`       | Canonical entry in the generated template registry, with metadata, dimensions, variants, assets, and a dynamic loader |
| `InferTemplateData<T>`        | Utility type that extracts the data shape from a template definition                                    |
| `TemplateDataValidationError` | Per-field validation error union used by `validateTemplateData`                                        |

---

### Generated template registry

The optional `framekit generate` command writes the project-local module
`src/generated/framekit/templates.ts`. Its only runtime export is
`templates: TemplateRegistryEntry[]`:

```ts
export const templates: TemplateRegistryEntry[] = [
  {
    slug,
    segments,
    meta,
    width,
    height,
    variants,
    variantKeys,
    assets,
    load: () => import("..."),
  },
]
```

Each entry contains `slug`, `segments`, validated `meta`, `width`, `height`,
`variants`, declaration-ordered `variantKeys`, `assets`, and the dynamic `load`
loader, whose promise resolves to a module with the template definition as its
default export. The template title is `meta.title`; there is no top-level
`title` field. `meta.title` supplies Studio's navigation
label and selected editor heading; when present, Studio also displays the
optional `description`, `marketingDescription`, and `tags`. The registry's
dimensions, variants, asset manifest, and lazy loader are passed through the
Studio load boundary. This is project-local generated output, not an export of
a published package entry point. See [GitHub issue #12](https://github.com/MauricioDMO/FrameKit/issues/12)
and [GitHub issue #13](https://github.com/MauricioDMO/FrameKit/issues/13).

`framekit generate` is the explicit one-off regeneration command; it writes
`src/generated/framekit/templates.ts` and `src/generated/framekit/brands.ts`.
`framekit dev` generates them initially and
regenerates them when paths under `src/templates` or `src/brand` change.
`framekit check` generates first, then validates every definition and the data
resolved for each content variant with its discovered assets. `framekit build`
runs `check` before the production build and copies the standalone public and
Next static assets on success. `framekit start` does not generate; it requires a
production standalone build and starts its server.

---

### `@mauriciodmo/framekit/client`

The client entry point provides the adapter for the private render page.
`createRenderClient(templates)` closes over the consumer's generated registry
and returns the client render component. Keep the factory call in a
consumer-local module marked `'use client'`:

```tsx
'use client'

import { createRenderClient } from '@mauriciodmo/framekit/client'
import { templates } from '@framekit/generated/templates'

export const RenderClient = createRenderClient(templates)
```

**Runtime exports**

| Export               | Description                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------ |
| `createRenderClient` | `createRenderClient(templates: readonly TemplateRegistryEntry[])`; returns a client render component backed by the provided registry |

---

### `@mauriciodmo/framekit/editor`

Provides the `FrameKitEditor` component and supporting navigation utilities for the in-app editing experience.

`FrameKitEditor` receives the canonical `template: TemplateRegistryEntry` plus
the loaded `definition` and `messages` (and optional `sidebarCollapsed`). The
registry entry supplies the editor's `slug` and `assets`; callers do not pass
separate `slug` or `assets` props.

**Runtime exports**

| Export                 | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `FrameKitEditor`       | React component that renders the template editing interface   |
| `TemplateCanvas`       | React component that renders a template at its exact dimensions |
| `FrameKitNavigation`   | React component that renders the template navigation tree     |
| `humanizeSegment`      | Converts a path segment into a human-readable label           |
| `manifestToNavigation` | Converts template or brand registry entries into a navigation tree structure |

**Type exports**

| Type                       | Description                                         |
| -------------------------- | --------------------------------------------------- |
| `EditorMessages`           | Message catalog type for editor UI strings          |
| `TemplateNavigationFolder` | Navigation node representing a folder               |
| `TemplateNavigationItem`   | Navigation node representing a single template item |
| `TemplateNavigationNode`   | Union type covering all navigation node types       |

---

### `@mauriciodmo/framekit/studio`

Provides the `FrameKitStudio` component, which combines editor and navigation into a complete studio interface, along with localization utilities and the authenticated Settings surface.

Its main component accepts either `{ templates: readonly TemplateRegistryEntry[], brands?: readonly FrameKitStudioBrand[], user?: StudioUser }` or
`{ templates?: readonly TemplateRegistryEntry[], brands: readonly FrameKitStudioBrand[], user?: StudioUser }`;
at least one catalog is required, and an omitted catalog defaults to an empty
array. Existing direct catalog usage remains valid without `user`; the generated
authenticated page passes the safe `StudioUser` DTO.
The generated `templates` array can be passed directly to `FrameKitStudio`
without an adapter:

```tsx
import { templates } from './generated/framekit/templates'
import { FrameKitStudio } from '@mauriciodmo/framekit/studio'

<FrameKitStudio templates={templates} />
```

Studio starts with `definition.variants.default`. Variant keys are generic content
keys, not language identifiers; option labels use
`definition.variants.labels?.[key] ?? key`. The Studio interface locale is an
independent EN/ES setting and does not select or change a template variant.

The six built-in field controls preserve typed values: text uses a native
`textarea`, choice a native `select`, boolean a native checkbox, number its
declared native number or range input, color its color control, and image its
project-asset control. Strings remain strings, numbers remain finite numbers,
and booleans remain booleans. Temporary number drafts stay inside the number
control and are not passed to the template render function.

Editor edits persist per template and variant under `framekit:<slug>:v2`.
Older state is intentionally invalidated rather than migrated. Preview and render
use committed typed values; the current Download and Copy buttons send the
selected template, variant, and user edits to the authenticated image API after
local validation, and focus the first invalid control on local or server errors.

See the [brand catalog reference](./brand-catalog.md) for the `src/brand`
discovery contract, generated registries, and `/brand` behavior.

Code generation also writes `src/generated/framekit/studio-client.tsx`. This
client-only binding imports `StudioUser`, the generated `templates` and `brands`,
and renders `FrameKitStudio` with the authenticated `user`. It is regenerated by
`framekit generate` (and by the commands that generate automatically); do not
edit it by hand. The `/settings` section uses this safe DTO for account changes,
password changes, logout, and owner-scoped token creation, listing, and
revocation. Administrators additionally see user creation, update, deletion,
password reset, and token-metadata/revocation controls. A new token secret is
shown only once. Hiding administrator controls for normal users is presentation
only; server authorization remains authoritative. The interface language and
theme remain under Appearance, independently of template variant keys.

**Runtime exports**

| Export              | Description                                              |
| ------------------- | -------------------------------------------------------- |
| `FrameKitStudio`    | React component that composes the full studio experience |
| `frameKitMessages`  | Pre-defined message catalog for studio UI strings        |
| `getFrameKitLocale` | Resolves a supported locale from an optional locale value |

**Type exports**

| Type                     | Description                                |
| ------------------------ | ------------------------------------------ |
| `FrameKitStudioBrand`    | Brand catalog entry with `slug`, `title`, `segments`, `description`, and a preview loader |
| `FrameKitStudioSection`  | Authenticated Studio section union: `"editor" \| "brand" \| "settings"` |
| `StudioUser`             | Safe authenticated-user DTO with `id`, `username`, and `role: "admin" \| "user"`; it contains no password or token secret |
| `FrameKitLocale`         | Locale type used within the studio         |
| `FrameKitStudioMessages` | Message catalog type for studio UI strings |

`FrameKitBrandCatalog` is an internal implementation component. It is not
exported from `@mauriciodmo/framekit/studio` or from a package export path, so
it is not part of the public API. The generated project's `brands`,
`brandManifest`, and `brandRegistry` values are likewise project-local
generated output, not exports of the `@mauriciodmo/framekit` package.

---

### `@mauriciodmo/framekit/studio/root`

**Runtime exports**

| Export               | Description                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `FrameKitStudioRoot` | Server component that bootstraps the studio; must be used in server components or layouts only. Do not import in client-side code. |
| `createStudioPage`   | Creates an authenticated Next.js page for `/editor`, `/brand`, and `/settings`, passing the safe session user to a client binding |
| `createLoginPage`    | Creates the `/login` page and redirects an already authenticated user to `/editor` |

Signature: `FrameKitStudioRoot({ children, htmlClassName? }: { children: React.ReactNode, htmlClassName?: string })`. It emits the complete `<html>`, `<head>`, and `<body>` shell, so a root layout using it must not nest another document shell.

`createStudioPage(StudioClient)` accepts a client component with the shape
`{ user: StudioUser }`. It validates the section, redirects a missing or invalid
session to `/login`, and supports `/editor`, `/brand`, and `/settings` (with
optional slug segments). `createLoginPage()` renders the login form and redirects
an authenticated session to `/editor`. Both factories are exported from
`@mauriciodmo/framekit/studio/root`.

---

### `@mauriciodmo/framekit/dev`

Advanced server-side utilities for development workflows including dev server spawning, template discovery, code generation, and file watching. These entry points are server-side only.

**Runtime exports**

| Export                 | Description                                               |
| ---------------------- | --------------------------------------------------------- |
| `createDevServer`      | Spawns a development server instance                      |
| `findTemplates`        | Scans the filesystem for template modules                 |
| `findBrandComponents`  | Scans a brand directory for brand component leaves       |
| `collectTemplateSummaries` | Loads and validates serializable template summaries   |
| `createTemplateModule` | Generates the template registry module source from discovered templates |
| `createBrandModule`    | Generates the brand metadata and loader module            |
| `writeTemplateModule`  | Writes generated template and brand modules to disk       |
| `watchTemplates`       | Watches template and brand paths for changes and triggers callbacks |
| `getServerOptions`     | Resolves server configuration options                     |

**Type exports**

| Type                 | Description                                    |
| -------------------- | ---------------------------------------------- |
| `DevServer`          | Dev server instance type                       |
| `DevServerOptions`   | Options for creating a dev server              |
| `DiscoveredTemplate` | Template discovered during filesystem scanning |
| `DiscoveredBrandComponent` | Brand component discovered during filesystem scanning |
| `TemplateSummary`    | Serializable template metadata used by codegen |
| `TemplateWatcher`    | Watcher instance returned by `watchTemplates`  |

`createTemplateModule(templates, { outputDirectory, assetsBySlug, summariesBySlug })`
returns the source for the generated template registry. It uses each discovered
template's `slug` and `segments`, the supplied summary and asset manifest (or an
empty manifest), and a lazy loader for the template module; it throws if a
template has no corresponding summary. `writeTemplateModule` discovers the
templates and brands, gathers summaries and assets, writes both generated
modules, and synchronizes template assets under `public/framekit/templates`.

---

### `@mauriciodmo/framekit/server`

The server entry point is a Node.js/server-only facade for Studio access and
image-rendering contracts: configuration and authentication, the Studio access
handler, session/API-token image handling, image-input
preparation, temporary render jobs, PNG browser rendering, and the private
render-page handoff. Do not import it into browser bundles.

**Runtime exports**

| Export               | Description                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------- |
| `createFrameKitApiHandler` | `createFrameKitApiHandler(templates): (request: Request) => Promise<Response>`; composes the access routes and canonical image route under `/api/framekit` |
| `createStudioAccessHandler` | `createStudioAccessHandler(): (request: Request) => Promise<Response>`; creates the authenticated Studio session and token/user management handler |
| `ImageRenderError`   | `new ImageRenderError(failure: ImageRenderFailure)`; error type with a stable public error code and safe serialization |
| `createStudioImageHandler` | `createStudioImageHandler(templates): (request: Request) => Promise<Response>`; creates the session/API-token PNG image API handler |
| `prepareRenderInputs` | `prepareRenderInputs(options)`; validates request data and prepares local, data-URL, and allowed remote image inputs for rendering |
| `renderTemplateImage` | `renderTemplateImage(options): Promise<Buffer>`; renders a resolved payload through the private page and returns PNG bytes |
| `createRenderJob`     | `createRenderJob(payload: ResolvedRenderPayload, options?): CreatedRenderJob`; creates a temporary private render job identifier and token |
| `loadRenderRequest`   | `loadRenderRequest(id: string, token: string, options?): ResolvedRenderPayload \| undefined`; resolves a valid private render job payload |
| `deleteRenderJob`     | `deleteRenderJob(id: string): void`; removes a private render job |
| `createRenderPage`    | `createRenderPage(RenderClient)`; creates the private server page handoff that validates the render token and passes the resolved payload to the client component |

#### Unified FrameKit API handler

`createFrameKitApiHandler(templates)` is the application integration factory for
the unversioned `/api/framekit` namespace. It delegates the access routes to
`createStudioAccessHandler()` and `POST /api/framekit/images/render` to
`createStudioImageHandler(templates)`. The generated consumer and first-party Studio
mount this factory from one catch-all
`src/app/api/framekit/[...action]/route.ts` adapter and export `GET`, `POST`,
`PATCH`, and `DELETE`.

The image action accepts an active `framekit_session` cookie or
`Authorization: Bearer <API_TOKEN>`. Cookie-authenticated requests require a
same-origin `Origin` header; Bearer requests use only the supplied token. Unknown
paths return `404`; unsupported methods for the image action return `405` with
`Allow: POST`.

#### Studio Access handler

`createStudioAccessHandler()` returns the Node.js handler for these routes:

```text
POST  /api/framekit/login                 POST  /api/framekit/logout
GET/PATCH /api/framekit/account            POST  /api/framekit/account/password
GET/POST /api/framekit/tokens              DELETE /api/framekit/tokens/:id
GET/POST /api/framekit/users               PATCH/DELETE /api/framekit/users/:id
POST  /api/framekit/users/:id/password     GET /api/framekit/users/:id/tokens
```

Mount it from a server-only route and expose the methods used above. Login sets
the `framekit_session` cookie; account, password, token, and user operations
require an authenticated session. Normal users manage their own account and
tokens, while administrators also manage users, inspect any user's token
metadata, and revoke any token. Login, account, and user creation/update
responses expose only the safe `StudioUser` fields `id`, `username`, and `role`;
the administrator's user list additionally exposes `active`, `createdAt`, and
`updatedAt`. No response exposes password hashes, session secrets, token hashes,
or previously returned token secrets. Creating a token returns its full secret
once; subsequent metadata responses and storage contain only the hash and safe
metadata. API-token Bearer lookup hashes the bounded, non-empty credential and
accepts it only when the token is unrevoked and its owner is active, updating
`lastUsedAt` on success. Tokens created by Studio use the visible `fk_` prefix.

Session-protected account, token, and user-management operations return `401`
when the session is missing or invalid; invalid login credentials also return
`401`. Logout is idempotent: it returns `200` and expires the cookie even when
the request has no valid session. The handler returns `403` for forbidden
normal-user or cross-origin unsafe operations, `404` for unknown or inaccessible
targets, and `405` for unsupported methods. It returns `409` for duplicate
usernames or attempts to remove, disable, or demote the last active
administrator. Unsafe requests require the same-origin `Origin` check described
in the migration guide.

The Phase 5 Studio access UI and Phase 6 authenticated image API are available
through the authenticated page and handler factories above. Studio Download and
Copy request PNG Blobs from the canonical image action.

#### Runtime environment variables

These variables are read by the Node.js server runtime. Keep credentials and
passwords server-side; do not expose them in client bundles, URLs, logs, or
request examples.

| Variable | Required/optional status and validation | Where it is consumed and what it does |
| --- | --- | --- |
| `PORT` | Trusted process setting used to infer the private loopback origin. | `parseImageRenderConfig()` defaults it to `3000` and derives `http://localhost:${PORT}` for the private `/framekit/render/:id` URL and browser render context. |
| `FRAMEKIT_ALLOWED_IMAGE_HOSTS` | Optional; defaults to an empty set. It accepts comma-separated DNS hostnames, trims and lowercases entries, ignores empty entries, and deduplicates them. Each hostname is at most 253 characters. IP literals, wildcards, trailing dots, ports, paths, queries, and fragments are rejected. An empty or comma-only value is valid. | The parsed set is passed to `prepareRenderInputs()` for remote image fields. A remote hostname must exactly match an entry; an empty set therefore permits no remote image host, while safe root-relative paths under `/assets/` or `/framekit/templates/` and data URLs remain supported. |
| `FRAMEKIT_MAX_CONCURRENT_RENDERS` | Optional; defaults to `2`. It must be a base-10 digit string in the inclusive range `1..32`. Signs, decimal points, exponents, whitespace, zero, and larger values are rejected. | `parseImageRenderConfig()` passes the limit to `renderTemplateImage()`, which gives it to `reserveRender()` to enforce process-local simultaneous render capacity. |
| `FRAMEKIT_RENDER_TIMEOUT_MS` | Optional; defaults to `30000` ms. It must be a base-10 digit string in the inclusive range `1..120000` ms. Signs, decimal points, exponents, whitespace, zero, and larger values are rejected. | `parseImageRenderConfig()` passes the value to the request deadline and browser navigation/timeouts used by `renderTemplateImage()`. |
| `FRAMEKIT_DATABASE_PATH` | Optional; defaults to `.framekit-data/framekit.sqlite`. Other than `:memory:`, the path is resolved relative to `process.cwd()` and its parent directory is created when needed. `:memory:` is process-local and is not persisted across restarts. | `getDatabase()` uses it for the SQLite database behind Studio users, password hashes, sessions, API-token hashes/metadata, and migrations. A persistent file therefore preserves access state and must be protected as server data. |
| `FRAMEKIT_ADMIN_USERNAME` | Optional; defaults to `admin`. It is validated only for first-user bootstrap and must be 3–64 characters containing only ASCII letters, numbers, `.`, `_`, or `-`. | `bootstrapUsers()` uses it only when the selected database has no users to create the initial active administrator. It is stored as that user's username; changing the environment variable later does not rename the user. |
| `FRAMEKIT_ADMIN_PASSWORD` | Required when first-user bootstrap runs; it has no default and must be between 12 and 256 UTF-8 bytes. It is not required after the database already contains a user. | `bootstrapUsers()` uses it only to create the initial administrator, hashing it with scrypt before storing the password hash. The raw password is not stored; later environment changes do not change the existing password. |

The image renderer automatically infers its private loopback origin as
`http://localhost:${PORT}` from trusted process configuration. `PORT` defaults to
`3000`. Chromium uses this private loopback origin and is blocked from arbitrary
external network access.

The access login route calls `bootstrapUsers()` before authenticating. On an empty
database, a valid `FRAMEKIT_ADMIN_PASSWORD` and optional username create the first
active administrator. Once a user exists, `FRAMEKIT_ADMIN_USERNAME` and
`FRAMEKIT_ADMIN_PASSWORD` are ignored by bootstrap. Image-render and first-user
bootstrap configuration failures become safe `503` responses: image
configuration uses `api_not_configured`, while invalid bootstrap configuration
uses the access `service_unavailable` error. The underlying image parser raises
`ImageRenderError`, but causes and credentials are not included in these
responses.

**Type exports**

| Type                       | Description                                                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `ImageRenderRequest`       | Request shape with `template`, optional `variant`, and optional data                                |
| `ImageRenderRuntimeConfig` | Runtime settings with loopback origin, allowed image hosts, concurrency, and timeout              |
| `ResolvedRenderPayload`    | Serializable resolved render data with template, variant, data, assets, width, and height        |
| `CreatedRenderJob`         | Private render job identifier and token returned by `createRenderJob`                         |
| `RenderJobTestOptions`     | Optional clock and identifier source overrides for deterministic render-job tests              |
| `ImageRenderErrorCode`     | Public error-code union: `invalid_request`, `unauthorized`, `template_not_found`, `request_too_large`, `unsupported_image`, `invalid_template_data`, `image_host_not_allowed`, `image_fetch_failed`, `api_not_configured`, `render_capacity_exhausted`, `render_timeout`, `render_failed` |
| `ImageRenderFailure`       | Error construction shape with `code`, `message`, optional `fields`, and optional `cause`          |
| `ApiTokenMetadata`         | Safe API-token metadata: `id`, `name`, `tokenPrefix`, `createdAt`, `lastUsedAt`, and `revokedAt`; it never contains the token secret |
| `CreatedApiToken`          | `ApiTokenMetadata` plus `token`; the full token is returned only when a token is created |

`ImageRenderError` retains an optional `cause` on the error instance, but
`toSafeFailure()` and `toJSON()` omit it. JSON serialization therefore contains
only `code`, `message`, and, when present, `fields`; `cause` is not enumerable.
`fields` is supported only for the `invalid_template_data` code and must be a
non-null, non-array object.

`createStudioImageHandler(templates)` accepts a generated registry and returns
the Node.js request handler that authenticates an active session or API token.
The canonical generated consumer
mounts the Studio handler through `createFrameKitApiHandler(templates)` at
`POST /api/framekit/images/render` with `runtime = 'nodejs'` and
`dynamic = 'force-dynamic'`. Requests use the following JSON shape:

```json
{ "template": "example", "variant": "en", "data": {} }
```

The Studio route requires an active session or `Authorization: Bearer
<API_TOKEN>`, resolves and validates the selected template, prepares permitted
image inputs, and returns PNG bytes directly. Success responses are `200
image/png`; failures contain the stable `error`, `message`, and optional
`fields` JSON properties. The handler uses the render settings described in
[Runtime environment variables](#runtime-environment-variables).

An actual request using the generated `example` template is:

```http
POST /api/framekit/images/render HTTP/1.1
Authorization: Bearer <API_TOKEN>
Content-Type: application/json

{"template":"example","variant":"en","data":{"hero":"https://framekit-smoke.test/image.png"}}
```

The remote hostname must be an exact entry in
`FRAMEKIT_ALLOWED_IMAGE_HOSTS` (for this example, `framekit-smoke.test`). Remote image
URLs must use HTTPS and may include a query string for signed CDN URLs, but must
not contain a port, credentials, fragment, or IP literal. They are downloaded by
Node.js before the render job is created.
Chromium receives the resulting data URL and is blocked from arbitrary external
network access. `data:` URLs are the explicit render-network exception;
otherwise only the private internal origin is allowed. TLS verification must
remain enabled; a private test
certificate may be supplied only through `NODE_EXTRA_CA_CERTS` in the smoke
process or its equivalent container mount.

Successful responses are raw PNG bytes with status `200`, `Content-Type:
image/png`, `Cache-Control: no-store`, `X-Content-Type-Options: nosniff`,
`Content-Disposition: inline; filename="example.png"`, and a matching
`Content-Length`. The body must be non-empty, begin with the eight-byte PNG
signature, contain `IHDR` at byte offset `12`, and contain the declared
`1200x800` dimensions as big-endian integers at offsets `16` and `20`. Error
responses are uncached JSON with `error`, `message`, and `fields` only when
canonical template-data validation produced field errors.

| Error | HTTP | Meaning |
| --- | ---: | --- |
| `invalid_request` | 400 | Invalid JSON, shape, variant, or input form |
| `unauthorized` | 401 | Missing or invalid session or API token |
| `template_not_found` | 404 | Unknown authenticated template |
| `request_too_large` | 413 | Request or decoded image exceeds its bound |
| `unsupported_image` | 415 | Unsupported or inconsistent image MIME/signature |
| `invalid_template_data` | 422 | Template field validation failed |
| `image_host_not_allowed` | 422 | Remote host is outside the exact allowlist |
| `image_fetch_failed` | 502 | Allowed remote image could not be fetched safely |
| `api_not_configured` | 503 | Required runtime configuration is unavailable |
| `render_capacity_exhausted` | 503 | Process-local render capacity is full |
| `render_timeout` | 504 | End-to-end render deadline expired |
| `render_failed` | 500 | Rendering failed unexpectedly |

Initial limits are a 12 MB encoded request body, 8 MB decoded bytes per image,
two simultaneous render contexts per Node.js process, a 30-second end-to-end
render deadline, a two-minute in-memory job TTL, three remote redirects, and a
single PNG at the template dimensions with device scale factor `1`. The API is
intended for a long-lived single Node.js process; it has no serverless/Edge
mode, asynchronous public job endpoint, database, queue, or persistent render
output.

The repository's Playwright E2E exercises one authenticated PNG render with real
Chromium. Focused Vitest suites cover authentication, remote-image policy,
limits, and cleanup. `pnpm smoke:docker -- <version>` validates the generated
Docker image at release time using an exact published FrameKit version; see [Testing and
Distribution](../development/testing-and-distribution.md).

The private render job/page handoff remains separate from this public API. The
Chromium headless shell must be installed explicitly with `framekit browser
install` before rendering requests are served.

---

### `@mauriciodmo/framekit/styles.css`

Import this stylesheet in your Next.js layout or global CSS file to apply FrameKit's base styles:

```css
@import "@mauriciodmo/framekit/styles.css";
```

Or via a CSS link in your layout:

```tsx
import "@mauriciodmo/framekit/styles.css";
```

### Published color palette

After importing the stylesheet, consumers may override these 15 numeric
palette variables:

```text
--color-fk-forest-100 ... --color-fk-forest-400
--color-fk-mint-100 ... --color-fk-mint-300
--color-fk-sage-100 ... --color-fk-sage-400
--color-fk-ivory-100 ... --color-fk-ivory-400
```

They generate the matching utilities such as `bg-fk-forest-300` and
`text-fk-sage-400`. The palette is shared by all Studio/editor surfaces and
states; component-specific variables for buttons, loading indicators, toggles,
or pickers are not part of the API.

---

## Peer Dependencies

FrameKit's peer dependencies are:

- **Next.js**: `>=16 <17`
- **React** and **React DOM**: `>=19 <20`

These are peer requirements. The package will emit a warning during installation if the installed versions do not satisfy the constraints, but installation will not be blocked.

---

## Browser vs. Server Suitability

| Export                                                   | Side             | Reason                                                                                             |
| -------------------------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| `FrameKitEditor`, `FrameKitStudio`, `FrameKitNavigation` | Client           | Interactive React components that manage state and respond to user input                           |
| `@mauriciodmo/framekit/client`                           | Client           | Client-only factory for the private render-page adapter                                             |
| `Markdown`                                               | Server or client | Pure React rendering component; the implementation uses no browser-only APIs                       |
| `FrameKitStudioRoot`                                     | Server           | Uses `next/headers` for request-level APIs; must only be used in server components or layouts      |
| `@mauriciodmo/framekit/dev` entry points                 | Server           | Dev server, template discovery, code generation, and file watching are all server-side operations  |
| `@mauriciodmo/framekit/server` entry point               | Server           | Node.js/server-only configuration, authentication, image preparation, render jobs, and image-rendering symbols; do not bundle for browsers |

---

## Package Properties

- **Module system**: ESM-only (`"type": "module"` in `package.json`). There is no CommonJS export.
- **Published files**: `bin/`, `dist/`, `README.md`, `LICENSE`
- **CLI**: `bin/framekit.js` is the entry point for the `framekit` command-line executable

[Español](../../es/reference/public-api.md) · [GitHub issue #13](https://github.com/MauricioDMO/FrameKit/issues/13)
