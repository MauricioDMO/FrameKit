<div align="center">
  <img src="https://framekit.mauriciodmo.com/favicon.svg" alt="FrameKit logo" width="64" />
  <h1>@mauriciodmo/create-framekit</h1>
  <p><strong>Start building branded images with code.</strong></p>
  <p>Scaffold a ready-to-run Next.js project with FrameKit Studio, an example template, and an image API.</p>
</div>

<p align="center">
  <a href="https://www.npmjs.com/package/@mauriciodmo/create-framekit"><img src="https://img.shields.io/npm/v/%40mauriciodmo%2Fcreate-framekit?logo=npm" alt="npm version" /></a>
  <a href="https://github.com/MauricioDMO/FrameKit/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/%40mauriciodmo%2Fcreate-framekit" alt="license" /></a>
  <a href="https://github.com/MauricioDMO/FrameKit"><img src="https://img.shields.io/github/stars/MauricioDMO/FrameKit?style=flat" alt="GitHub stars" /></a>
</p>

Create a project in seconds, then keep the visual system in React components
instead of rebuilding the brand style with a prompt for every image.

## Create a project

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
cd my-project
pnpm dev
```

Or use npm:

```bash
npx @mauriciodmo/create-framekit my-project
cd my-project
npm run dev
```

Open `http://localhost:3000` to enter Studio. On the first login against an
empty database, set `FRAMEKIT_ADMIN_PASSWORD`; `FRAMEKIT_ADMIN_USERNAME` is
optional and defaults to `admin`.

## What you get

- A Next.js project with the FrameKit runtime already configured.
- FrameKit Studio for editing fields, switching variants, previewing, and exporting PNGs.
- An example template you can replace with your own brand components and visual compositions.
- A server-side `POST /api/framekit/images/render` route for automated PNG generation.
- The standard `dev`, `check`, `build`, and `start` commands.

## Your first edits

- Add or change templates under `src/templates/**/template.tsx`.
- Put reusable visual language in `src/brand/`.
- Keep shared public assets in `public/assets/`.
- Run `pnpm framekit check` to validate templates, then `pnpm dev` to open Studio.

The [project structure guide](https://framekit.mauriciodmo.com/en/users/getting-started/project-structure)
explains where each piece belongs.

## CLI options

The creator can install dependencies, initialize Git, accept or reject prompts
non-interactively, and refresh the official FrameKit skills. See the
[`create-framekit` CLI reference](https://framekit.mauriciodmo.com/en/users/reference/cli/create-framekit)
for `-y`, `-n`, `update-skills`, and recovery options.

To refresh the skills in an existing project:

```bash
pnpm dlx @mauriciodmo/create-framekit update-skills
```

## Next steps

- [Create your first template](https://framekit.mauriciodmo.com/en/users/getting-started/first-template)
- [Use Studio](https://framekit.mauriciodmo.com/en/users/guides/use-studio)
- [Render images with the API](https://framekit.mauriciodmo.com/en/users/guides/render-images-with-the-api)
- [Deploy the generated project](https://framekit.mauriciodmo.com/en/users/deployment)
- [Read the full documentation](https://framekit.mauriciodmo.com/en/)
