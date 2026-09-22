---
title: Import boundaries
description: Keep FrameKit consumers, runtime layers, client code, server code, tooling, and generated output on their supported boundaries.
---

# Import boundaries

These rules describe the current repository contract for contributors. The
package manifest, source entrypoints, generated consumer, and relevant tests are
the authority when a page or example disagrees with the code.

## Use published package entrypoints

Consumers import the public package, not its source tree. The current
`packages/framekit/package.json` publishes these exact entrypoints:

| Consumer specifier | Manifest export | Boundary |
| --- | --- | --- |
| `@mauriciodmo/framekit` | `.` | Foundation and core template contracts. |
| `@mauriciodmo/framekit/editor` | `./editor` | Client-side Editor components, including `TemplateCanvas`. |
| `@mauriciodmo/framekit/client` | `./client` | Client-side private render component factory. |
| `@mauriciodmo/framekit/qr` | `./qr` | Browser-safe QR component for template rendering. |
| `@mauriciodmo/framekit/next` | `./next` | Next.js build configuration. |
| `@mauriciodmo/framekit/studio` | `./studio` | Client-side Studio composition and messages. |
| `@mauriciodmo/framekit/studio/root` | `./studio/root` | Server-side document and page factories for Studio routes. |
| `@mauriciodmo/framekit/dev` | `./dev` | Node-based discovery, code generation, watching, and development utilities. |
| `@mauriciodmo/framekit/server` | `./server` | Node/server-only access, image, and rendering contracts. |
| `@mauriciodmo/framekit/styles.css` | `./styles.css` | Published stylesheet. |

The generated project uses its own `@framekit/generated/*` aliases for generated
modules and the published FrameKit entrypoints for reusable code. See the [user package API reference](/en/users/reference/package-api)
for symbols and consumer examples instead of duplicating those contracts here.

## Preserve layer direction

FrameKit separates reusable foundation code, product UI, server runtime, and
tooling:

- **Foundation** includes the root package entry and core template, field,
  validation, data, type, and Markdown modules. Foundation does not depend on
  Editor, Studio, Server, or Tooling.
- **Editor, QR, and Studio** are browser-facing layers. `TemplateCanvas` crosses
  the public boundary through `./editor`, and QR rendering crosses through
  `./qr`; consumers use the published entrypoints rather than internal paths.
- **Server** owns Node/server-only access, image, render-job, browser, and HTTP
  behavior exposed through `./server`. Keep this facade out of browser bundles
  and client components.
- **Tooling** owns discovery, code generation, file watching, the development
  server, and CLI lifecycle through `./dev` and the package CLI. Keep its
  filesystem and process work out of reusable client graphs.

The public entrypoint is a boundary, not a shortcut around layer ownership.
When a change crosses layers, update the owner and its supported facade rather
than importing an implementation file from another layer.

Authentication configuration is server-owned. `FRAMEKIT_AUTH_ENABLED` is read
only by server, Studio-root, and development-server boundaries; consumers must
not infer auth from `NODE_ENV`, credentials, or SQLite, or expose access storage
from client code.

## Keep client and server graphs separate

Client code does not import `./server`. Use `@mauriciodmo/framekit/client`,
`@mauriciodmo/framekit/editor`, or `@mauriciodmo/framekit/qr` behind the
appropriate browser-facing boundary, and keep `@mauriciodmo/framekit/server` in
Node/server route modules. Server code prepares the render payload; the client
render component receives that payload at its client boundary.

Node built-ins such as `node:fs`, `node:path`, `node:crypto`, and
`node:module` stay in Server and Tooling where appropriate. Do not pull Node or
Playwright dependencies into Foundation, Editor, QR, or browser-facing client
bundles.

## Treat generated code as output

Generated registries, client bindings, copied template assets, and build output
are integration output, not a second maintained implementation. Maintained
source remains in the consumer's template and brand paths and in the package
source that generates those outputs.

Run the relevant FrameKit command to regenerate output after changing its
source. Do not hand-edit `src/generated/framekit/`, `public/framekit/`,
`.framekit/`, or package build output. The [generated code architecture guide](/en/contributors/architecture/generated-code)
describes the repository flow; the [generated files reference](/en/users/reference/generated-files)
describes the consumer-facing paths.

## Boundary review

Before merging a cross-cutting change, check that:

- consumer imports use one of the manifest entrypoints above;
- Foundation still has no Editor, Studio, Server, or Tooling dependency;
- client graphs do not import `./server` or Node built-ins;
- Node built-ins remain in Server or Tooling when the runtime needs them;
- `TemplateCanvas` is consumed through `./editor`;
- generated files were regenerated rather than edited; and
- consumer-facing details link to the [user package API reference](/en/users/reference/package-api).

The [architecture guide](/en/contributors/architecture) provides the broader
workspace and runtime map. Use it with [local development](/en/contributors/getting-started/local-development)
when a boundary change needs focused or integration verification.
