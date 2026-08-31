# Step 4 - Browser Lifecycle and Capture

## Goal

Implement a deliberately small `playwright-core` browser manager for the
long-lived Node.js runtime and one bounded operation that turns a
`ResolvedRenderPayload` into a PNG buffer.

The browser shares one Chromium process per Node.js process, creates one isolated
`BrowserContext` per render, blocks browser access to external networks, and
uses the in-memory job protocol from Step 3.

## Depends on

- [Step 1](./01-contracts-and-server-boundary.md) configuration/errors/payload.
- [Step 2](./02-shared-canvas-and-image-inputs.md) image preparation and canvas
  selector contract.
- [Step 3](./03-temporary-render-jobs.md) create/load/delete Map job protocol.

## Deliverables

- A reusable browser manager under `packages/framekit/src/server/`.
- `playwright-core` runtime wiring without install-time browser downloads.
- HMR-safe shared Chromium state through `globalThis`.
- Atomic process-local render-capacity accounting.
- One `renderTemplateImage(...) -> Promise<Buffer>` orchestration function.
- Browser request policy that allows loopback/data resources and blocks external
  browser network access.
- Private-token injection only on the exact private main-document request.
- Explicit render readiness and PNG verification.
- One end-to-end timeout/abort cleanup path.
- Focused mocked-Playwright tests; real Chromium is verified later.

## Simplified browser state model

Do not start with idle timers, context leak watchdogs, browser restart APIs, or
signal-handler registration.

Suggested state:

```typescript
interface BrowserManagerState {
  browser: Browser | null
  launching: Promise<Browser> | null
  activeRenders: number
}
```

Store it under a package-specific global symbol:

```typescript
Symbol.for('framekit.server.browser')
```

Invariants:

- at most one Chromium launch promise exists at a time;
- `activeRenders` is incremented before the first async render acquisition and
  never exceeds `maxConcurrentRenders`;
- every accepted render decrements exactly once in `finally`;
- every render receives a fresh context;
- a disconnected browser is cleared and never reused as healthy;
- Chromium stays open for the lifetime of the Node process unless it disconnects
  or an explicit internal test cleanup closes it.

## Capacity reservation

Use a synchronous process-local counter, not `browser.contexts().length`.

Required sequence:

1. Check `activeRenders >= maxConcurrentRenders` synchronously.
2. If full, throw `render_capacity_exhausted` immediately.
3. Increment `activeRenders` before the first `await`.
4. Run render orchestration.
5. Decrement once in `finally`.

There is no in-process wait queue in v1. The public route maps capacity exhaustion
to `503` plus a small `Retry-After`.

## Browser startup

Use `playwright-core` and the browser revision installed by the generated Docker
image.

Initial launch shape:

```typescript
chromium.launch({
  headless: true,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
})
```

Rules:

- production is always headless;
- no caller-provided browser args;
- executable discovery is Playwright-owned via `PLAYWRIGHT_BROWSERS_PATH`;
- selected `playwright-core` version and installed browser revision must match;
- attach a `disconnected` listener that clears the cached browser reference;
- the next render may launch a new browser after a disconnect;
- log only coarse lifecycle events.

`getBrowser()` must let concurrent cold-start renders await the same launch
promise.

## Context creation

Each render uses:

- viewport width/height from the trusted payload definition dimensions;
- `deviceScaleFactor: 1`;
- no persistent context/user data directory;
- no reused cookies, localStorage, or session state;
- no global extra HTTP headers containing the private render token;
- no downloads.

The API never accepts caller-provided viewport dimensions.

## Render orchestration contract

```typescript
renderTemplateImage(options: {
  payload: ResolvedRenderPayload
  config: ImageRenderRuntimeConfig
  signal?: AbortSignal
}): Promise<Buffer>
```

The function owns all temporary/browser resources:

```text
reserve capacity
  -> create in-memory job
  -> get shared browser
  -> create context
  -> create page
  -> install private-token + network routing
  -> navigate to private loopback route
  -> wait for ready/error
  -> wait for fonts/images
  -> screenshot render root
  -> verify PNG
finally
  -> close context
  -> delete Map job
  -> release capacity
```

Cleanup must run after failures at browser launch, context/page creation,
navigation, render readiness, font/image decode, screenshot, request abort, or
timeout.

## Internal render URL

Construct it only from validated runtime config and generated job ID:

```text
<loopback-origin>/__framekit/render/<encoded-job-id>
```

Rules:

- never use request `Host`, forwarded headers, template data, or image URLs as
  top-level navigation origin;
- use `new URL()` and explicit path construction;
- do not put private token/render payload in URL/query/fragment;
- inspect the main-document response from `page.goto()` and fail on non-success
  status.

## Browser request policy

Remote request-image URLs have already been fetched and converted to data URLs by
Node.js in Step 2. Chromium therefore does not need arbitrary external network
access.

Install routing before `page.goto()`.

### Always permitted

- requests whose origin exactly equals `config.internalOrigin`, including the
  private page, Next chunks/RSC requests, `public` files, and generated template
  assets;
- `data:` image resources prepared/validated by Step 2;
- browser-internal URLs required by Chromium/Playwright if proven necessary by a
  focused real-browser test.

### Rejected

- external `http:` and `https:` requests;
- `file:`, `ftp:`, WebSocket, extension, and other unexpected schemes;
- popup/new-page navigation;
- downloads;
- unexpected top-level navigation away from the exact private URL.

If a template needs a remote font/stylesheet in the future, add an explicit
server-side preparation or supported policy then. Do not open Chromium's network
allowlist just to make a template work.

### Private token injection

The private job token must **not** be configured through
`browser.newContext({ extraHTTPHeaders })` or `page.setExtraHTTPHeaders(...)`.
Those headers can be attached to asset/subresource requests.

Instead, the page route handler/interceptor must add
`x-framekit-render-token` only when all are true:

- request is the main-document navigation request;
- destination URL exactly equals the generated private render URL;
- method is the expected document GET.

All other requests proceed without that header.

Add a focused test proving static assets and any rejected external request never
receive the private token.

## Readiness protocol

After `page.goto(..., { waitUntil: 'load' })`, wait for one state:

```text
[data-framekit-render-state="ready"]
[data-framekit-render-state="error"]
```

When ready:

1. Locate exactly one `[data-framekit-render-root]`.
2. Await `document.fonts.ready`.
3. Collect every `<img>` inside the capture root.
4. Await pending `load/error` state where necessary.
5. Call `decode()` where supported and fail if decode rejects.
6. Re-check natural dimensions for completed images.
7. Await two animation frames to let the final paint settle.
8. Disable CSS/Web Animations for screenshot.

Do not use arbitrary sleeps. Do not use `networkidle` as the primary readiness
contract.

For v1, templates that require request-specific dynamic images should render them
through normal image elements or otherwise ensure they are ready before the
FrameKit `ready` marker. Static/local CSS assets remain covered by normal page
load.

## Screenshot contract

- Capture the render-root locator, never the full page viewport.
- PNG only.
- Device scale factor `1`.
- Disable animations.
- Do not capture body margin, Studio chrome, private status UI, borders/shadows,
  or preview scaling.
- Return the screenshot bytes as a Node `Buffer`.
- Verify the standard eight-byte PNG signature.
- Runtime may also verify IHDR dimensions against payload width/height; Step 8
  smoke must verify them.

Missing/multiple roots, explicit error marker, failed image decode, empty buffer,
bad PNG signature, or dimension mismatch become `render_failed` unless the
end-to-end deadline expired.

## Timeout and request abort

Apply one 30-second default end-to-end deadline covering:

- browser cold start;
- job creation;
- context/page setup;
- private navigation;
- template module load/hydration;
- fonts/images;
- screenshot.

The public request signal is also propagated to the renderer.

Implementation requirement:

- create/merge an abort signal for client disconnect + render deadline;
- when it aborts, close the active context/page so pending Playwright work
  terminates rather than continuing in the background;
- enter normal `finally` cleanup;
- map deadline to `render_timeout`;
- a caller disconnect may stop response generation without creating an unhandled
  rejection.

Do not implement timeout as only `Promise.race()` while browser work continues.

## Process lifetime

V1 intentionally omits:

- 30-minute browser idle close;
- 15-minute context leak watchdog;
- public/internal browser restart endpoint;
- SIGTERM/SIGINT handlers registered by the reusable package;
- Next.js `instrumentation.ts` solely for browser shutdown.

The browser normally stays alive until the Node process/container exits. Context
cleanup and per-render timeout are the important request-level guarantees.

An internal `closeBrowser()` helper may exist for tests and controlled shutdown
experiments, but do not expose/register signal ownership until Next.js lifecycle
behavior requires a documented implementation.

## Expected files

```text
packages/framekit/src/server/browser.ts
packages/framekit/src/server/browser.test.ts
packages/framekit/src/server/render-image.ts
packages/framekit/src/server/render-image.test.ts
packages/framekit/src/server.ts
packages/framekit/package.json
pnpm-lock.yaml
```

No startup instrumentation file is required by this step.

## Implementation sequence

1. Add/pin `playwright-core` for package development without browser downloads.
2. Implement global browser state and shared cold-start launch promise.
3. Implement synchronous capacity reserve/release.
4. Implement per-render context/page creation.
5. Implement fixed private URL construction.
6. Implement route interception with exact main-document token injection.
7. Block browser external network requests.
8. Implement ready/error/font/image helpers.
9. Implement root screenshot + PNG verification.
10. Compose `renderTemplateImage` with Map job creation/deletion and timeout/abort.
11. Add mocked Playwright/fake-timer focused tests.

## Focused tests

- Concurrent cold starts launch Chromium once.
- Disconnected browser is cleared and can be relaunched later.
- Capacity never exceeds configured limit under concurrent requests.
- Capacity-full fails before job/browser/context creation.
- Failure at every acquisition stage releases the render slot exactly once.
- Every accepted render deletes its Map job in `finally`.
- Fixed internal URL cannot be influenced by payload fields/headers.
- Only exact private document navigation receives the job token.
- Static/internal asset requests do not receive the token.
- External HTTP/HTTPS/browser schemes are aborted.
- Popup/new-page/download behavior is blocked.
- Ready marker proceeds; error marker fails immediately.
- `document.fonts.ready` and image decode complete before screenshot.
- Root screenshot rejects zero/multiple roots and invalid PNG bytes.
- Request abort/timeout closes the context and cleans job/capacity.
- No idle/watchdog/signal timers/listeners are installed by import.

## Exit gate

Step 4 is complete when:

- mocked private-page orchestration produces a verified PNG buffer;
- browser startup is shared while contexts stay isolated;
- process-local capacity is bounded without a queue;
- Chromium browser traffic is limited to loopback/internal/data requirements;
- private token is scoped to the exact private main-document request;
- every failure path closes context, removes the Map job, and releases capacity;
- package install does not download Chromium;
- package tests/typecheck/build pass. Real Chromium remains a later gate.
