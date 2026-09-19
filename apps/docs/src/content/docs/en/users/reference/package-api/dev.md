---
title: Development package API
description: Use FrameKit's advanced server-side development and code-generation utilities.
sidebar:
  order: 8
---

**Import:** `@mauriciodmo/framekit/dev`  
**Environment:** tooling; these utilities operate on the project filesystem and development server.

This is an advanced tooling surface, not a requirement for most consumers. It exports `createDevServer`, template and brand discovery helpers, code-generation helpers, `watchTemplates`, and `getServerOptions`, together with their public tooling types.

## Minimal example

```ts
import { createDevServer } from '@mauriciodmo/framekit/dev'

const server = await createDevServer({
  projectRoot: process.cwd(),
  hostname: 'localhost',
  port: 3000
})

await server.close()
```

`createDevServer` generates the project registry before starting the Next.js development server and watches template and brand paths for changes. The public CLI is the supported normal interface for this workflow.

## Bundle and runtime constraints

This entrypoint performs Node.js filesystem, process, and server work. Keep it out of browser bundles and use it only in development or build tooling. Prefer [`framekit dev`](/en/users/reference/cli/framekit) unless you need to integrate the lower-level utilities.

See [create a template](/en/users/guides/create-template), [project structure](/en/users/getting-started/project-structure), and the [server package API](/en/users/reference/package-api/server).
