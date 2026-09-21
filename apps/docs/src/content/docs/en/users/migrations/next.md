---
title: Current contract migration
description: Checklist for updating templates, generated output, persistence, access, and server-side export to the current FrameKit contract.
sidebar:
  order: 3
---

Use this checklist for an existing project. It describes the contract implemented by the current package and generated template; it does not choose a release version.

## Template contract

- Update each template to the canonical definition with `meta`, positive integer `width` and `height`, `fields`, `content`, `variants`, and `render`.
- Ensure `meta.title` is non-empty. Optional metadata is limited to `description`, `marketingDescription`, and `tags`.
- Make `variants.default` name a content entry. Keep `variants.labels` optional and keyed by existing content entries.
- Keep content entries as field-value records. The selected `variant` and the resolved `data` are passed to `render` together with `assets`, `width`, and `height`.

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Promotion card' },
  width: 1200,
  height: 630,
  fields: { title: field.text({ label: 'Title' }) },
  content: { square: { title: 'Hello' } },
  variants: { default: 'square', labels: { square: 'Square' } },
  render ({ data, width, height }) {
    return <article style={{ width, height }}>{data.title}</article>
  }
})
```

## Fields and variants

- Use the singular public `field` namespace for `text`, `number`, `boolean`, `choice`, `color`, and `image`.
- Keep number defaults and values as finite numbers, boolean values as booleans, choice values within their declared options, and color values in the validated hexadecimal form.
- Give number fields a finite numeric `defaultValue`; use finite `min`, `max`, and positive `step` values when needed.
- Treat variant keys as template-owned strings. They are independent of the Studio interface locale.
- After changing definitions or content, regenerate the project registry and validate every content variant before building.

See [template fields](/en/users/concepts/templates/fields) and [content and variants](/en/users/concepts/templates/content-and-variants) for the current field and resolution rules.

## Generated registry

- Run generation after changing templates, template assets, or brand components.
- Consume the generated `templates` array and its `TemplateRegistryEntry` values. Each entry includes validated metadata, dimensions, variants, `variantKeys`, assets, and a lazy `load` function.
- Keep generated registries and client bindings under `src/generated/framekit/` disposable. Generated asset copies live under `public/framekit/`.

See [generated files](/en/users/reference/generated-files) for the output map and authoring boundary.

## Editor persistence v2

The editor stores overrides in browser `localStorage` under `framekit:<slug>:v2`. A stored state contains the selected variant and field data grouped by variant. Keep persisted field values aligned with the current definition: the loader drops unknown fields and variants, wrongly typed values, number values that fail their declared constraints, and choice values no longer in the options; string values for text, color, and image fields remain strings for normal data validation. A persisted selected variant must be one of the definition's content keys; otherwise the stored state is ignored.

## Optional authentication and SQLite access

- Set `FRAMEKIT_AUTH_ENABLED=false` or leave it unset for open mode. In this mode `/editor` and `/brand` work without login, `/login` redirects to `/editor`, `/settings` and access routes are absent, and the image endpoint needs no credential while keeping renderer defenses.
- Set `FRAMEKIT_AUTH_ENABLED=true` to enable users, sessions, API tokens, protected Studio, and access routes. Only in this mode set `FRAMEKIT_DATABASE_PATH` when the database must live outside the default `.framekit-data/framekit.sqlite` location.
- Keep the database path on persistent storage for authenticated deployments. The access database is initialized lazily, uses SQLite WAL mode, and contains the current users, sessions, and API-token tables.
- The current schema is migration version `1`. A database with a newer schema version is rejected rather than rewritten.
- Keep the application on the Node.js runtime for access and server rendering. Render jobs remain process-local and are not stored in SQLite.

`FRAMEKIT_ADMIN_PASSWORD` and `FRAMEKIT_ADMIN_USERNAME` bootstrap the first
administrator only when auth is enabled. Open mode does not create an anonymous
administrator or initialize SQLite. Switching from `true` back to `false` does
not delete stored users, sessions, or tokens.

See [configuration](/en/users/reference/configuration) and [Docker and persistence](/en/users/deployment/docker-and-persistence).

## Access tokens when auth is enabled

Use the current Studio settings or access API to create named API tokens. The full token secret is returned once when it is created; later listings expose metadata and the visible prefix rather than the secret. Store the secret in the calling service's runtime secret store and send it as a Bearer credential when using the server image endpoint.

## Server-side export

- Use the generated server route with `createFrameKitApiHandler` from `@mauriciodmo/framekit/server` on the Node.js runtime.
- The canonical image action is `POST /api/framekit/images/render`; it returns PNG output for a valid template, variant, and field data request.
- Install the Chromium runtime required by the renderer before serving image requests. The generated Dockerfile performs the browser installation during the image build.
- Keep the generated private render page and `RenderClient` binding in the current generated-project shape; regenerate bindings rather than editing generated files.

For the integration shape, see [integrate an existing Next.js project](/en/users/getting-started/existing-project), [image render API](/en/users/reference/http-api/image-render), and [Docker and persistence](/en/users/deployment/docker-and-persistence).
