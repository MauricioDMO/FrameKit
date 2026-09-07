# Task 1 Report

## Implementation

- Added `packages/framekit/src/server/browser.ts` with process-global state under `Symbol.for('framekit.server.browser')`.
- Added shared Chromium startup through one cached launch promise using headless mode and the required no-sandbox arguments.
- Added disconnected-browser invalidation so later renders can launch a replacement browser.
- Added synchronous render-capacity reservation with `ImageRenderError` code `render_capacity_exhausted`.
- Added idempotent capacity release closures so each accepted reservation can release at most once.
- Added isolated context creation using trusted payload dimensions, `deviceScaleFactor: 1`, and downloads disabled. No persistent state or extra headers are configured.
- Added an internal `closeBrowser()` helper for test cleanup only.
- Added `playwright-core` as a direct runtime dependency and updated the lockfile.

## Tests

- Added `packages/framekit/src/server/__tests__/browser.test.ts`.
- Mocked `playwright-core`; no real browser is required.
- Covered concurrent cold-start sharing, disconnect and relaunch, synchronous capacity exhaustion, idempotent release, and isolated context options.

## Verification

- Focused Vitest: passed, 4 tests.
- Focused ESLint: passed.
- FrameKit package typecheck: passed, including type fixtures.

## Scoped Re-review Fix

- Updated `closeBrowser()` to observe an in-flight launch with a rejection handler. A failed launch now clears launch state and resolves cleanup without a browser to close, while the original `getBrowser()` promise still rejects with the launch error.
- Added a focused failed-launch cleanup test verifying cleanup resolves, the original error is preserved for the launch caller, and a later call can launch successfully.

## Re-review Verification

- Focused browser Vitest: passed, 6 tests.
- Focused browser ESLint: passed.
- FrameKit package typecheck: passed, including type fixtures.

## Concerns

- Render orchestration, route interception, token scoping, readiness, screenshot validation, timeout, and request-abort cleanup are intentionally deferred to the controller/render task.
- `closeBrowser()` is intentionally internal-facing and has no process signal or idle-timer ownership.

## Review Fixes

- Made `closeBrowser()` coordinate with an in-flight launch through shared closing state. Pending callers wait for cleanup, the launched browser is closed, cached state cannot be repopulated, and the next caller performs only a replacement launch after cleanup finishes.
- Released the successful third capacity lease in the capacity test to prevent render-count leakage between tests.
- Added an assertion covering `headless: true` and both required no-sandbox launch arguments.

## Fix Verification

- Focused browser Vitest: passed, 5 tests.
- Focused browser ESLint: passed.
- FrameKit package typecheck: passed, including type fixtures.
