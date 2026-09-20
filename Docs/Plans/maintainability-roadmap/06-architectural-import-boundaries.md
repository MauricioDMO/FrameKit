# Phase 6 - Architectural Import Boundaries

- **Status:** Proposed and deferred; not started.
- **Depends on:** Server Image Rendering steps 1-7, Studio Access phases 1-7,
  Optional Authentication phases 1-5, Studio Access phase 8, Server Image
  Rendering step 8 and the server gate.
- **Audience:** FrameKit maintainers planning the final maintainability phase.

## Goal

Define the package-entry and source-layer boundaries after the Server Image
Rendering plan has completed. This is a planning document, not approval to
enforce rules against the pre-server checkout. Phase 6 must be implemented only
once the final graph has been re-inventoried and revalidated after Server Step 8.
This documentation update requests no ESLint, configuration, or source
implementation.

The phase remains behavior-preserving. It must not introduce a package split,
change runtime behavior, hand-edit generated output, or make the current
checkout claim that the later server-rendering capabilities already exist.

## Execution order

The global execution order is:

```text
Maintainability 1 → 2 → 3 → 4 → 5
    ↓
Server Image Rendering 1 → 2 → 3 → 4 → 5 → 6 → 7
    ↓
Studio Access 1 → 2 → 3 → 4 → 5 → 5.5 → 6 → 7
    ↓
Optional Authentication 1 → 2 → 3 → 4 → 5
    ↓
Studio Access 8 → Server Image Rendering 8
    ↓
Server gate
    ↓
Maintainability 6
```

Do not start Phase 6 after Phase 5 alone. The server, Studio Access and Optional
Authentication sequence plus the server gate must complete first. Until then,
this document remains a plan and no
ESLint rule, ESLint configuration, architecture test, source import, export,
package manifest, or build entry is changed for Phase 6.

## Current exports and the server facade

The current `@mauriciodmo/framekit` package exposes these six non-server entries:

- `@mauriciodmo/framekit` (`.`)
- `@mauriciodmo/framekit/editor` (`./editor`)
- `@mauriciodmo/framekit/studio` (`./studio`)
- `@mauriciodmo/framekit/studio/root` (`./studio/root`)
- `@mauriciodmo/framekit/dev` (`./dev`)
- `@mauriciodmo/framekit/styles.css` (`./styles.css`)

`@mauriciodmo/framekit/server` (`./server`) is currently available as the Step 1
server facade. It exports only the Step 1 contracts, authentication helper,
configuration parser, and error model. Jobs, browser, image fetching, routes,
Docker, and rollout remain future work in Server Steps 2-8. Phase 6 consumes
the final post-server contract after those steps and the server gate rather than
creating or pre-approving it.

The intended facade files in the final graph are:

```text
src/index.ts
src/editor.ts
src/studio.ts
src/studio-root.ts
src/dev.ts
src/server.ts             # current facade; Step 1 only
```

The five existing TypeScript facades retain their current responsibilities.
`server.ts` is the current facade and currently exports only the Step 1
contracts, authentication helper, configuration parser, and error model; later
server steps extend it. `index.ts` remains the root foundation entry;
`editor.ts`, `studio.ts`, `studio-root.ts`, and `dev.ts` remain separate
boundaries rather than becoming a single barrel.

## Post-server architecture baseline

Phase 6 must plan against the final graph, not the current six-entry graph. The
baseline must include all of the following nodes and their real static and
dynamic edges after Server Step 8:

| Ownership | Post-server scope |
| --- | --- |
| Foundation | `types.ts`, `core/**`, `markdown/**`, and foundation-safe modules under `shared/**` |
| Product UI | `editor/**`, `editor.ts`, `studio/**`, `studio.ts`, and `studio-root.ts` |
| Server runtime | `server/**`, `server.ts`, render-job and browser lifecycle code, and server-only dependencies |
| Tooling | `tooling/**`, `dev.ts`, CLI, code generation, discovery, and development server code |
| Consumers | `apps/studio/src/**` and the generated consumer under `packages/create-framekit/template/src/**`, including public and private server routes |
| Scaffolding | `packages/create-framekit/src/**` and the generated-project template outside its consumer runtime |

The final graph must explicitly account for:

- `TemplateCanvas`, extracted by Server Step 2 and exposed through the approved
  `./editor` boundary, without preview scaling, Studio shell, theme, or product
  chrome;
- `shared/raster-image.ts`, whose ownership and allowed dependents must be
  confirmed from the post-server implementation rather than assumed here;
- the consumer public image API route and private render route in the canonical
  generated consumer and in Studio, with their server-only status and route
  boundaries recorded;
- Node and Playwright dependencies used by server-only runtime, browser capture,
  packaging, or verification code, without contaminating reusable client
  bundles; and
- generated registries, template loaders, aliases, build entries, and package
  exports as they actually exist after the server work.

## Ownership and direction model

The following is the future review model. An arrow means “may import from”; it
does not authorize an import in the current checkout. The exact final file globs,
specifier patterns, exceptions, and enforcement mechanism remain unapproved
until the post-server inventory is complete.

| Ownership | May depend on | Future constraints to preserve |
| --- | --- | --- |
| **Foundation** (`types.ts`, `core/**`, `markdown/**`, foundation-safe `shared/**`) | Foundation-local modules and permitted external React types | Must not depend on Editor, Studio, Server runtime, Tooling, Node built-ins, or server-only packages. |
| **Product UI** (`editor/**`, `studio/**`, and their facades) | Foundation/shared modules, React/browser APIs, and the legitimate Next boundaries | Editor must not depend on Studio, Server runtime, or Tooling. Reusable/client Studio must not depend on Server runtime or Tooling; its explicit Next server boundary remains distinct. |
| **Server runtime** (`server/**`, `server.ts`) | Foundation/shared modules and server-only Node/Playwright dependencies | Must not depend on Editor implementation, Studio, or Tooling. Server-only dependencies must not leak into client/editor/Studio bundles. The current `./server` entry is server-only; later capabilities become available only after their steps ship. |
| **Tooling** (`tooling/**`, `dev.ts`, CLI and build/codegen paths) | Foundation/shared contracts and Node/tooling dependencies; CLI may compose development-server, discovery, and codegen paths | Must remain separate from Product UI and Server runtime. Existing CLI-to-development-server composition is not a reverse edge into Editor or Studio. |
| **Consumers** (Studio app and generated consumer routes/source) | Supported package entries, generated aliases, and consumer-local modules | Must not import `packages/framekit/src/**`, sibling source spellings, or unsupported package subpaths. Server routes may use the current `./server` entry only in server-only contexts and only for implemented capabilities. |
| **Scaffolding** (`create-framekit/src/**` and template ownership) | Its own Node CLI code and the supported public FrameKit package entries used by generated projects | Must not import FrameKit source directly or turn template generation into a second package/runtime boundary. Generated output remains generated and is never hand-edited. |

Consumer private render routes will compose the `./server` contract, once the
corresponding job and browser capabilities are implemented, with `TemplateCanvas`
through the public `./editor` contract, not through a `packages/framekit/src/**`
path. The `server/**` runtime itself does not import the Editor implementation.
The `./server` contract is a separate server-only boundary and is never made
available to client components merely because a consumer has a server route.

## Required post-server inventory

Immediately after Server Step 8 and before Phase 6 implementation, re-run the
actual dependency inventory. Revalidate, at minimum:

1. Every static import and re-export across `core`, `markdown`, `shared`,
   `editor`, `studio`, `server`, `tooling`, consumers, and scaffolding.
2. Dynamic imports, generated source strings, generated registries, and ignored
   output separately from static module edges.
3. The six existing entries, the current `./server` entry, all facade files,
   build entries, and the package contents of both public packages.
4. `TemplateCanvas` and `shared/raster-image.ts` ownership, including whether
   any public consumption is direct or only through a facade.
5. The public API and private render consumer routes, their client/server
   boundaries, and every Node or Playwright dependency they reach.
6. The nearest relevant `__tests__/` placement for runtime tests, while
   retaining `packages/framekit/type-tests/` for compile-time type fixtures.

Do not carry forward the pre-server inventory by assumption. If the actual graph
differs from this model, update the plan or obtain an architecture decision
before choosing restrictions. Phase 6 must not present exact final ESLint
patterns as already approved for the post-server graph.

## Enforcement planning

After the inventory is approved, select the smallest existing enforcement
mechanism that can express the verified static boundaries. The likely candidate
is ESLint's built-in `no-restricted-imports`, but its file globs, module-specifier
patterns, Node built-in coverage, server-only exceptions, consumer exceptions,
and generated-source treatment are deliberately not fixed by this plan.

The eventual contract must consider both bare and `node:`-prefixed Node built-in
spellings, preserve legitimate React and Next imports, keep Tooling's Node
dependencies valid, and avoid pretending that ESLint covers dynamic imports or
generated source strings. A negative/positive contract test may be added only
after the graph and rule map are approved; it must assert the relevant rule
identity rather than merely observe any lint failure.

The future implementation may correct actual violations within the approved
direction, but it must not weaken a boundary with broad allow-lists, rewrite
barrels, split packages, or add a second architecture checker. None of that
implementation is part of the current pre-server work.

## Planned verification after Server Step 8

The final Phase 6 gate should require, as applicable to the approved graph:

- all eight server exit gates and the server gate are complete before Phase 6;
- the post-server inventory and ownership map are reviewed against the checkout;
- current six-entry consumers remain valid, while server consumers use the
  supported `./server` entry only for capabilities actually shipped by the
  completed server plan;
- `TemplateCanvas` is consumed through `./editor` and server-only dependencies
  remain out of client/editor/Studio bundles;
- the approved static boundary contract rejects prohibited direction, direct
  source imports, unsupported package subpaths, and forbidden Node built-ins in
  reusable client-facing layers, while preserving approved exceptions;
- dynamic imports and generated strings are inventoried separately from what the
  static rule enforces;
- runtime tests live under the nearest relevant `__tests__/` directory and
  compile-time fixtures remain under `packages/framekit/type-tests/`;
- package exports, build entries, generated output, isolated consumers, and the
  server routes pass their relevant checks; and
- no source, ESLint/configuration, package, export, or generated-file change is
  smuggled into the documentation-only pre-server update.

Phase 6 remains incomplete until this future gate passes. The server plan and
the global tracker remain the authorities for whether Server Image Rendering or
its gate has completed.

## Out of scope for this planning update

- Starting or implementing Phase 6 before Server Step 8 and the server gate.
- Editing source, ESLint/configuration, package manifests, build entries,
  exports, architecture tests, routes, dependencies, or generated output.
- Claiming the full Server Image Rendering capability is currently available
  before its jobs, browser, route, packaging, and rollout steps are complete.
- Treating the pre-server six-entry graph as the final architecture.
- Adding a package split, custom architecture framework, second boundary checker,
  or unrelated cleanup.
