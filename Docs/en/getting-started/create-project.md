# Create a Project

## Alpha release

FrameKit is currently in alpha/prerelease status. The packages are not yet published to npm. This documentation will be updated once publication is confirmed.

## Prerequisites

- Node.js 20 or later.
- pnpm 11 or later.

`create-framekit` only works with pnpm. It does not support npm, yarn, or bun.

## Create the project

Once `@mauriciodmo/create-framekit` is published to npm, run:

```bash
pnpm dlx @mauriciodmo/create-framekit my-project
```

The creator requires exactly one argument: the path to a directory that does not already exist. If the directory exists, the command fails with an error and nothing is created.

After copying the template, the creator runs `pnpm install` and `pnpm framekit generate` automatically. If either step fails, the partially-created project directory is preserved so you can diagnose the issue.

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
