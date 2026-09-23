# Changelog

## Unreleased

## 1.0.0

### Changed

- **BREAKING:** Authentication is disabled by default when
  `FRAMEKIT_AUTH_ENABLED` is absent or `false`. Set it to `true` before
  upgrading a private deployment that must keep Studio and image rendering
  protected. See the [v0.8.x to v1.0.0 migration guide](https://framekit.mauriciodmo.com/en/users/migrations/v08-to-v10).
- **BREAKING:** Templates now use the canonical contract: required `meta` and
  `variants`, field-only `content`, and the singular `field` API. Text fields are
  multiline; choices must match declared options, booleans remain booleans, and
  numeric values are not coerced from strings.
- **BREAKING:** Explicit variants replace locale-shaped template selection.
  Editor state uses `framekit:<slug>:v2`; existing `v1` state is discarded.
- Generated template registry entries include validated metadata, dimensions,
  variants, and assets. `framekit dev`, `check`, and `build` regenerate the
  registry; `start` does not. The former top-level `title`, `templateManifest`,
  and `templateRegistry` outputs are removed.
- Studio now presents template metadata and variant-aware editing, typed native
  controls, localized navigation, and account, API-token, and administrator
  user-management screens for authentication-enabled deployments.
- Added `POST /api/framekit/images/render` for server-side PNG generation. It
  accepts session or API-token credentials when authentication is enabled, and
  follows the open-mode default otherwise. `framekit browser install` installs
  the pinned Chromium runtime used for rendering.
- `FrameKitNavigation` accepts an optional `pathname` prop for current-item
  highlighting and automatic expansion of folders containing it. Existing calls
  without the prop remain valid but render with no item marked current.
