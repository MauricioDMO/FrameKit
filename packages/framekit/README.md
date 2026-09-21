<div align="center">
  <img src="https://framekit.mauriciodmo.com/favicon.svg" alt="FrameKit logo" width="64" />
  <h1>@mauriciodmo/framekit</h1>
  <p><strong>The runtime for branded images as React components.</strong></p>
  <p>Define templates in code, edit their content in Studio, and render PNGs from the browser or an API.</p>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/@mauriciodmo/framekit"><img src="https://img.shields.io/npm/v/%40mauriciodmo%2Fframekit?logo=npm" alt="npm version" /></a>
  <a href="https://github.com/MauricioDMO/FrameKit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/%40mauriciodmo%2Fframekit" alt="license" /></a>
  <a href="https://github.com/MauricioDMO/FrameKit"><img src="https://img.shields.io/github/stars/MauricioDMO/FrameKit?style=flat" alt="GitHub stars" /></a>
</p>

Use FrameKit when the visual style should live in reusable components instead of
being recreated with a prompt for every image. This package provides the typed
template contract, field definitions, validation, Studio/editor building
blocks, CLI, and server-side rendering APIs for React and Next.js.

If you are starting a new project, use
[`@mauriciodmo/create-framekit`](https://www.npmjs.com/package/@mauriciodmo/create-framekit)
instead.

## Install

```bash
pnpm add @mauriciodmo/framekit
```

The package supports Node.js `>=22.13.0`, React `>=19 <20`, and Next.js
`>=16 <17`. npm is supported as well.

## A template is a component

```tsx
import { defineTemplate, field } from '@mauriciodmo/framekit'

export default defineTemplate({
  meta: { title: 'Launch card' },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({ label: 'Title', required: true }),
  },
  content: {
    default: { title: 'Build once. Publish often.' },
  },
  variants: { default: 'default' },
  render({ data, width, height }) {
    return (
      <article className="flex items-center justify-center bg-[#10271f] p-16 text-center text-6xl text-white" style={{ width, height }}>
        {data.title}
      </article>
    )
  },
})
```

The [first template guide](https://framekit.mauriciodmo.com/en/users/getting-started/first-template)
covers discovery, validation, variants, and Studio.

## Public entry points

| Import | Use it for |
| --- | --- |
| `@mauriciodmo/framekit` | `defineTemplate`, fields, Markdown, validation, and data resolution |
| `@mauriciodmo/framekit/editor` | Reusable editor and navigation components |
| `@mauriciodmo/framekit/studio` | The complete Studio interface |
| `@mauriciodmo/framekit/studio/root` | The Studio root and shell |
| `@mauriciodmo/framekit/client` | Client-side render components |
| `@mauriciodmo/framekit/server` | Optional-auth image API and server rendering |
| `@mauriciodmo/framekit/dev` | Development server integration |
| `@mauriciodmo/framekit/styles.css` | Shared Studio/editor styles |

## CLI scripts

Add the FrameKit commands to a Next.js project:

```json
{
  "scripts": {
    "dev": "framekit dev",
    "check": "framekit check",
    "build": "framekit build",
    "start": "framekit start"
  }
}
```

The CLI discovers `src/templates/**/template.tsx`, validates definitions, and
generates the template registry. Install Chromium explicitly before server-side
rendering with `framekit browser install`.

The generated Studio and image API use open mode by default. Set
`FRAMEKIT_AUTH_ENABLED=true` to enable users, sessions, API tokens, and protected
access routes. Before exposing production to an untrusted network, set that
variable explicitly; no `NODE_ENV`, credential, or SQLite fallback enables auth.

## Documentation

- [Package API reference](https://framekit.mauriciodmo.com/en/users/reference/package-api/)
- [Template authoring guide](https://framekit.mauriciodmo.com/en/users/guides/create-template)
- [FrameKit CLI reference](https://framekit.mauriciodmo.com/en/users/reference/cli/framekit)
- [Render images with the API](https://framekit.mauriciodmo.com/en/users/guides/render-images-with-the-api)
- [Deployment guide](https://framekit.mauriciodmo.com/en/users/deployment)
- [Repository README](https://github.com/MauricioDMO/FrameKit)
