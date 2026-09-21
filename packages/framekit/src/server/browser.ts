import { chromium, type Browser, type BrowserContext } from 'playwright-core'

import type { ResolvedRenderPayload } from '@/types'
import type { ImageRenderRuntimeConfig } from './config'
import { ImageRenderError } from './errors'

const browserStateSymbol = Symbol.for('framekit.server.browser')

interface BrowserManagerState {
  browser: Browser | null
  launching: Promise<Browser> | null
  closing: Promise<void> | null
  activeRenders: number
}

function getBrowserState (): BrowserManagerState {
  const globalState = globalThis as typeof globalThis & {
    [browserStateSymbol]?: BrowserManagerState
  }

  if (globalState[browserStateSymbol] === undefined) {
    globalState[browserStateSymbol] = {
      browser: null,
      launching: null,
      closing: null,
      activeRenders: 0
    }
  }

  return globalState[browserStateSymbol]
}

export function reserveRender (config: ImageRenderRuntimeConfig): () => void {
  const state = getBrowserState()
  if (state.activeRenders >= config.maxConcurrentRenders) {
    throw new ImageRenderError({
      code: 'render_capacity_exhausted',
      message: 'Maximum concurrent image renders exceeded'
    })
  }

  state.activeRenders += 1
  let released = false

  return () => {
    if (released) return
    released = true
    state.activeRenders -= 1
  }
}

export async function getBrowser (timeout?: number): Promise<Browser> {
  const state = getBrowserState()
  if (state.closing !== null && state.closing !== undefined) {
    await state.closing
    return getBrowser(timeout)
  }
  if (state.browser !== null && state.browser.isConnected()) return state.browser
  if (state.launching !== null) return state.launching

  const launchPromise = chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    ...(timeout === undefined ? {} : { timeout })
  }).then(browser => {
    if (state.closing === null || state.closing === undefined) state.browser = browser
    browser.on('disconnected', () => {
      if (state.browser === browser) state.browser = null
    })
    return browser
  }).finally(() => {
    if (state.launching === launchPromise) state.launching = null
  })
  state.launching = launchPromise

  return launchPromise
}

export async function createRenderContext (
  payload: Pick<ResolvedRenderPayload, 'width' | 'height'>,
  timeout?: number
): Promise<BrowserContext> {
  const browser = await getBrowser(timeout)
  const context = await browser.newContext({
    viewport: { width: payload.width, height: payload.height },
    deviceScaleFactor: 1,
    acceptDownloads: false,
    serviceWorkers: 'block'
  })
  if (timeout !== undefined) {
    context.setDefaultTimeout(timeout)
    context.setDefaultNavigationTimeout(timeout)
  }
  return context
}

export async function closeBrowser (): Promise<void> {
  const state = getBrowserState()
  if (state.closing !== null && state.closing !== undefined) return state.closing

  const launching = state.launching
  const browser = state.browser
  state.browser = null
  const closing = (async () => {
    const launchedBrowser = launching === null ? browser : await launching.catch(() => null)
    if (state.launching === launching) state.launching = null
    if (launchedBrowser !== null) await launchedBrowser.close()
  })().finally(() => {
    state.closing = null
  })
  state.closing = closing
  await closing
}
