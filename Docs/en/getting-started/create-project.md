# Create a Project

## Alpha release

FrameKit is currently in alpha/prerelease status. The packages are not yet published to npm. This documentation will be updated once publication is confirmed.

## Prerequisites

- Node.js 20.9.0 or later.
- pnpm 11.14.0 or later, **or** npm 10.x or later.

## Create the project

Once `@mauriciodmo/create-framekit` is published to npm, run:

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
```

The creator is interactive. If you do not provide a project name as an argument, it asks for one. It detects which package manager you are using (`pnpm` or `npm`) from your environment; if it cannot detect it, it asks you to choose. It then asks:

- Whether to install dependencies (default: yes).
- If you are using **pnpm** and chose to install dependencies: whether to run `pnpm approve-builds` to approve build scripts interactively (default: yes).
- Whether to initialize a Git repository with an initial commit (default: yes).

After copying the template, if you chose to install dependencies the creator runs `pnpm install` (or `npm install`) and then `pnpm framekit generate` (or `npm exec -- framekit generate`). If either step fails, the partially-created project directory is preserved so you can diagnose the issue.

## Start development

Navigate to the project directory and start the development server:

```bash
cd my-project
pnpm dev
```

Studio opens at [http://localhost:3000](http://localhost:3000). The root path `/` redirects to `/editor`.

The generated project includes one bilingual example template visible immediately in the editor.

## Validate and build

Use the following commands to work with the project:

- `pnpm check` — regenerates the template catalog and validates all definitions and locales.
- `pnpm build` — creates a production-optimized build.
- `pnpm start` — starts the production server.

The generated project does not include `test`, `lint`, or `typecheck` scripts.

## Warnings

- `pnpm dlx` only works after `@mauriciodmo/create-framekit` and `@mauriciodmo/framekit` are published to npm.

---

[Español](./../../es/getting-started/create-project.md)
