---
title: Server package API
description: Mount FrameKit's Node.js access, image, and private render handlers.
sidebar:
  order: 9
---

**Import:** `@mauriciodmo/framekit/server`  
**Environment:** server-only Node.js.

The server entrypoint exports the unified `createFrameKitApiHandler`, access and image handlers, render helpers, private render-page handoff, image-input preparation, render-job helpers, and their public request, error, token, and job types.

## Minimal example

Mount the unified handler from a server-side Next.js catch-all route:

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

The unified handler serves access operations and `POST /api/framekit/images/render`. `createRenderPage` is the separate private page handoff used by the server-side PNG renderer.

## Bundle and runtime constraints

This entrypoint is server-only and must not be bundled for browsers or deployed to an Edge runtime. Keep credentials, sessions, API tokens, and render configuration on the server. The renderer requires the explicitly installed Chromium headless shell; it is intended for a long-lived Node.js process.

See [HTTP API](/en/users/reference/http-api), [image render API](/en/users/reference/http-api/image-render), [existing-project integration](/en/users/getting-started/existing-project), and the [development API](/en/users/reference/package-api/dev).
