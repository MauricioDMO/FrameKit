# @mauriciodmo/framekit

FrameKit provides the typed template contract, data resolution, validation,
Markdown rendering, and reusable editor components for React and Next.js. The
reusable Studio includes authenticated `/login`, `/editor`, `/brand`, and
`/settings` access with a safe `StudioUser` handoff and account, token, and
administrator workflows. Studio Download/Copy remains browser-based PNG export
until Phase 6 server-backed export. The server-only
`@mauriciodmo/framekit/server` facade exposes configuration and authentication
helpers, the `createStudioAccessHandler` session and token/user management
handler, the `createImageHandler` PNG API, image preparation and rendering,
temporary render jobs, and the private `createRenderPage` handoff used by
production rendering.

## Compatibility

- Node.js `>=22.13.0`
- pnpm `>=11.14.0` when using pnpm
- npm is supported; the package manifest declares no npm engine version

## CLI

FrameKit uses the current directory as the application root:

```json
{
  "scripts": {
    "dev": "framekit dev",
    "build": "framekit build",
    "start": "framekit start",
    "check": "framekit check"
  }
}
```

`generate` discovers `src/templates/**/template.tsx`, validates each definition,
scans its `assets` directory, and writes `src/generated/framekit/templates.ts`.
The generated module exports only `templates: TemplateRegistryEntry[]`, with
validated metadata, dimensions, variants, variant keys, assets, and lazy loaders.
`dev`, `check`, and `build` generate automatically; `start` uses existing build
output and does not generate. Production uses Next.js standalone output under
`.framekit/next`.

### Browser installation

Browser installation is explicit and uses FrameKit's pinned `playwright-core`
dependency:

```sh
framekit browser install
framekit browser install --with-deps
```

Both commands install only Chromium's headless shell. `--with-deps` also asks
Playwright to install system dependencies and may require root or equivalent
system-package privileges on Linux. `PLAYWRIGHT_BROWSERS_PATH` is honored by
the installer and the server runtime. Normal package installation and
`generate`, `check`, `dev`, `build`, and `start` do not download browser
binaries.

## Inline templates

Use `defineTemplate` when the definition and renderer belong in one file. The
`render` callback infers `data` and `variant` from the fields and content keys:

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: {
    title: 'Offer card',
    description: 'A card for presenting a product offer',
    marketingDescription: 'Highlight the offer and motivate a purchase',
    tags: ['social', 'promotion'],
  },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Title', required: true }),
  },
  content: {
    square: { title: 'Offer' },
  },
  variants: { default: 'square', labels: { square: 'Square' } },
  render({ data, variant, width, height }) {
    return <article style={{ width, height }}>{data.title} ({variant})</article>
  },
})
```

Each template owns its variant keys through `content`; keys are arbitrary
strings and do not have to be locales. FrameKit does not limit or import the
application's interface language, and no locale field is required. Content
entries contain only declared field values, and unknown keys are rejected.

Variant field values can be omitted. Resolution applies field defaults, variant
content, and user edits in that order. Call `validateTemplateData()` on the
resolved data to validate required values and other runtime constraints; for
choice fields, undeclared values produce `invalid_choice`. When loading
persisted editor state, stale choice overrides are filtered before resolution,
so the variant content or field default remains in effect.

## Extracted artwork

For larger templates, keep the definition and component separate. Define the
contract with `defineTemplateBase`, then type the component with
`TemplateRenderProps<typeof templateBase>`:

```tsx
// definition.ts
import { defineTemplateBase, field } from '@mauriciodmo/framekit'

export const templateBase = defineTemplateBase({
  meta: {
    title: 'Extracted offer',
    description: 'A reusable offer-card definition',
    marketingDescription: 'Make the offer and next action clear',
    tags: ['promotion'],
  },
  width: 1200,
  height: 800,
  fields: { title: field.text({ label: 'Title' }) },
  content: { square: { title: 'Offer' } },
  variants: { default: 'square', labels: { square: 'Square' } },
})
```

```tsx
// artwork.tsx
import type { TemplateRenderProps } from '@mauriciodmo/framekit'
import type { templateBase } from './definition'

export function Artwork({ data, width, height }: TemplateRenderProps<typeof templateBase>) {
  return <article style={{ width, height }}>{data.title}</article>
}
```

```tsx
// template.tsx
import { defineTemplate } from '@mauriciodmo/framekit'
import { Artwork } from './artwork'
import { templateBase } from './definition'

export default defineTemplate({ ...templateBase, render: Artwork })
```

Only `template.tsx` is discovered by the registry scanner. Neighboring modules,
components, and assets remain private to that template directory.

Use `field.choice()` for ordered closed-set string selects. Its `defaultValue`
must match an option; definition validation rejects mismatches, while
`validateTemplateData()` reports undeclared values as `invalid_choice`. Use
`field.boolean()` for real boolean values; its omitted default is `false` and
Studio renders a native checkbox. Use `field.image()` for images. Variant files use the field key as their
filename under `assets/<variant>`; shared files live under `assets/common`.
Images under `public/assets` can be referenced with a root-relative
`defaultValue` such as `/assets/logos/brand.svg`. Studio can replace template
images through `framekit dev`; public files remain application assets.

## Public entry points

```tsx
import { defineTemplate, field, Markdown } from '@mauriciodmo/framekit'
import { FrameKitEditor, FrameKitNavigation } from '@mauriciodmo/framekit/editor'
import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'
import { createRenderClient } from '@mauriciodmo/framekit/client'
import { createDevServer } from '@mauriciodmo/framekit/dev'
import { authenticateBearer, createImageHandler, createStudioAccessHandler, ImageRenderError, parseImageApiConfig, prepareRenderInputs, renderTemplateImage } from '@mauriciodmo/framekit/server'
import '@mauriciodmo/framekit/styles.css'
```

For the private render page, call `createRenderClient(templates)` in a
consumer-local `'use client'` adapter. The factory closes over the generated
registry and returns the client render component:

```tsx
'use client'

import { createRenderClient } from '@mauriciodmo/framekit/client'
import { templates } from '@framekit/generated/templates'

export const RenderClient = createRenderClient(templates)
```

The server-only `./server` facade exposes configuration and authentication
helpers, `createStudioAccessHandler`, `createImageHandler`,
`prepareRenderInputs`, `renderTemplateImage`, temporary render jobs, and the
private `createRenderPage` handoff. It also exports the type-only
`ApiTokenMetadata` and `CreatedApiToken` contracts. Keep the `./dev` and
`./server` entry points out of browser/client imports.

### Studio access

`createStudioAccessHandler(): (request: Request) => Promise<Response>` returns a
Node.js handler for these session, account, token, and user routes:

```text
POST  /api/framekit/login                 POST  /api/framekit/logout
GET/PATCH /api/framekit/account            POST  /api/framekit/account/password
GET/POST /api/framekit/tokens              DELETE /api/framekit/tokens/:id
GET/POST /api/framekit/users               PATCH/DELETE /api/framekit/users/:id
POST  /api/framekit/users/:id/password     GET  /api/framekit/users/:id/tokens
```

Mount it from a server-only route and expose the methods above. Login sets the
`framekit_session` cookie. Authenticated users manage their own account and
tokens; administrators also manage users, inspect any user's token metadata,
and revoke any token. Login, account, and user creation/update responses expose
only the safe `StudioUser` fields `id`, `username`, and `role`; administrator
user lists additionally expose `active`, `createdAt`, and `updatedAt`. No
response exposes password hashes, session secrets, token hashes, or previously
returned token secrets. A created token's full secret is returned once, in the
`201` response; later metadata responses contain only safe metadata, and storage
contains only that metadata and the token hash. API-token Bearer lookup accepts a
bounded, non-empty credential, hashes it, requires an unrevoked token with an
active owner, and updates `lastUsedAt`. The generated-token `fk_` prefix is not
required, so imported legacy credentials can be used. A legacy non-empty
`FRAMEKIT_API_KEY` is imported only during first-user bootstrap and is not
synchronized afterward.

Session-protected account, token, and user-management operations return `401`
for missing or invalid sessions; invalid login credentials also return `401`.
Logout is idempotent and returns `200` while expiring the cookie. Role,
ownership, or cross-origin unsafe-request failures return `403`; unknown or
inaccessible targets return `404`; unsupported methods return `405`; duplicate
usernames and last-active-administrator conflicts return `409`. Unsafe requests
require a same-origin `Origin` header.

`POST /api/v1/images` continues to use `FRAMEKIT_API_KEY`, and Download PNG and
Copy PNG continue to use the current browser exporter. The authenticated Studio
access UI is implemented; authenticated image API migration and server-backed
Download/Copy remain pending for Phase 6.

### Server image API

The generated consumer template exposes a Node.js-only `POST /api/v1/images`
route backed by `createImageHandler(templates)`. Send JSON with the generated
template slug, an optional variant, and optional field data:

```json
{
  "template": "example",
  "variant": "en",
  "data": {}
}
```

Authenticate with `Authorization: Bearer <FRAMEKIT_API_KEY>`. A successful
request returns `200` with `image/png`; failures return stable JSON errors.
Configure `FRAMEKIT_API_KEY` and `FRAMEKIT_INTERNAL_ORIGIN` at runtime. The
optional `FRAMEKIT_ALLOWED_IMAGE_HOSTS`, `FRAMEKIT_MAX_CONCURRENT_RENDERS`,
and `FRAMEKIT_RENDER_TIMEOUT_MS` settings control remote images and render
limits. Install the headless shell before serving this route.

The generated template also includes the canonical `Dockerfile`,
`.dockerignore`, and `.env.example`. The repository smoke checks inspect these
deployment files but do not perform a live Docker build or browser download.

### Published color palette

After importing `@mauriciodmo/framekit/styles.css`, consumers may override the
compact numeric palette used by the reusable Studio/editor chrome:

```text
--color-fk-forest-100 ... --color-fk-forest-400
--color-fk-mint-100 ... --color-fk-mint-300
--color-fk-sage-100 ... --color-fk-sage-400
--color-fk-ivory-100 ... --color-fk-ivory-400
```

The corresponding Tailwind utilities are named `bg-fk-forest-300`,
`text-fk-sage-400`, and so on. Override a palette value after the stylesheet
import, for example:

```css
:root {
  --color-fk-forest-300: #245c48;
}
```

The palette is intentionally shared across surfaces, text, actions, focus, and
states. There are no supported component-specific variables for buttons,
loading indicators, toggles, or pickers.

The root entry also exports the public validators, resolvers, field descriptors,
structured validation errors, and the exact `TemplateMeta` type. Metadata
requires a non-empty `title`; only `description`, `marketingDescription`, and
`tags` are optional additions. There is no slug fallback for missing metadata.

`FrameKitStudioRoot` and `FrameKitStudio` provide the complete editor interface,
including navigation, variant and theme controls. Pass the generated `templates`
array to `FrameKitStudio` from a client page under `/editor`.

## Full documentation

- [Documentation](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/README.md)
- [Documentación](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/es/README.md)
- [Template Authoring Guide](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/guides/template-authoring.md)
- [CLI Reference](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/reference/cli.md)
- [Public API Reference](https://github.com/MauricioDMO/FrameKit/blob/main/Docs/en/reference/public-api.md)
