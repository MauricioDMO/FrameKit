---
title: Integrate an existing Next.js project
description: Add FrameKit to an existing Next.js application using the supported public entrypoints.
sidebar:
  order: 3
---

FrameKit can be added to an existing Next.js App Router project. The integration needs the same generated registry and server routes as the canonical project template; it does not replace the rest of your application.

## Prerequisites

- Node.js `>=22.13.0`.
- pnpm `>=11.14.0` when using pnpm. npm can be used with equivalent commands.
- Next.js `>=16 <17`.
- React and React DOM `>=19 <20`.

Install the public package:

```bash
pnpm add @mauriciodmo/framekit
```

## Configure Next.js

Wrap your existing configuration with the public `next` entrypoint:

```ts
import { withFrameKit } from '@mauriciodmo/framekit/next'

export default withFrameKit()
```

`withFrameKit()` sets `output: 'standalone'`, sets `distDir: '.framekit/next'`, and adds a temporary redirect from `/` to `/editor`. You can pass your other Next.js configuration to it:

```ts
import { withFrameKit } from '@mauriciodmo/framekit/next'

export default withFrameKit({
  reactStrictMode: true,
})
```

Do not configure a different `distDir` or `output`. If you already have a root redirect, it must be the same temporary redirect to `/editor` so FrameKit can merge it safely.

## Add aliases and styles

Add the generated registry alias to `tsconfig.json`:

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

In the global stylesheet used by your root layout, import FrameKit styles. Keep the Tailwind import only if the project uses Tailwind:

```css
@import "tailwindcss";
@import "@mauriciodmo/framekit/styles.css";
```

## Wrap the root layout

The root layout must remain a server component and must not render a second `<html>`, `<head>`, or `<body>` around `FrameKitStudioRoot`:

```tsx
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'

import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <FrameKitStudioRoot>{children}</FrameKitStudioRoot>
}
```

`FrameKitStudioRoot` emits the document shell, chooses the locale from the cookie or `accept-language`, applies the theme class, and provides the locale context to Studio.

## Add the generated registry routes

Create templates under `src/templates/` and run `pnpm framekit generate` before importing generated modules. Then add the following App Router files.

### Studio route

Create `src/app/[section]/[[...slug]]/page.tsx`:

```tsx
import { createStudioPage } from '@mauriciodmo/framekit/studio/root'
import { StudioClient } from '@framekit/generated/studio-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default createStudioPage(StudioClient)
```

The route accepts `editor`, `brand`, and `settings`. Unknown sections return 404. Without a valid `framekit_session` cookie, the protected sections redirect to `/login`.

### Login route

Create `src/app/login/page.tsx`:

```tsx
import { createLoginPage } from '@mauriciodmo/framekit/studio/root'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default createLoginPage()
```

The login page redirects an existing session to `/editor`.

### API route

Create `src/app/api/framekit/[...action]/route.ts`:

```tsx
import { createFrameKitApiHandler } from '@mauriciodmo/framekit/server'
import { templates } from '@framekit/generated/templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const handler = createFrameKitApiHandler(templates)

export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
```

This catch-all route is the server-side boundary for access, Studio, and image operations. Keep it on the Node.js runtime.

### Private render route

Create `src/app/framekit/render/[id]/page.tsx`:

```tsx
import type { Metadata } from 'next'

import { createRenderPage } from '@mauriciodmo/framekit/server'
import { RenderClient } from '@framekit/generated/render-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default createRenderPage(RenderClient)
```

This page is an internal handoff for server-side PNG rendering. It requires the render token supplied by the API and is not a public rendering URL.

## Generate and run

Generate the registry and generated clients:

```bash
pnpm framekit generate
```

The command writes `src/generated/framekit/templates.ts`, `brands.ts`, `studio-client.tsx`, and `render-client.tsx`. The generated files are disposable and must not be edited manually.

The following commands also generate automatically:

- `pnpm framekit dev` generates before starting the development server and watches template changes.
- `pnpm framekit check` generates before validating template definitions and content variants.
- `pnpm framekit build` runs the check before `next build`.
- `pnpm framekit start` does not generate; it expects a successful production build.

Start development with:

```bash
pnpm framekit dev
```

The root URL is redirected to `/editor`. Configure `FRAMEKIT_ADMIN_PASSWORD` before the first login to an empty database. The default database path is `.framekit-data/framekit.sqlite`; keep its directory on persistent storage when the application runs outside local development.

After the integration works, follow [the first-template walkthrough](/en/users/getting-started/first-template) and [the project structure guide](/en/users/getting-started/project-structure).
