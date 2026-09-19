---
title: Integrar un proyecto existente de Next.js
description: Añade FrameKit a una aplicación Next.js existente mediante los puntos de entrada públicos compatibles.
sidebar:
  order: 3
---

FrameKit se puede añadir a un proyecto existente de Next.js con App Router. La integración necesita el mismo registro generado y las mismas rutas de servidor que la plantilla canónica del proyecto; no reemplaza el resto de tu aplicación.

## Requisitos previos

- Node.js `>=22.13.0`.
- pnpm `>=11.14.0` al usar pnpm. Puedes usar npm con comandos equivalentes.
- Next.js `>=16 <17`.
- React y React DOM `>=19 <20`.

Instala el paquete público:

```bash
pnpm add @mauriciodmo/framekit
```

## Configura Next.js

Envuelve tu configuración existente con el punto de entrada público `next`:

```ts
import { withFrameKit } from '@mauriciodmo/framekit/next'

export default withFrameKit()
```

`withFrameKit()` establece `output: 'standalone'`, establece `distDir: '.framekit/next'` y añade una redirección temporal de `/` a `/editor`. Puedes pasarle tu otra configuración de Next.js:

```ts
import { withFrameKit } from '@mauriciodmo/framekit/next'

export default withFrameKit({
  reactStrictMode: true,
})
```

No configures un `distDir` ni un `output` diferentes. Si ya tienes una redirección raíz, debe ser la misma redirección temporal a `/editor` para que FrameKit pueda combinarla de forma segura.

## Añade alias y estilos

Añade el alias del registro generado a `tsconfig.json`:

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

En la hoja de estilos global que usa tu layout raíz, importa los estilos de FrameKit. Conserva la importación de Tailwind solo si el proyecto usa Tailwind:

```css
@import "tailwindcss";
@import "@mauriciodmo/framekit/styles.css";
```

## Envuelve el layout raíz

El layout raíz debe seguir siendo un componente de servidor y no debe renderizar un segundo `<html>`, `<head>` ni `<body>` alrededor de `FrameKitStudioRoot`:

```tsx
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'

import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <FrameKitStudioRoot>{children}</FrameKitStudioRoot>
}
```

`FrameKitStudioRoot` emite la estructura del documento, elige el locale a partir de la cookie o de `accept-language`, aplica la clase del tema y proporciona el contexto del locale a Studio.

## Añade las rutas del registro generado

Crea plantillas en `src/templates/` y ejecuta `pnpm framekit generate` antes de importar módulos generados. Después, añade los siguientes archivos de App Router.

### Ruta de Studio

Crea `src/app/[section]/[[...slug]]/page.tsx`:

```tsx
import { createStudioPage } from '@mauriciodmo/framekit/studio/root'
import { StudioClient } from '@framekit/generated/studio-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default createStudioPage(StudioClient)
```

La ruta acepta `editor`, `brand` y `settings`. Las secciones desconocidas devuelven 404. Sin una cookie `framekit_session` válida, las secciones protegidas redirigen a `/login`.

### Ruta de inicio de sesión

Crea `src/app/login/page.tsx`:

```tsx
import { createLoginPage } from '@mauriciodmo/framekit/studio/root'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default createLoginPage()
```

La página de inicio de sesión redirige una sesión existente a `/editor`.

### Ruta de API

Crea `src/app/api/framekit/[...action]/route.ts`:

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

Esta ruta catch-all es el límite del lado del servidor para las operaciones de acceso, Studio e imágenes. Mantenla en el runtime de Node.js.

### Ruta privada de renderizado

Crea `src/app/framekit/render/[id]/page.tsx`:

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

Esta página es un traspaso interno para el renderizado de PNG del lado del servidor. Requiere el token de renderizado proporcionado por la API y no es una URL pública de renderizado.

## Genera y ejecuta

Genera el registro y los clientes generados:

```bash
pnpm framekit generate
```

El comando escribe `src/generated/framekit/templates.ts`, `brands.ts`, `studio-client.tsx` y `render-client.tsx`. Los archivos generados son desechables y no deben editarse manualmente.

Los siguientes comandos también generan automáticamente:

- `pnpm framekit dev` genera antes de iniciar el servidor de desarrollo y supervisa los cambios en las plantillas.
- `pnpm framekit check` genera antes de validar las definiciones de las plantillas y las variantes de contenido.
- `pnpm framekit build` ejecuta la comprobación antes de `next build`.
- `pnpm framekit start` no genera; espera una compilación de producción exitosa.

Inicia el desarrollo con:

```bash
pnpm framekit dev
```

La URL raíz se redirige a `/editor`. Configura `FRAMEKIT_ADMIN_PASSWORD` antes del primer inicio de sesión en una base de datos vacía. La ruta predeterminada de la base de datos es `.framekit-data/framekit.sqlite`; conserva su directorio en un almacenamiento persistente cuando la aplicación se ejecute fuera del desarrollo local.

Cuando la integración funcione, sigue [el recorrido de la primera plantilla](/es/users/getting-started/first-template) y [la guía de estructura del proyecto](/es/users/getting-started/project-structure).
