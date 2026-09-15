# Rolling Migration Guide

This is the current rolling guide for adopting the implemented versionless
contract. It intentionally does not select a package release version. For the
older 0.7.0-to-0.8.0 release path, see the [historical migration
guide](./migration-v0.8.0.md).

## Current prerequisites and scope

- Use Node.js `>=22.13.0` and pnpm `>=11.14.0`, as required by the current
  workspace and public package manifests. The public runtime's peer ranges are
  Next.js `>=16 <17` and React/React DOM `>=19 <20`.
- This guide does not require an alpha, future, or otherwise preselected package
  version. Release version selection is a separate maintainer step.
- The existing runtime and Studio baseline described here is implemented. The
  server image-generation API is available through the generated consumer's
  `POST /api/v1/images` route; install its Chromium headless shell explicitly
  with `framekit browser install` before serving requests.
- Studio Access and API Rendering Phase 4 (SQLite, migrations, users,
  passwords, bootstrap, sessions, HTTP access, route protection, and token/user
  management) is implemented. Later phases remain unavailable. Server Image
  Rendering Step 8 remains blocked until that plan is complete; the Studio
  access UI and server-backed Download/Copy remain later phases.

This rolling guide is the documentation deliverable for [GitHub issue
#14](https://github.com/MauricioDMO/FrameKit/issues/14).

## Studio Persistence Foundation

Phase 1 of the Studio access plan is implemented. It adds an internal SQLite
layer through `node:sqlite`, but it does not change authentication flow or make
Studio routes protected yet.

- `FRAMEKIT_DATABASE_PATH` is read lazily. Relative paths resolve from the
  application's working directory; when omitted, the database is created at
  `.framekit-data/framekit.sqlite`.
- The first migration sets `PRAGMA user_version = 1` and creates strict
  `users`, `sessions`, and `api_tokens` tables with their indexes and foreign
  keys.
- The connection opens only when the access runtime requests it. Importing
  package facades, generating the registry, or constructing the application does
  not create the database or its WAL/SHM files.
- The connection is reused per database path through process-global state. The
  database is reserved for access data; render jobs remain temporary and stay in
  the process-memory `Map`.
- `.framekit-data/` is excluded from Git, Docker build contexts, and tarballs.
  Do not use `.framekit/`, which remains reserved for disposable FrameKit output.

`node:sqlite` remains an active-development API in Node.js 22, so the minimum
runtime remains Node.js `>=22.13.0`. The Phase 1 foundation only prepares empty
tables; Phase 2 uses them for lazy, request-time first-administrator bootstrap
and local credentials. Phase 3 adds login/session HTTP, protected Studio routes,
and authenticated development asset uploads. Phase 4 adds authenticated token
and user management routes. The Studio access UI and server-backed Download/Copy
belong to later phases.
`FRAMEKIT_ADMIN_USERNAME` and `FRAMEKIT_ADMIN_PASSWORD` apply only during the
first bootstrap; `FRAMEKIT_API_KEY` is imported only then, while the classic
image handler continues reading it independently.

With Phase 4 implemented, `POST /api/v1/images` continues to use
`FRAMEKIT_API_KEY`, and Download PNG and Copy PNG continue to use the current
browser exporter. The Studio access UI and server-backed Download/Copy remain
later phases. This foundation does not migrate template data, assets, or
persisted editor state.

The server image API remains bounded to one long-lived Node.js process per
container. Render jobs are process-local, disappear on restart, are not stored in
SQLite, and do not support serverless or multi-replica execution.

## User Credentials and First-Admin Bootstrap

Phase 2 of the Studio access plan is implemented. It adds local credentials and
safe user operations without adding HTTP handlers or UI yet.

- Passwords must be 12-256 UTF-8 bytes. They are hashed asynchronously with the
  fixed `scrypt:v1` profile and random salts; passwords and imported API-key
  secrets are stored only as hashes. The safe `StudioUser` DTO exposes only
  `id`, `username`, and `role`.
- On the first lazy, request-time initialization of an empty database,
  `FRAMEKIT_ADMIN_PASSWORD` is required and `FRAMEKIT_ADMIN_USERNAME` defaults
  to `admin`. `FRAMEKIT_DATABASE_PATH` continues to select the database path.
- A non-empty `FRAMEKIT_API_KEY` is imported once as a SHA-256 legacy API-token
  hash. Once any user exists, the bootstrap environment values are ignored and
  account data is not synchronized from the environment.
- Validated user mutations cover username, role, active state, password changes,
  resets, and deletion. Password changes and deactivation delete that user's
  sessions; a transaction prevents deleting, deactivating, or demoting the
  last active administrator.
- Phase 3 provides login/session HTTP and protected Studio routes. Phase 4
  provides token and user management routes. `POST /api/v1/images` still uses
  `FRAMEKIT_API_KEY`, while Download PNG and Copy PNG still use the browser
  exporter; the Studio access UI and server-backed Download/Copy remain later
  phases.

## Studio Access, Sessions, Route Protection, and Management

Studio Access and API Rendering Phase 4 is implemented. Phases 1-4 are
available; the Studio access UI and server-backed Download/Copy remain later
phases.

The access handler exposes these routes:

```text
POST  /api/framekit/login
POST  /api/framekit/logout
GET   /api/framekit/account
PATCH /api/framekit/account
POST  /api/framekit/account/password
GET   /api/framekit/tokens
POST  /api/framekit/tokens
DELETE /api/framekit/tokens/:id
GET   /api/framekit/users
POST  /api/framekit/users
PATCH /api/framekit/users/:id
DELETE /api/framekit/users/:id
POST  /api/framekit/users/:id/password
GET   /api/framekit/users/:id/tokens
```

Login creates the session used by the authenticated routes. A normal user can
read and update their account, change their password, create/list/revoke their
own API tokens, and list their own token metadata. An administrator can also
list/create/update/delete users, reset a user's password, list token metadata
for any user, and revoke any token. Login, account, and user creation/update
responses expose only the safe `StudioUser` fields: `id`, `username`, and
`role`. The administrator's user list also exposes `active`, `createdAt`, and
`updatedAt`; no response exposes password hashes, session secrets, token hashes,
or previously returned token secrets.

Creating a token returns its full `token` value once, in the `201` response.
Later listings and the database contain only metadata and a hash, never the
full secret. Metadata includes `id`, `name`, `tokenPrefix`, `createdAt`,
`lastUsedAt`, and `revokedAt`. API-token Bearer lookup hashes the bounded,
non-empty presented credential, requires an unrevoked token whose owner is
active, and records `lastUsedAt` on a successful lookup. The generated-token
`fk_` prefix is not required, so imported legacy credentials can be used. The
classic image API's Bearer contract still uses `FRAMEKIT_API_KEY`; these Studio
management routes use the session cookie.

On the first bootstrap only, a non-empty `FRAMEKIT_API_KEY` is imported as a
legacy API token for the first administrator. Its secret is stored as a hash
and is not re-imported or synchronized after any user exists.

Session-protected account, token, and user-management operations return `401`
when the session is missing or invalid; invalid login credentials also return
`401`. Logout is idempotent: it returns `200` and expires the cookie even when
the request has no valid session. Normal users receive `403` for
administrator-only operations or another user's token metadata. Unknown users,
unavailable token targets, and token revocations outside the actor's permission
return `404`; unsupported methods return `405`; duplicate usernames and
attempts to remove, disable, or demote the last active administrator return
`409`.

Successful login sets a `framekit_session` cookie with `HttpOnly`,
`SameSite=Lax`, `Path=/`, and a 30-day `Expires`/`Max-Age` lifetime. It also
sets `Secure` when `NODE_ENV=production`. The database stores only the
SHA-256 session hash and its user, creation, and expiry metadata; the raw
secret is returned only in the cookie. Logout deletes the current stored
session and expires the browser cookie. Password changes invalidate every
session for the user and expire the current cookie. Login, account, and user
creation/update responses expose only the safe `StudioUser` fields: `id`,
`username`, and `role`; administrator user lists also include the safe `active`,
`createdAt`, and `updatedAt` fields.

Login and every cookie-authenticated unsafe request require an `Origin` header
whose value exactly matches the canonical request origin. For direct requests,
that is `new URL(request.url).origin`. Because the Next 16 adapter can build
`request.url` from its configured internal hostname and port, the supported
HTTPS reverse-proxy path uses one valid `x-forwarded-proto: https` value and one
valid `x-forwarded-host` authority as the canonical public origin. Incomplete,
ambiguous, malformed, or non-HTTPS forwarding overrides are rejected before
body parsing or data mutation. The proxy must overwrite or strip client-supplied
forwarding headers; there is no `FRAMEKIT_PUBLIC_ORIGIN` fallback. The supported
HTTPS reverse-proxy shape is:

```text
browser/request URL: https://framekit.example.com/api/framekit/...
reverse proxy -> container: http://127.0.0.1:3000
Origin: https://framekit.example.com
```

The proxy forwards the external host and protocol through its normal headers so
the access handler can use the canonical public origin even when Next.js keeps
the internal origin in `request.url`; no `FRAMEKIT_PUBLIC_ORIGIN` setting is
required.

The `editor` and `brand` Studio sections validate an active session and redirect
missing or invalid sessions to `/login`. The login page redirects an already
authenticated user to `/editor` and otherwise renders the login form. The
development server's authenticated `/framekit/assets` upload requires a valid
session and the same-origin `Origin` before it handles or writes an asset.

`/framekit/render/[id]` remains independent of Studio sessions. Its existing
internal render-job ID and `x-framekit-render-token` are still the only
authentication boundary for that private route.

Phase 4 introduces no template, asset, editor-state, or release-version
migration. The existing image API and browser export behavior remain unchanged;
the Studio access UI and server-backed Download/Copy remain later phases.

## Server Rendering Integration

Generated projects include the additive server-side PNG path. The generated
`next.config.ts` uses `withFrameKit()`, the unified section route serves the
existing `/editor` and `/brand` URLs, and the explicit API and private render
routes remain application-owned. `framekit generate` recreates the
`studio-client.tsx` and `render-client.tsx` bindings under
`src/generated/framekit/`; do not hand-edit those files or add a sibling render
binding to the route directory.

For server rendering, install the browser runtime from the FrameKit package
rather than adding a consumer `playwright-core` dependency:

```sh
framekit browser install
framekit browser install --with-deps
```

The second form installs Linux system dependencies and may require root or
equivalent privileges. The generated Dockerfile is pnpm-specific and requires
a generated `pnpm-lock.yaml`; API keys and image-host policy are supplied at
runtime, not baked into the image. Existing applications may keep their manual
routes and Next configuration, but should run `framekit generate`, `framekit
check`, `framekit build`, and a production PNG request after adopting the server
route. This feature does not migrate template data, assets, or persisted editor
state.

## Canonical Template Contract

Issue [#1](https://github.com/MauricioDMO/FrameKit/issues/1) establishes one
template shape for the runtime and Studio. Update each template definition to
include:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Template title' },
  width: 1200,
  height: 630,
  fields: { title: field.text({ label: 'Title' }) },
  variants: { default: 'square', labels: { square: 'Square' } },
  content: { square: { title: 'Hello' } },
  render({ data, assets, variant, width, height }) {
    return <article style={{ width, height }}>{data.title}</article>
  },
})
```

The name `locale` and the entry-level `language` property mentioned below refer
only to older template-source APIs. They are not current template properties;
replace them during migration.

Required source changes:

- add the `meta` and `variants` objects;
- move display names to `variants.labels`;
- remove entry-level `language` properties; content entries contain field values only;
- rename the render input from `locale` to `variant`;
- remove any unsupported top-level version or alternate contract property;
- run `framekit generate`, `framekit check`, and `framekit build`.

This is a breaking template-source change. There is no compatibility alias or
automatic migration command. The metadata and field changes below are part of
the same current contract.

See the [canonical contract issue](https://github.com/MauricioDMO/FrameKit/issues/1)
and the [template contract reference](../reference/template-contract.md).

## Template Metadata

Issue [#3](https://github.com/MauricioDMO/FrameKit/issues/3) makes the metadata
contract exact. Update every template definition so `meta` has a non-empty
`title`; optionally add `description`, `marketingDescription`, and `tags`.
Remove `revision`, `status`, `keywords`, `order`, and any other unsupported
metadata properties. A title is required even when the directory name already
looks like a suitable catalog label; there is no slug fallback. This is a
required source update for existing templates, not an additive no-migration
change.

See the [template metadata issue](https://github.com/MauricioDMO/FrameKit/issues/3)
and the [template contract reference](../reference/template-contract.md#template-metadata).

## Content Variants

Issue [#4](https://github.com/MauricioDMO/FrameKit/issues/4) replaces the
locale-shaped template content contract with explicit variants. The old
locale-shaped terminology is historical migration context only: a variant is a
generic, arbitrary string content key, not a language. Keys such as `square`,
`campaign-a`, or `en` are all valid when declared in `content`.

Update existing template and editor consumers as follows:

- keep field-only `content` entries and remove any entry-level `language` metadata;
- require `variants.default` to name an existing content key;
- keep `variants.labels` optional, and make every label key name an existing content key;
- reject `variants.mode`, other unsupported variant properties, unknown labels, unknown defaults, and requested variants that are not defined;
- rename `getLocales` to `getVariants` with no compatibility alias;
- rename editor content state and actions from old locale names to variant
  names;
- change editor persistence from `framekit:<slug>:v1` to `framekit:<slug>:v2`; old `v1` state is discarded, not migrated.

This is a breaking source and persistence change. There is no compatibility alias
or automatic migration command. The Studio interface locale (`FrameKitLocale`,
EN/ES) is separate from template variants; changing interface language does not
change the selected variant. Run `framekit generate`, `framekit check`, and
`framekit build` after updating the templates.

See the [content variants issue](https://github.com/MauricioDMO/FrameKit/issues/4)
and the [template contract reference](../reference/template-contract.md).

## Semantic Fields

Issue [#5](https://github.com/MauricioDMO/FrameKit/issues/5) makes the field
factory API singular and removes the duplicate textarea kind. References to
the old plural `fields` factory namespace and `fields.textarea` below are
historical migration context only. The current API is `field.*`; the template
definition property is still named `fields`. Update template source as follows:

- change the root import from `fields` to `field`;
- keep the template definition property named `fields`;
- replace `fields.text`, `fields.color`, `fields.number`, and `fields.image` with
  `field.text`, `field.color`, `field.number`, and `field.image`;
- replace every `fields.textarea` with `field.text`;
- use `minLength` and `maxLength` only on `field.text`; they must be finite,
  non-negative integers with `minLength <= maxLength`;
- expect `field.text` to render a native multiline `<textarea>` and preserve
  newline characters;
- handle `text_too_short` and `text_too_long` validation errors without
  trimming the value before measuring its length.

There is no `fields` compatibility alias, no `field.textarea`, and no separate
`textarea` field kind. This is a breaking source change, not an additive change
with a no-migration path. Run `framekit generate`, `framekit check`, and
`framekit build` after updating the starter and project templates.

See the [semantic fields issue](https://github.com/MauricioDMO/FrameKit/issues/5),
the [template contract reference](../reference/template-contract.md), and the
[public API reference](../reference/public-api.md).

## Choice Field

Issue [#6](https://github.com/MauricioDMO/FrameKit/issues/6) adds
`field.choice` for closed-set string values. This is an additive change; existing
text, number, color, and image fields do not require migration.

Declare a non-empty ordered option list and a required default that matches one
of its values:

```tsx
alignment: field.choice({
  label: 'Alignment',
  options: [
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' },
  ],
  defaultValue: 'center',
})
```

Studio renders a native `<select>` in the declared option order. Choice fields
do not accept `required` or `control`; values are not trimmed or coerced. Content
and edits must use a declared string value. An unknown value fails data
validation with `{ code: 'invalid_choice' }` instead of selecting the first
option as a fallback.

See the [choice field issue](https://github.com/MauricioDMO/FrameKit/issues/6), the
[template contract reference](../reference/template-contract.md), and the
[public API reference](../reference/public-api.md).

## Boolean Field

Issue [#7](https://github.com/MauricioDMO/FrameKit/issues/7) adds
`field.boolean` for binary decisions. This changes the value boundary for
boolean fields from strings to real booleans. Existing text, number, color,
image, and choice fields do not need migration unless they are being changed to
booleans.

Declare the field with an optional boolean default:

```tsx
showLogo: field.boolean({
  label: 'Show logo',
  defaultValue: true,
})
```

Update every boolean field's content and render logic to use `true` or `false`,
not `'true'` or `'false'` strings. If `defaultValue` is omitted, the resolved
default is `false`. Studio uses a native checkbox, and persisted overrides must
also be real booleans; old string overrides are discarded rather than coerced.
Boolean fields do not accept `required` or `control`.

Wrong runtime values return `{ code: 'invalid_boolean' }`. Use a `choice` field
for tri-state values instead of recommending or storing `'true'`/`'false'`
strings. This is an additive field kind for existing templates, but adopting it
requires the typed source update above. Run `framekit generate`, `framekit check`,
and `framekit build` after updating templates.

See the [boolean field issue](https://github.com/MauricioDMO/FrameKit/issues/7), the
[template contract reference](../reference/template-contract.md), and the
[public API reference](../reference/public-api.md).

## Number Field

Issue [#8](https://github.com/MauricioDMO/FrameKit/issues/8) changes the
contract for `field.number`. This is a breaking adoption change for number
fields: there is no compatibility alias, numeric-string coercion, or automatic
migration.

Update every number field as follows:

- replace every string `defaultValue` with a required finite number, such as
  `defaultValue: 10` instead of `defaultValue: '10'`;
- remove `required`; number fields are always present because their numeric
  `defaultValue` is required;
- replace string values in every `content` variant with finite numbers;
- replace or remove persisted string overrides before use; overrides must be
  finite numbers and are not converted automatically;
- keep supplied `min` and `max` finite and ordered (`min <= max`);
- use a finite positive `step`, which defaults to `1` and follows native
  numeric/range semantics;
- use `control: 'input'` (the default) for a native `<input type="number">`,
  or `control: 'slider'` for a native `<input type="range">`; slider fields
  require explicit finite `min` and `max` bounds and display the current value.

Content values, overrides, resolved data, and render props must be finite
numbers. Numeric strings are rejected without coercion. During an empty or
temporarily malformed edit, Studio keeps a local draft separate from committed
numeric data; that draft is not render data and is never passed to `render`.

```tsx
count: field.number({
  label: 'Count',
  defaultValue: 10,
  min: 0,
  max: 100,
})
```

Run `framekit generate`, `framekit check`, and `framekit build` after updating
number fields.

See the [number field issue](https://github.com/MauricioDMO/FrameKit/issues/8), the
[template contract reference](../reference/template-contract.md#number), and
the [public API reference](../reference/public-api.md).

## Generated Template Registry

Issue [#12](https://github.com/MauricioDMO/FrameKit/issues/12) changes the
project-local generated template registry. Run `framekit generate` after updating
the project if you need to regenerate it directly, but normal workflows handle
this automatically: `dev` generates before starting and watches every added,
removed, or changed path under `src/templates` and `src/brand`; `check` and
`build` generate before validation/build; `start` does not generate. Changes
under `src/brand` also regenerate the project-local brand module.

The generated module now exports only `templates: TemplateRegistryEntry[]`. Each
entry contains `slug`, `segments`, validated `meta`, `width`, `height`, `variants`,
declaration-ordered `variantKeys`, `assets`, and a lazy `load` function. Update
custom generated-registry consumers as follows:

- replace `entry.title` with `entry.meta.title`;
- stop importing `templateManifest` or `templateRegistry`;
- find the entry in `templates` and call its `load()` function when the definition
  is needed.

Generated files are disposable and are replaced by the generator. Do not edit or
manually migrate `src/generated/framekit/templates.ts`, and do not retain an
adapter for the old registry shape. This is a generated-consumer API change; the
source template definition contract itself does not gain a compatibility alias.

Generation reports the count in English, for example `FrameKit: 1 template` or
`FrameKit: 3 templates`. In `dev`, the initial generation and later regeneration
use the same output format.

See the [generated registry CLI reference](../reference/cli.md#framekit-generate),
the [public API reference](../reference/public-api.md#generated-template-registry),
and [GitHub issue #12](https://github.com/MauricioDMO/FrameKit/issues/12).

## Persisted Choice Values

The current persisted-value contract for `field.choice` discards a saved choice
override when it no longer matches the declared options. It discards only that
override: valid sibling overrides in the same or another valid variant survive.
Resolution then uses the current variant content, or the field's current
default when that content does not provide a value. This behavior is tracked in
[issue #17](https://github.com/MauricioDMO/FrameKit/issues/17).

The editor reads only `framekit:<slug>:v2`. It does not read or migrate
`framekit:<slug>:v1`, and no v1 compatibility is promised. Other stale or
wrongly typed persisted field values are filtered the same way; valid values
are not discarded merely because a sibling value is stale.

This is a persistence hardening change, not a release-version migration. No
source migration command is added.

## Studio Canonical Contract Integration

Issue [#13](https://github.com/MauricioDMO/FrameKit/issues/13) completes Studio's
direct integration with the canonical contracts. Existing Studio integrations
must consume the generated `templates: TemplateRegistryEntry[]` directly. Do
not create a second Studio registry model or adapt the legacy registry shape.
When rendering `FrameKitEditor` directly, pass the reusable
`TemplateRegistryEntry` through its `template` prop and pass the loaded,
validated definition separately; do not reconstruct an older template prop
shape.

Update existing consumers as follows:

- Read the display title from `entry.meta.title` in navigation and the editor
  header; never derive it from the slug. The editor also displays
  `meta.description`, `meta.marketingDescription`, and `meta.tags` when present,
  omitting each optional value when absent.
- Use generic `variant` names in template selection state, actions, props, and
  callbacks. Start with `definition.variants.default`, render optional labels
  with a key fallback, and keep the selector label generic (`Variant`). The
  Studio interface locale (`FrameKitLocale`, EN/ES) is independent: changing
  interface language must not change the selected template variant.
- Keep the sidebar navigation compact and accessible: preserve the folder
  hierarchy, expand/collapse behavior, keyboard operation, visible focus,
  folder-only scope lines for expanded groups, and subdued selected-template
  styling with `aria-current="page"`. Do not add search or filtering.
- Keep the canonical typed controls: text uses a native `<textarea>`, choice a
  native `<select>`, boolean a native checkbox, number its declared native
  number or range control, color its existing control, and image its asset
  control. Preserve string, finite-number, and boolean runtime values; choice
  values remain declared strings.
- Persist editor state only under `framekit:<slug>:v2`. The previous `v1`
  persistence format is intentionally invalidated and discarded, not migrated;
  no v1 compatibility is promised. Stale choice overrides are discarded while
  valid sibling overrides survive, after which current content/default fallback
  applies. Empty or temporarily invalid number input stays as a local control
  draft; it is not committed editor data and is never passed to `render`.
- Keep Studio-owned navigation and error UI localized through the centralized
  Studio messages. Route tabs, sidebar navigation labels, metadata labels,
  loading and not-found states, definition/data errors, upload errors, export
  errors, and validation messages use the active interface locale; template
  titles, metadata values, and variant labels remain source-provided. Validation
  errors remain associated with their controls, and export/copy focuses the
  first invalid control before producing output.

This is a versionless breaking integration update; no release version has been
selected. There is no compatibility alias, automatic migration command, or
legacy registry adapter. Manually update affected template and editor-consumer
source, and treat the `v1` persistence invalidation as an intentional manual
reset where applicable. Regenerate generated files with `framekit generate`
instead of editing them by hand, then run `framekit check` and `framekit build`.

See the [Studio canonical contract issue](https://github.com/MauricioDMO/FrameKit/issues/13).

## Verification and release status

Issue [#15](https://github.com/MauricioDMO/FrameKit/issues/15) records the
versionless verification gates. The repository CI defines full checks on
Ubuntu with Node.js `22.13.0` and `24`, a focused generated-consumer smoke on
Windows with Node.js `22.13.0`, and one Chromium Studio critical path. These
checks do not claim broad browser, macOS, or visual-regression coverage.

The pre-publication tarball and post-publication npm checks take package
versions supplied during release preparation. They do not select a release
version here. The verification work changes no persisted user data and needs
no additional migration.
