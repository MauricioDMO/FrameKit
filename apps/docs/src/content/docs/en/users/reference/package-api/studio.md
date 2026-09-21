---
title: Studio package API
description: Render the client-side FrameKit Studio surface with generated registries.
sidebar:
  order: 6
---

**Import:** `@mauriciodmo/framekit/studio`  
**Environment:** client.

This entrypoint exports `FrameKitStudio`, `frameKitMessages`, and `getFrameKitLocale`, plus the Studio brand, section, user, locale, and message types. `FrameKitStudio` accepts a generated template catalog, a brand catalog, or both; at least one catalog is required.

## Minimal example

```tsx
'use client'

import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { templates } from '@framekit/generated/templates'

export function Studio () {
  return <FrameKitStudio templates={templates} />
}
```

The generated project also supplies `brands` and a client binding for Studio
pages. Authentication of those pages is controlled by `FRAMEKIT_AUTH_ENABLED`;
Studio chooses the template's default content variant, and its interface locale
is independent of template variant keys.

## Bundle and runtime constraints

`FrameKitStudio` is a client component and depends on Next.js client navigation and browser state. Use it behind a client boundary. The route and document shell belong to the [Studio root API](/en/users/reference/package-api/studio-root), while optional access and image requests belong to the [server API](/en/users/reference/package-api/server).

See [Use Studio](/en/users/guides/use-studio) and the [Studio concept](/en/users/concepts/studio).
