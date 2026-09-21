---
title: Studio root package API
description: Add the server-side document shell and optional-auth Studio page factories.
sidebar:
  order: 7
---

**Import:** `@mauriciodmo/framekit/studio/root`  
**Environment:** server-only.

This entrypoint exports `FrameKitStudioRoot`, `createStudioPage`, and `createLoginPage`. The root component reads request cookies and headers, emits the complete document shell, and provides Studio locale context. The page factories apply the Studio session boundary only when `FRAMEKIT_AUTH_ENABLED=true`; open mode leaves `/editor` and `/brand` available and hides `/settings`.

## Minimal example

Use `FrameKitStudioRoot` as the document shell in a server layout:

```tsx
import { FrameKitStudioRoot } from '@mauriciodmo/framekit/studio/root'

export default function RootLayout ({ children }: { children: React.ReactNode }) {
  return <FrameKitStudioRoot>{children}</FrameKitStudioRoot>
}
```

Use `createStudioPage(StudioClient)` for `/editor`, `/brand`, and `/settings`, and `createLoginPage()` for `/login`. In authenticated mode, the client component passed to `createStudioPage` receives the safe `StudioUser` value; in open mode it receives no user for `/editor` and `/brand`.

## Bundle and runtime constraints

This entrypoint is server-only. `FrameKitStudioRoot` uses Next.js request APIs, emits `<html>`, `<head>`, and `<body>`, and must not be imported into client code or nested inside another document shell. The route modules should use the Node.js runtime and dynamic rendering.

See [the existing-project route setup](/en/users/getting-started/existing-project), [Use Studio](/en/users/guides/use-studio), and the [Studio API](/en/users/reference/package-api/studio).
