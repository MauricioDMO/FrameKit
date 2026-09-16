# Phase 6 - Authenticated Image API and Export

## Goal

Use the existing Chromium renderer for Studio Download PNG and Copy PNG through
`POST /api/framekit/images/render`, while preserving classic API-key consumers
and one shared request/render pipeline.

## Depends on

- Phase 3 session authentication.
- Phase 4 API-token authentication.
- Phase 5 Studio user experience.
- Phase 5.5's unversioned `/api/framekit` namespace and catch-all adapter.
- The verified `createImageHandler()` and private-render implementation.

## Shared handler design

Do not copy the current image pipeline into a second factory. Extract the
smallest internal composition point that allows authentication to vary while
retaining one implementation of:

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

Preserve:

```ts
createImageHandler(templates)
```

It continues to parse `FRAMEKIT_API_KEY` and authenticate the existing shared
Bearer secret exactly as before.

Add:

```ts
createStudioImageHandler(templates)
```

It parses render settings without requiring `FRAMEKIT_API_KEY`, then accepts an
API token or Studio session. Refactor configuration so the reusable render
settings parser is internal while the existing public `parseImageApiConfig()`
and `ImageApiConfig` contract remain compatible.

## Authentication order

For the Studio handler:

1. Load and validate database/render configuration.
2. If `Authorization` exists, validate only its Bearer API token.
3. Otherwise validate the session cookie and same-origin `Origin` header.
4. Return `401` before reading the body when authentication fails.
5. Continue through the existing pipeline only after authentication succeeds.

An invalid Authorization header must not fall back to an ambient browser
session. Update `last_used_at` when API-token authentication succeeds.

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

## Removing browser capture

Only after the server-backed integration tests pass:

- remove DOM capture, cloning, `document.fonts.ready`, and data-URL conversion;
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

- classic `createImageHandler()` still requires and accepts `FRAMEKIT_API_KEY`;
- Studio handler succeeds with a valid API token;
- Studio handler succeeds with a valid same-origin session;
- Studio handler accepts the same-origin session through the verified HTTPS
  reverse-proxy topology;
- invalid Bearer does not fall back to a valid session;
- revoked token, inactive user, expired session, and cross-origin session fail
  before body/template/browser work;
- both factories call one shared parse/resolve/render implementation;
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
endpoint, the classic handler remains compatible, all image work still flows
through one pipeline, browser capture code and dependency are gone, and the
private renderer's security contract is unchanged.
