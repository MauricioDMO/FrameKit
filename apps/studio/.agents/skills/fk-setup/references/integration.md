# Existing Next.js Integration

Install:

```bash
pnpm add @mauriciodmo/framekit
```

Configure `next.config.ts`:

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  distDir: '.framekit/next',
  output: 'standalone',
}

export default nextConfig
```

Add the generated-file alias to `tsconfig.json` without replacing existing aliases:

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

Import the stylesheet in global CSS:

```css
@import "@mauriciodmo/framekit/styles.css";
```

Keep the root layout a server component and use the Studio document shell:

```tsx
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <FrameKitStudioRoot>{children}</FrameKitStudioRoot>
}
```

Create `src/app/editor/[[...slug]]/page.tsx` as a client component:

```tsx
'use client'

import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { templates } from '@framekit/generated/templates'

export default function EditorPage() {
  return <FrameKitStudio templates={templates} />
}
```

Redirect `src/app/page.tsx`:

```tsx
import { redirect } from 'next/navigation'

export default function HomePage() {
  redirect('/editor')
}
```

The generated integration is open by default. With `FRAMEKIT_AUTH_ENABLED`
missing or `false`, `/editor` and `/brand` do not require login, `/login`
redirects to `/editor`, `/settings` and the access API are not found, and image
rendering does not require credentials while retaining renderer defenses. Do not
make login a prerequisite for the default editor flow.

Before exposing production to an untrusted network, set
`FRAMEKIT_AUTH_ENABLED=true` explicitly. That enables users, sessions, API
tokens, and protected Studio/access routes; set `FRAMEKIT_ADMIN_PASSWORD` only
for this mode when bootstrapping the first administrator. Any configured value
must be exactly `true` or `false`. `NODE_ENV`, credentials, and SQLite do not
enable authentication.

Run `pnpm framekit generate`. It writes the source-side registry to
`src/generated/framekit/templates.ts`; its entries contain `slug`, `segments`,
validated metadata, dimensions, variants, declaration-ordered variant keys,
assets, and lazy `load` functions. Generation, `framekit dev`, `framekit check`,
and `framekit build` recreate it; `framekit start` does not. This registry is separate from
`.framekit/next/`, which is Next.js build output.
