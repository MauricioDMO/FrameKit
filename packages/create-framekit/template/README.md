<div align="center">
  <img src="https://framekit.mauriciodmo.com/favicon.svg" alt="FrameKit logo" width="64" />
  <h1>FrameKit Project</h1>
  <p><strong>Build your visual system with code, then edit it in Studio.</strong></p>
</div>

## Start here

```bash
pnpm dev
```

Open `http://localhost:3000` and choose a template in Studio. The generated
project starts in open mode: `/editor` and `/brand` need no login, and `/login`
redirects to `/editor`. Set `FRAMEKIT_AUTH_ENABLED=true` to require users,
sessions, and API tokens; only then use the bootstrap variables in `.env`.
Before exposing the project to an untrusted network, explicitly enable auth.
If dependencies were not installed when the project was created, run `pnpm install` first.

## Where to work

- `src/templates/` contains the discoverable image templates. A directory with a default-exporting `template.tsx` appears automatically in Studio.
- `src/brand/` contains reusable brand components shared by multiple templates.
- `src/profile.ts` contains project information that templates may use.
- `public/assets/` contains project-wide public assets.

The [project structure guide](https://framekit.mauriciodmo.com/en/users/getting-started/project-structure)
explains the generated project in more detail.

## Typical workflow

1. Edit or add a template under `src/templates/`.
2. Run `pnpm framekit check` to validate the definition.
3. Run `pnpm dev` and review the result in Studio.
4. Use `pnpm build` and `pnpm start` for a production build.

The [first template guide](https://framekit.mauriciodmo.com/en/users/getting-started/first-template)
covers the authoring contract, while the [template guide](https://framekit.mauriciodmo.com/en/users/guides/create-template)
covers fields, variants, and assets.

## Production and automation

The generated project includes a server-side PNG route at
`POST /api/framekit/images/render`. In open mode it is credential-free and still
keeps the renderer's request, image, browser, and cleanup defenses. With
`FRAMEKIT_AUTH_ENABLED=true`, use an API token or same-origin Studio session.
See [render images with the API](https://framekit.mauriciodmo.com/en/users/guides/render-images-with-the-api)
for both modes, tokens, requests, and runtime requirements.

For browser installation, persistence, environment variables, Docker, and
reverse proxies, follow the [deployment documentation](https://framekit.mauriciodmo.com/en/users/deployment).

## Commands

- `pnpm dev`: start Studio in development mode
- `pnpm framekit generate`: regenerate the template registry explicitly
- `pnpm framekit check`: validate all templates
- `pnpm build`: build for production
- `pnpm start`: start the production server

Read the [full FrameKit documentation](https://framekit.mauriciodmo.com/en/)
when you need the complete reference.
