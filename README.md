<div align="center">
  <img src="https://framekit.mauriciodmo.com/favicon.svg" alt="FrameKit logo" width="72" />
  <h1>FrameKit</h1>
  <p><strong>Build branded images as React components.</strong></p>
  <p>Turn your visual system into reusable code, edit content in Studio, and render every variation on demand.</p>
  <p>
    <a href="https://framekit.mauriciodmo.com/en/users/getting-started/create-project">Create a project</a>
    ·
    <a href="https://framekit.mauriciodmo.com/en/">Read the documentation</a>
    ·
    <a href="https://github.com/MauricioDMO/FrameKit">View on GitHub</a>
  </p>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/@mauriciodmo/framekit"><img src="https://img.shields.io/npm/v/%40mauriciodmo%2Fframekit?logo=npm&label=framekit" alt="framekit on npm" /></a>
  <a href="https://www.npmjs.com/package/@mauriciodmo/create-framekit"><img src="https://img.shields.io/npm/v/%40mauriciodmo%2Fcreate-framekit?logo=npm&label=create-framekit" alt="create-framekit on npm" /></a>
  <a href="https://github.com/MauricioDMO/FrameKit/blob/main/LICENSE"><img src="https://img.shields.io/github/license/MauricioDMO/FrameKit" alt="Apache 2.0 license" /></a>
  <img src="https://img.shields.io/badge/status-beta-f2c94c" alt="beta status" />
</p>

FrameKit is for developers who need to create many images that still look like
the same brand. Instead of asking a diffusion model to reinterpret your style
for every prompt, define the visual language once with React components and
change only the content that should vary.

## Why FrameKit

- **Components, not prompts.** Keep layout, typography, colors, assets, and export dimensions in code.
- **A focused editing workflow.** Give content teams editable fields and variants in FrameKit Studio while keeping brand constraints in the template.
- **Automation-ready output.** Export PNGs in Studio or render them through the server API for campaigns, catalogs, previews, and other workflows.

## Create a project

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
cd my-project
pnpm dev
```

Open `http://localhost:3000` and start editing the included template. New
projects use open mode by default: `/editor` and `/brand` work without login,
and `/login` redirects to `/editor`. To enable users, sessions, and protected
access, set `FRAMEKIT_AUTH_ENABLED=true` and provide the bootstrap password
before the first login. The [create a project guide](https://framekit.mauriciodmo.com/en/users/getting-started/create-project)
covers both modes and the available CLI options.

Before exposing a production project to an untrusted network, explicitly set
`FRAMEKIT_AUTH_ENABLED=true`. Do not rely on `NODE_ENV`, credentials, or SQLite
to enable authentication.

## A template is just React

Define the editable contract once. FrameKit discovers the file, validates its
data, and renders the same component in Studio and through the image API.

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

See [Create your first template](https://framekit.mauriciodmo.com/en/users/getting-started/first-template)
for the complete workflow.

## Studio

Browse templates, edit fields, switch variants, preview the final composition,
and export a PNG without rebuilding the design by hand.

![FrameKit Studio](Docs/img/studio.webp)

## Explore the workflow

- [Use Studio](https://framekit.mauriciodmo.com/en/users/guides/use-studio) to edit and export templates.
- [Create templates](https://framekit.mauriciodmo.com/en/users/guides/create-template) with fields, variants, and assets.
- [Render images with the API](https://framekit.mauriciodmo.com/en/users/guides/render-images-with-the-api) for automated workflows.
- [Deploy a project](https://framekit.mauriciodmo.com/en/users/deployment) with the required runtime and persistence setup.
- [Read the contributor guide](https://framekit.mauriciodmo.com/en/contributors) if you want to work on FrameKit itself.

## Compatibility

FrameKit targets Node.js `>=22.13.0`, React `>=19 <20`, and Next.js `>=16 <17`.
See the [full compatibility and CLI reference](https://framekit.mauriciodmo.com/en/users/reference/cli/)
for supported commands and versions.

## Packages

- [`@mauriciodmo/framekit`](packages/framekit/README.md): template contract, Studio components, CLI, and server rendering APIs.
- [`@mauriciodmo/create-framekit`](packages/create-framekit/README.md): project scaffolding with a ready-to-run Next.js template.

## More

- [English documentation](https://framekit.mauriciodmo.com/en/)
- [Spanish documentation](https://framekit.mauriciodmo.com/es/)
- [License](LICENSE)

For repository development, see the [local development guide](https://framekit.mauriciodmo.com/en/contributors/getting-started/local-development).
