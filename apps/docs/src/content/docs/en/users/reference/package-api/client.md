---
title: Client package API
description: Create the client component used by FrameKit's private render page.
sidebar:
  order: 3
---

**Import:** `@mauriciodmo/framekit/client`  
**Environment:** client.

This entrypoint exports `createRenderClient(templates)`. It closes over a generated `TemplateRegistryEntry[]` registry and returns a client render component that accepts the private render payload.

## Minimal example

Keep the factory call in a module marked `'use client'`:

```tsx
'use client'

import { createRenderClient } from '@mauriciodmo/framekit/client'
import { templates } from '@framekit/generated/templates'

export const RenderClient = createRenderClient(templates)
```

`@framekit/generated/templates` is the generated consumer-project alias. Run `framekit generate` before importing it.

## Bundle and runtime constraints

The entrypoint contains a `use client` boundary and uses React client state and effects. Do not import it into a server-only module as a server implementation, and do not put the generated registry factory in a browser bundle other than the intended render component boundary.

The [existing-project integration](/en/users/getting-started/existing-project) shows the private render route. The [server package API](/en/users/reference/package-api/server) documents the server-side handoff that supplies its payload.
