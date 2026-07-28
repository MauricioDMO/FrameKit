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

Run `pnpm framekit generate`. It writes `src/generated/framekit/templates.ts`; generation and `framekit dev` recreate it. The `.framekit/` directory is also disposable.
