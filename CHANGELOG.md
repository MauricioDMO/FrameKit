# Changelog

## Unreleased

### Changed

- Established the versionless canonical template contract: required `meta` and
  `variants` objects, field-only `content`, typed `variant` render props, shared
  validation, and deterministic data resolution. See [GitHub issue #1](https://github.com/MauricioDMO/FrameKit/issues/1).
- Updated the Studio templates, generated starter source, public documentation,
  and focused tests to use the canonical shape. Registry metadata consumption was
  tracked separately in issues #12 and #13.
- Added the exact template metadata contract: required non-empty `meta.title`,
  optional functional and marketing descriptions, optional string tags, and
  rejection of unsupported metadata properties. See [GitHub issue #3](https://github.com/MauricioDMO/FrameKit/issues/3).
- Replaced locale-shaped template selection with the explicit variant contract:
  `getVariants`, field-only content, validated defaults and labels, variant-named
  editor state, and `framekit:<slug>:v2` persistence that discards old `v1`
  state. See [GitHub issue #4](https://github.com/MauricioDMO/FrameKit/issues/4).
- Replaced the plural field factory namespace with singular `field`, removed the
  duplicate `textarea` kind, and made `field.text` multiline with optional
  `minLength` and `maxLength` validation. See [GitHub issue #5](https://github.com/MauricioDMO/FrameKit/issues/5).
- Added `field.choice` with frozen ordered options, required defaults, native
  Studio selects, and `invalid_choice` validation for undeclared values. See
  [GitHub issue #6](https://github.com/MauricioDMO/FrameKit/issues/6).
- Added `field.boolean` with real boolean defaults, typed content and overrides,
  native Studio checkboxes, and `invalid_boolean` validation without string
  coercion. See [GitHub issue #7](https://github.com/MauricioDMO/FrameKit/issues/7).
- Added the breaking `field.number` contract: required finite numeric defaults,
  native `input`/`slider` controls (`input` by default and explicit bounds for
  `slider`), finite ordered bounds, positive finite `step` defaulting to `1`,
  numeric data without string coercion, and local drafts excluded from render
  data. Existing string defaults, content values, and overrides must be migrated
  manually. See [GitHub issue #8](https://github.com/MauricioDMO/FrameKit/issues/8).
- Added the canonical generated template registry: `templates` entries now carry
  validated metadata, dimensions, variants, declaration-ordered variant keys,
  assets, and lazy loaders. `dev`, `check`, and `build` regenerate automatically;
  `start` remains read-only. Removed the old top-level `title`, `templateManifest`,
  and `templateRegistry` outputs, and expanded template watching to every path
  under `src/templates`. See [GitHub issue #12](https://github.com/MauricioDMO/FrameKit/issues/12).
- Completed Studio's direct canonical `TemplateRegistryEntry` integration,
  metadata presentation, generic variants, typed native controls, localized
  navigation and errors, and `v2` editor persistence with intentional `v1`
  invalidation. See [GitHub issue #13](https://github.com/MauricioDMO/FrameKit/issues/13).
- Corrected persisted choice handling: a stale choice override is discarded
  without discarding valid sibling overrides, and current content or field
  defaults provide the fallback. The editor reads only the `v2` persistence key;
  no `v1` compatibility is promised. See [GitHub issue #17](https://github.com/MauricioDMO/FrameKit/issues/17).
- Added versionless verification gates for the current repository: full Ubuntu
  checks on Node.js `22.13.0` and `24`, focused Windows generated-consumer
  checks on Node.js `22.13.0`, and one Chromium Studio critical path. Release
  tarball and npm checks take versions supplied during release preparation; no
  release version is selected here. See [GitHub issue #15](https://github.com/MauricioDMO/FrameKit/issues/15).
- Added the authenticated server-side PNG API to the public package and generated
  consumer, including the pinned `playwright-core` runtime, explicit
  `framekit browser install` command, generated Docker image, local tarball
  verification, and non-root Chromium runtime checks. The registry-backed Docker
  smoke remains a release-time handoff; no package version is selected here.
- Added the SQLite persistence foundation for the planned Studio access flow:
  lazy `node:sqlite` connections, schema version 1 for users, sessions, and API
  tokens, process-global connection reuse, WAL and busy-timeout setup, and ignored
  local database artifacts. This phase provides the internal schema; login/session
  HTTP, token management, Studio UI, and server-backed Studio export remain
  subsequent phases. See the [SQLite and migrations phase plan](Docs/Plans/studio-access-and-api-rendering/01-sqlite-and-migrations.md).
- Completed Phase 2 users and passwords with asynchronous fixed-profile
  `scrypt:v1` credentials, lazy first-administrator bootstrap without legacy
  render-key import, safe user DTOs and mutations, session
  cleanup on password changes and deactivation, and the last-active-administrator
  invariant. Session/HTTP access, Studio UI, API-token endpoints, and
  server-backed export remain subsequent phases. See the [users, passwords, and
  bootstrap phase plan](Docs/Plans/studio-access-and-api-rendering/02-users-passwords-and-bootstrap.md).
- Implemented Studio Access Phase 3 with hashed 30-day sessions, an exact-origin
  security boundary, protected Studio routes and login behavior, and authenticated
  development asset uploads; no release-version or persisted-content migration
  is introduced. See the [sessions, HTTP, and route protection phase plan](Docs/Plans/studio-access-and-api-rendering/03-sessions-http-and-route-protection.md).
- Implemented and verified Studio Access Phase 4 with owner-scoped token
  creation/listing/revocation, administrator user management and token
  metadata/revocation, one-time generated `fk_` secrets stored only as SHA-256
  hashes, active-owner credential lookup with `last_used_at`, safe DTOs,
  transactional last-active-administrator protection, exact access routes, and
  DELETE route adapters. Authenticated image API/session export remain pending
  phases 6-8. See the [API tokens, users, and authorization phase
  plan](Docs/Plans/studio-access-and-api-rendering/04-api-tokens-users-and-authorization.md).
- Implemented and verified Studio Access Phase 5 with reusable authenticated
  login, account, token, and administrator user UI, safe `StudioUser` handoff,
  `/settings` section routing, accessible confirmation flows, and English/Spanish
  message coverage. See the [Studio access UI phase plan](Docs/Plans/studio-access-and-api-rendering/05-studio-access-ui.md).
- Implemented and verified Studio Access Phase 5.5 with the public
  `createFrameKitApiHandler(templates)` dispatcher, one catch-all
  `/api/framekit/[...action]` adapter in Studio and generated consumers,
  canonical session/API-token image rendering at
  `POST /api/framekit/images/render`, and
  removal of the unshipped `/api/v1/images` route. The image pipeline and
  existing access-handler security boundaries remain unchanged. See the
  [FrameKit API namespace phase plan](Docs/Plans/studio-access-and-api-rendering/05.5-framekit-api-namespace.md).
- Consolidated the English and Spanish rolling migration guides and marked the
  `v0.8.0` guides as historical records. See [GitHub issue #14](https://github.com/MauricioDMO/FrameKit/issues/14).
