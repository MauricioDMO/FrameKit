---
title: Next.js package API
description: Apply FrameKit's required Next.js production configuration.
sidebar:
  order: 5
---

**Import:** `@mauriciodmo/framekit/next`  
**Environment:** tooling; use it from the Next.js configuration module.

This entrypoint exports `withFrameKit(config?)`. It returns a Next.js configuration with FrameKit's standalone output, build directory, and root redirect while preserving compatible custom configuration.

## Minimal example

```ts
import { withFrameKit } from '@mauriciodmo/framekit/next'

export default withFrameKit({
  reactStrictMode: true
})
```

## Bundle and runtime constraints

This is build-time configuration, not a component import. `withFrameKit` sets `output: 'standalone'` and `distDir: '.framekit/next'`, and adds a temporary redirect from `/` to `/editor`. A different `output` or `distDir` is rejected; an existing root redirect must be the same temporary redirect.

See [integrating an existing Next.js project](/en/users/getting-started/existing-project), [deployment runtime](/en/users/deployment/runtime), and the [package API index](/en/users/reference/package-api).
