---
title: framekit CLI
description: Run generation, validation, development, production, and browser-install commands for a FrameKit project.
sidebar:
  order: 12
---

Run `framekit` from the consumer project root. Every command uses `process.cwd()` as its project root. The executable accepts these commands:

```text
framekit generate
framekit check
framekit dev
framekit build
framekit start
framekit browser install [--with-deps]
```

Standard commands reject extra arguments. The browser command accepts only the optional `--with-deps` flag. The CLI has no `--help` or `--version` command.

## `framekit generate`

Scans `src/templates` and writes the project-local generated modules under `src/generated/framekit/`:

- `templates.ts`
- `brands.ts`
- `studio-client.tsx`
- `render-client.tsx`

It also synchronizes discovered template assets under `public/framekit/templates/`. The command requires at least one discovered template.

```bash
pnpm framekit generate
```

## `framekit check`

Runs `generate` first, then validates every discovered template definition and every declared content variant. It uses a temporary checker under `.framekit/`, removes that temporary directory after the check, and reports structured validation errors. It is not a TypeScript typecheck and does not render PNG output.

```bash
pnpm framekit check
```

## `framekit dev`

Runs `generate` before starting the Next.js development server with Turbopack. It watches paths under `src/templates` and `src/brand` and regenerates the generated modules when they change. It does not require a production build.

```bash
pnpm framekit dev
```

The development server uses `FRAMEKIT_HOST`, then `HOST`, then `localhost` for its hostname, and `PORT` with a default of `3000`.

## `framekit build`

Runs `check` first. When validation succeeds, it runs `next build` and prepares the standalone output under `.framekit/next/`, including the public and Next static assets needed by that server. A separate build is not required before this command.

```bash
pnpm framekit build
```

## `framekit start`

Starts the existing production standalone server. It does not run `generate`, `check`, or `next build`; run `framekit build` successfully first.

```bash
pnpm framekit start
```

The launched standalone server inherits its environment. Next.js reads production `HOSTNAME` and `PORT`; `FRAMEKIT_HOST` and `HOST` are not mapped to `HOSTNAME` by `start`.

## `framekit browser install`

Installs the Chromium headless shell used by server-side rendering. `--with-deps` additionally asks Playwright to install system dependencies, which may require root or equivalent package privileges on Linux.

```bash
pnpm framekit browser install
pnpm framekit browser install --with-deps
```

The command honors `PLAYWRIGHT_BROWSERS_PATH`. The other `framekit` commands do not download browser binaries.

See [create a template](/en/users/guides/create-template), [Use Studio](/en/users/guides/use-studio), [deployment runtime](/en/users/deployment/runtime), and the [server package API](/en/users/reference/package-api/server).
