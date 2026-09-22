---
title: Package API
description: Choose the supported FrameKit package entrypoint for templates, Studio, rendering, or project tooling.
sidebar:
  order: 1
---

FrameKit publishes a small set of explicit package entrypoints. Import only from these paths; the package does not expose its `src/` tree as a consumer API.

## Choose an entrypoint

- [Core API](/en/users/reference/package-api/core) — shared template definitions, fields, validation, data helpers, and `Markdown`.
- [Client API](/en/users/reference/package-api/client) — the client component used by the private render page.
- [Editor API](/en/users/reference/package-api/editor) — interactive editor and navigation components.
- [QR code API](/en/users/reference/package-api/qr) — SVG QR codes with a layout-friendly `div` wrapper for templates.
- [Next.js API](/en/users/reference/package-api/next) — the supported Next.js configuration wrapper.
- [Studio API](/en/users/reference/package-api/studio) — the client-side Studio surface and its messages and types.
- [Studio root API](/en/users/reference/package-api/studio-root) — server-side document and page factories for Studio routes.
- [Development API](/en/users/reference/package-api/dev) — advanced server-side discovery, code generation, and watching utilities.
- [Server API](/en/users/reference/package-api/server) — Node.js handlers and server-side rendering contracts.
- [Stylesheet](/en/users/reference/package-api/styles) — the published CSS entrypoint.

## Package constraints

The package is ESM-only. Its peer dependency ranges are Next.js `>=16 <17`, React `>=19 <20`, and React DOM `>=19 <20`. The package requires Node.js `>=22.13.0`; the package manager requirement is pnpm `>=11.14.0`.

For project setup, see [integrating an existing Next.js project](/en/users/getting-started/existing-project). For the template contract, see the [template reference](/en/users/reference/template).
