# Phase 6 - Authenticated Image API and Export

## Goal

Use the existing Chromium renderer for Studio Download PNG and Copy PNG through
`POST /api/framekit/images/render`, using the current session/API-token
authentication and one shared request/render pipeline.

## Depends on

- Phase 3 session authentication.
- Phase 4 API-token authentication.
- Phase 5 Studio user experience.
- Phase 5.5's unversioned `/api/framekit` namespace and catch-all adapter.
- The current `createStudioImageHandler()` and private-render implementation.

## Shared handler design

Keep one image pipeline and one internal composition point for:

```text
configuration
request deadline
bounded JSON body
exact request parser
template lookup/load
image preparation
data resolution/validation
Chromium render
PNG/error response
cleanup
```

```ts
createStudioImageHandler(templates)
```

The current factory parses render settings with `parseImageRenderConfig()` and
does not require an external render credential. It accepts a database API token
or Studio session. The old API-key-only factory/configuration contract is removed
and is not a compatibility requirement.

The six current FrameKit-specific application variables and their defaults, validation,
first-boot, persistence, and security semantics are defined in Phase 5.5. The
trusted process `PORT` setting defaults to `3000` and supplies the inferred
private loopback origin `http://localhost:${PORT}`. In particular,
`FRAMEKIT_PUBLIC_ORIGIN` is unsupported and is not a fallback or a replacement
configuration setting.

## Authentication order

For the Studio handler:

1. Load and validate render configuration; database-backed authentication uses
   the configured database as needed.
2. If `Authorization` exists, validate only its strict Bearer database API
   token.
3. Otherwise validate the session cookie and same-origin `Origin` header.
4. Return `401` before reading the body when authentication fails.
5. Continue through the existing pipeline only after authentication succeeds.

An invalid Authorization header must not fall back to an ambient browser
session. Update `last_used_at` when API-token authentication succeeds. Session
secrets and API-token secrets are stored only as hashes in the configured
SQLite database; sessions expire and tokens can be revoked. The session path
uses the validated request/forwarding origin rules, not an environment origin
fallback.

Do not change `/framekit/render/[id]`, render jobs, browser header injection, or
private-token comparison.

## Studio request contract

After local validation succeeds, Studio sends:

```json
{
  "template": "template/slug",
  "variant": "selected-variant",
  "data": {
    "editedField": "committed edit"
  }
}
```

Send the current `userEdits`, not `resolvedData`. The server remains responsible
for defaults, variant content, assets, image preparation, canonical resolution,
and validation.

Keep local validation because it gives immediate field feedback and prevents an
unnecessary render request. Treat server validation as authoritative.

When the server returns `422 invalid_template_data`, validate the returned
structured field-error objects, translate them through the existing editor
messages, merge them into current errors, and focus the first affected control.
Malformed error bodies and other failures use the existing generic export alert.

## Download and clipboard

Download:

1. Request the PNG Blob.
2. Require an `image/png` success response.
3. Create an object URL.
4. Trigger `<slug-with-dashes>.png` download.
5. Revoke the URL and remove any temporary element.

Copy:

1. Confirm `navigator.clipboard.write` and `ClipboardItem` support.
2. Request the same PNG Blob.
3. Write `new ClipboardItem({ 'image/png': blob })`.

Both actions share the existing pending guard. The preview remains local and
must not wait for the server renderer.

## Removing client-side browser capture

Only after the server-backed integration tests pass:

- remove client-side DOM capture, cloning, and data-URL conversion; retain the
  server-side `document.fonts.ready` wait in `packages/framekit/src/server/render-image.ts`;
- remove the editor export ref when it has no other consumer;
- remove `modern-screenshot` from `packages/framekit/package.json`;
- remove it from `tsdown.config.ts` externals;
- remove its mocks and dedicated capture tests;
- update `pnpm-lock.yaml` through `pnpm install`;
- remove current documentation and troubleshooting claims about browser capture.

Do not remove `TemplateCanvas`; it remains shared by preview and private render.

## Expected source and adapters

```text
packages/framekit/src/server/image-handler/
packages/framekit/src/server/config.ts
packages/framekit/src/server.ts
packages/framekit/src/editor/framekit-editor.tsx
packages/framekit/src/editor/export/export-template.ts
packages/create-framekit/template/src/app/api/framekit/[...action]/route.ts
apps/studio/src/app/api/framekit/[...action]/route.ts
packages/framekit/package.json
packages/framekit/tsdown.config.ts
pnpm-lock.yaml
```

The two application routes remain thin catch-all bindings with Node/dynamic
route configuration. Phase 5.5 owns their unified dispatch; this phase changes
the image handler behind `/api/framekit/images/render` without adding another
route file.

## Focused tests

- Studio handler succeeds with a valid API token without an external render key;
- Studio handler succeeds with a valid same-origin session;
- Studio handler accepts the same-origin session through the verified HTTPS
  reverse-proxy topology;
- invalid Bearer does not fall back to a valid session;
- revoked token, inactive user, expired session, and cross-origin session fail
  before body/template/browser work;
- the Studio factory uses one shared parse/resolve/render implementation;
- Studio sends exact template, selected variant, and user edits;
- Studio does not send resolved defaults/assets;
- Download receives a PNG Blob and revokes its object URL;
- Copy writes the PNG Blob and reports unsupported clipboard capability;
- duplicate clicks are blocked while the request is pending;
- structured `422` errors are translated and focus the first field;
- malformed errors and `500` responses show the generic alert;
- private route accepts only its internal render token;
- no client-capable output imports Node, SQLite, or Playwright;
- no package/build/lockfile reference to `modern-screenshot` remains.

## Exit gate

Phase 6 is complete when Studio download and copy use the authenticated server
endpoint, all image work flows through one pipeline, the removed client-side
browser capture code and legacy API-key contract remain absent, the private
renderer retains its `document.fonts.ready` wait, and its security contract is
unchanged.
