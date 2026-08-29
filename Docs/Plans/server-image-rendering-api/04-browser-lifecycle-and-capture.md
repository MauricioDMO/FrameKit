# Step 4 - Browser Lifecycle and Capture

## Goal

Adapt the supplied browser controller to `playwright-core`, make its lifecycle
safe under concurrent API requests and development reloads, and implement one
bounded operation that turns a normalized render payload into a PNG buffer.

## Depends on

- [Step 1](./01-contracts-and-server-boundary.md) configuration and failures.
- [Step 2](./02-shared-canvas-and-image-inputs.md) image-host policy and capture
  selector contract.
- [Step 3](./03-temporary-render-jobs.md) create/load/delete protocol.

## Deliverables

- A reusable browser manager under `packages/framekit/src/server/`.
- `playwright-core` runtime dependency wiring suitable for development tests.
- HMR-safe singleton browser state.
- Atomic render-capacity reservation.
- One `renderTemplateImage(...) -> Promise<Buffer>` orchestration function.
- Fixed-origin network restrictions and redirect checks.
- Explicit page/font/image readiness and PNG verification.
- Idempotent shutdown registration that does not call `process.exit()`.
- Unit tests with a mocked Playwright boundary; real Chromium is deferred to
  Steps 7-8.

## Adaptation of the supplied controller

Preserve these useful behaviors from the supplied design:

- one shared `Browser` per Node.js process;
- concurrent initialization waits on one promise;
- one isolated `BrowserContext` per render;
- active contexts tracked for cleanup;
- automatic context leak timeout;
- browser idle timeout;
- serialized close/restart behavior;
- idempotent signal-handler registration.

Change these parts before putting it in the reusable package:

- import types and `chromium` from `playwright-core`, never `playwright`;
- replace `@/const` with explicit validated options from Step 1;
- store all mutable singleton state behind one `globalThis` symbol, not only the
  signal-handler flag;
- make `closeBrowser()` await an initialization already in progress;
- make context creation reserve capacity before asynchronous work;
- permit per-render viewport dimensions;
- recover from browser disconnection and clear stale contexts/state;
- separate request timeout from the 15-minute context leak backstop;
- keep `process.exit()` outside reusable library cleanup.

## Browser state model

```typescript
interface BrowserManagerState {
  browser: Browser | null
  initializing: Promise<Browser> | null
  closing: Promise<void> | null
  contexts: Set<BrowserContext>
  reservedSlots: number
  idleTimer: NodeJS.Timeout | null
  handlersRegistered: boolean
}
```

Store the state under a package-specific global symbol, for example
`Symbol.for('framekit.server.browser')`. Use a global type declaration instead
of repeated `@ts-expect-error` access.

Invariants:

- `reservedSlots >= contexts.size` while context creation is in progress;
- `reservedSlots <= maxConcurrentRenders` always;
- an idle timer exists only when no reserved/active context remains;
- one initialization and one close operation may exist at a time;
- a disconnected browser is never returned as healthy;
- close leaves state usable for a later restart.

## Capacity reservation

Do not use `contexts.size` alone because two requests can pass the same check
before either `newContext()` resolves.

Required sequence:

1. In synchronous code, check `reservedSlots` against the configured limit.
2. Increment `reservedSlots` before the first `await`.
3. Clear the idle timer.
4. Start/obtain the browser.
5. Create the context and add it to `contexts`.
6. If any step fails, decrement the reservation exactly once.
7. On context close, remove it, decrement exactly once, and arm idle cleanup if
   no slot remains.

Use a small lease/release closure or equivalent idempotent guard so timeout,
explicit close, browser disconnect, and context `close` events cannot each
release the same slot.

There is no in-process wait queue. If capacity is full, throw
`render_capacity_exhausted` immediately and let the route return `503` with
`Retry-After`.

## Browser startup

Launch options come from validated configuration:

```typescript
{
  headless: config.browserHeadless,
  slowMo: config.browserSlowMoMs,
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
}
```

Rules:

- production is always headless;
- do not accept arbitrary launch args from an API request;
- browser executable discovery remains Playwright-owned through
  `PLAYWRIGHT_BROWSERS_PATH`;
- the `playwright-core` package version and installed browser revision must
  match through the lockfile and Docker CLI from Step 7;
- attach a `disconnected` listener that invalidates the browser reference and
  closes/releases tracked contexts safely;
- log only browser lifecycle events, never request data.

## Context creation

Context options:

- viewport width/height from the trusted loaded template definition;
- `deviceScaleFactor: 1`;
- explicit stable user agent only if the supplied controller's compatibility
  requirement remains necessary after a real-browser smoke; otherwise prefer
  Playwright's Chromium default rather than pretending to be another version;
- no persistent context or user data directory;
- no reused cookies/storage between requests;
- the private job token set as `x-framekit-render-token` through context/page
  headers;
- default downloads disabled/not used.

Template dimensions are project-authored, not caller-authored. The API never
accepts arbitrary viewport values.

## Render orchestration contract

Proposed public function:

```typescript
renderTemplateImage(options: {
  payload: NormalizedRenderPayload
  config: ImageRenderRuntimeConfig
}): Promise<Buffer>
```

The function owns all temporary/browser resources:

```text
reserve capacity
  -> create temporary job
  -> create context
  -> create page
  -> install network policy
  -> navigate to private route
  -> wait for ready/error
  -> wait for fonts/images
  -> screenshot root
  -> verify PNG
finally
  -> close page/context
  -> delete job
  -> release capacity
```

Resource acquisition is incremental. The `finally` path checks which resources
were actually created and cleans only those. Cleanup must run for browser launch,
context creation, page creation, navigation, readiness, image, screenshot, and
response-abort failures.

## Internal render URL

Construct the URL from validated config and generated ID only:

```text
<loopback-origin>/__framekit/render/<encoded-generated-id>
```

- Never use a request `Host`, forwarded header, template field, or image URL as
  the top-level navigation origin.
- Build with `new URL()` and explicit path segments.
- Do not put the token or render data in the URL/query/fragment.
- The ID format is already URL-safe and still encoded defensively.
- Inspect the main-document response returned by `page.goto()`. Any non-success
  status fails immediately instead of waiting for a DOM marker that cannot
  appear.

## Network interception

Install interception before `page.goto()`.

### Always permitted

- the exact internal origin, including Next.js chunks, RSC requests, public
  assets, generated template assets, and the private page;
- supported `data:image/...` resources already validated in Step 2;
- browser-internal safe resource URLs required to render the page, documented by
  a focused integration test if any are needed.

### Conditionally permitted

- `https:` requests whose exact normalized hostname is in
  `config.allowedImageHosts` and whose port/credentials satisfy Step 2.

### Rejected

- all unexpected top-level navigation;
- `file:`, `ftp:`, `http:` remote, WebSocket, and extension URLs;
- remote IP literals;
- redirects whose final/current destination is not permitted;
- popup/new-page navigation;
- downloads.

Use both input validation and browser interception. The second check protects
against redirects and template/browser behavior after the public request has
been normalized.

If a trusted template later requires an external font or stylesheet, its host
must be explicitly allowed and covered by tests; do not broadly permit all
network requests to make one template work.

## Readiness protocol

Step 5 renders one root with state markers. The browser waits for one of:

```text
[data-framekit-render-state="ready"]
[data-framekit-render-state="error"]
```

After ready:

1. Locate exactly one `[data-framekit-render-root]`.
2. Await `document.fonts.ready`.
3. Within the capture root, collect every `<img>`.
4. For incomplete images, await load/error.
5. Call `decode()` where available and treat rejection as an image failure.
6. Re-check natural dimensions where relevant so a broken image is not silently
   captured.
7. Optionally wait two animation frames to let layout/paint settle after decode.
8. Disable CSS/Web Animations for screenshot.

Do not use `networkidle` as the sole signal. It does not prove React/template
readiness and can be blocked by unrelated long-lived requests.

## Screenshot contract

- Capture the root locator, not the page viewport.
- Use PNG explicitly.
- Use device scale factor `1` and no caller scale.
- Disable animations.
- Do not capture Studio chrome, body margin, shadows, or private-page status UI.
- Return Playwright's `Buffer` directly after verification.
- Verify the standard eight-byte PNG signature before success.
- Optionally verify IHDR dimensions against payload width/height using Node
  buffer reads; the real smoke must do this even if runtime does not.

An error marker, missing/multiple roots, failed image decode, wrong dimensions,
empty buffer, or bad signature is `render_failed`, unless the deadline expired,
which is `render_timeout`.

## Timeout

Apply one 30-second end-to-end deadline that includes:

- browser cold start;
- job creation;
- context/page creation;
- navigation;
- template module loading;
- fonts and images;
- screenshot.

Use an abort/deadline mechanism that causes pending Playwright work to stop and
then enters cleanup. Do not simply race a timeout promise while leaving browser
work running in the background.

The 15-minute context timer remains a final leak backstop. It is not visible to
the API client.

## Idle and forced cleanup

- Close a context after every render in `finally`.
- If a context survives due to a bug, auto-close after 15 minutes.
- Arm browser idle close only when no reservation/context remains.
- Reset the idle timer on new work.
- Close the browser after 30 idle minutes.
- `closeBrowser()` waits for initialization, closes all contexts with
  `Promise.allSettled`, closes the browser, clears timers/state, and can be
  called repeatedly.
- `restartBrowser()` remains internal unless operational use proves a public need.

## Shutdown registration

Export an idempotent `registerBrowserShutdownHandlers()` for the generated Node
application startup boundary:

- use a global symbol to avoid HMR duplicates;
- respond to SIGTERM and SIGINT;
- call `closeBrowser()` and report errors without secrets;
- do not call `process.exit()` from reusable library code;
- allow Next.js and `tini` to own process termination.

Step 5/7 decides the exact Next startup file. Do not register process listeners
as an accidental side effect of importing a type/helper module.

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

## Implementation sequence

1. Add `playwright-core` for package development/runtime resolution without
   downloading browser binaries during install.
2. Implement global state and pure capacity reservation/release.
3. Implement concurrent-safe start/close/disconnect behavior.
4. Implement per-render context creation and backstop timers.
5. Implement fixed URL construction and network interception.
6. Implement ready/error/font/image wait helpers.
7. Implement root screenshot and PNG verification.
8. Compose `renderTemplateImage` with job/context cleanup and timeout.
9. Add explicit idempotent shutdown registration.
10. Export only high-level server functions.
11. Test with mocked Playwright objects and fake timers.

## Focused tests

- Concurrent starts launch Chromium once.
- Close during initialization waits and leaves no connected browser.
- Disconnection invalidates state and releases contexts.
- Capacity cannot exceed the configured limit during concurrent `newContext`.
- Failed browser/context/page creation releases reservations exactly once.
- Idle timer arms/cancels at correct transitions.
- Leak timer closes an abandoned context.
- Fixed internal URL cannot be influenced by payload fields.
- Network policy permits internal/data/allowlisted requests and aborts schemes,
  hosts, redirects, popup navigation, and downloads outside policy.
- Ready marker proceeds; error marker fails immediately; neither marker times out.
- Font/image failure prevents screenshot success.
- Screenshot captures exactly one root and rejects bad PNG bytes.
- Every failure deletes the temporary job and closes the context.
- Repeated shutdown registration adds one handler set; repeated close is safe.

## Exit gate

Step 4 is complete when:

- a mocked private page can produce a verified PNG buffer through the complete
  orchestration;
- all lifecycle races and cleanup paths have focused tests;
- browser capacity is bounded without a queue;
- only fixed internal navigation and approved resources are possible;
- the package installs no browser during normal `pnpm install`;
- package tests, typecheck, and build pass. Real Chromium remains the explicit
  gate in Steps 7-8.
