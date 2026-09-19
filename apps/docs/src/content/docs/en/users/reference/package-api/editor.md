---
title: Editor package API
description: Use FrameKit's client-side editor and navigation components.
sidebar:
  order: 4
---

**Import:** `@mauriciodmo/framekit/editor`  
**Environment:** client.

The editor entrypoint exports `FrameKitEditor`, `TemplateCanvas`, `FrameKitNavigation`, `humanizeSegment`, and `manifestToNavigation`. It also exports editor message and navigation types.

## Minimal example

`manifestToNavigation` converts generated template entries into nodes for the client navigation tree:

```tsx
'use client'

import { FrameKitNavigation, manifestToNavigation } from '@mauriciodmo/framekit/editor'
import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

export function Navigation ({ templates }: { templates: readonly TemplateRegistryEntry[] }) {
  const nodes = manifestToNavigation(templates)
  return (
    <nav>
      {nodes.map((node) => <FrameKitNavigation key={node.id} node={node} />)}
    </nav>
  )
}
```

`FrameKitEditor` instead receives a registry entry, its loaded definition, an `EditorMessages` catalog, and optionally `sidebarCollapsed`. `TemplateCanvas` renders a definition at its declared dimensions.

## Bundle and runtime constraints

This entrypoint is client-side: its interactive components use React state and, for navigation, Next.js client navigation and browser storage. Keep it behind a client boundary and do not use it as a server-only route handler.

See [Use Studio](/en/users/guides/use-studio), [template rendering](/en/users/concepts/templates/rendering), and the [Studio package API](/en/users/reference/package-api/studio).
