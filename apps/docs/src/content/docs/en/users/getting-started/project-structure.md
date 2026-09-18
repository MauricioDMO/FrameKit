---
title: Project structure
description: Understand the canonical files, routes, aliases, and generated output in a FrameKit project.
sidebar:
  order: 4
---

`create-framekit` produces a Next.js App Router project. The following paths are maintained source or configuration; generated files are intentionally disposable.

## Canonical layout

```text
my-project/
├── src/
│   ├── app/
│   │   ├── [section]/[[...slug]]/page.tsx
│   │   ├── api/framekit/[...action]/route.ts
│   │   ├── framekit/render/[id]/page.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── login/page.tsx
│   ├── profile.ts
│   ├── templates/
│   │   └── example/
│   │       ├── assets/
│   │       └── template.tsx
│   └── generated/framekit/
│       ├── brands.ts
│       ├── render-client.tsx
│       ├── studio-client.tsx
│       └── templates.ts
├── public/framekit/
├── .framekit/
├── .env.example
├── Dockerfile
├── next.config.ts
├── package.json
├── pnpm-workspace.yaml
└── tsconfig.json
```

The creator removes `pnpm-workspace.yaml` when npm is selected. The six maintained files under `src/app/` are the application shell, the Studio catch-all route, the login route, the API route, the private render route, and the global stylesheet.

## Maintained source

- `src/templates/` contains discoverable templates. A directory with a default-exporting `template.tsx` is registered automatically.
- `src/brand/` is optional and contains reusable brand components when the project needs them.
- `src/profile.ts` is optional public project information that templates may use. Keep only values that are safe to appear in images.
- `src/app/layout.tsx` wraps the application with `FrameKitStudioRoot`.
- `next.config.ts` uses `withFrameKit()` to configure the build output and root redirect.
- `.env.example` documents runtime variables without containing deployment secrets.

## Application routes

The generated App Router files connect the public package exports to the application:

| Path | Responsibility |
| --- | --- |
| `src/app/[section]/[[...slug]]/page.tsx` | Loads the generated Studio client for `/editor`, `/brand`, and `/settings`. `createStudioPage` validates the section and redirects unauthenticated users to `/login`. |
| `src/app/login/page.tsx` | Renders the login flow and redirects an existing session to `/editor`. |
| `src/app/api/framekit/[...action]/route.ts` | Exposes the server-side FrameKit API handler with the Node.js runtime and dynamic requests. |
| `src/app/framekit/render/[id]/page.tsx` | Private server-render handoff used by the image renderer. It is not a public page and is marked `noindex`. |
| `src/app/layout.tsx` | Uses `FrameKitStudioRoot` to emit the document shell, locale provider, theme handling, and FrameKit body styles. |
| `src/app/globals.css` | Imports the public FrameKit stylesheet and the project's CSS framework when one is used. |

The `withFrameKit()` wrapper sets Next.js `output` to `standalone`, writes build output under `.framekit/next`, and adds the temporary redirect from `/` to `/editor`. Do not replace those values with a different `distDir`, `output`, or root redirect.

## TypeScript aliases

The generated template defines these aliases in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@framekit/generated/*": ["./src/generated/framekit/*"]
    }
  }
}
```

Use `@/*` for project source and `@framekit/generated/*` for generated FrameKit modules. Consumer code should import the package through its published entrypoints, such as `@mauriciodmo/framekit`, `@mauriciodmo/framekit/server`, and `@mauriciodmo/framekit/studio/root`; do not import `packages/framekit/src/**`.

## Generated output

These paths are created or replaced by FrameKit commands:

- `src/generated/framekit/` contains the template registry, brand module, Studio client, and render client.
- `public/framekit/` contains copied template assets used by the generated registry.
- `.framekit/next/` contains Next.js build output and the standalone server.
- `.framekit/` also contains temporary validation files during `framekit check`.
- `.framekit-data/` contains the default SQLite database when the project uses the default database path.

The generated project ignores these paths. Delete them if necessary and regenerate them; never edit them to fix a template or route.

Continue with [the first-template walkthrough](/en/users/getting-started/first-template) after locating `src/templates/`.
