import { beforeEach, describe, expect, it, vi } from 'vitest'

import { chromium, type Browser } from 'playwright-core'

import type { ImageRenderRuntimeConfig } from '@/server/config'
import { closeBrowser, createRenderContext, getBrowser, reserveRender } from '@/server/browser'

vi.mock('playwright-core', () => ({
  chromium: { launch: vi.fn() }
}))

const config: ImageRenderRuntimeConfig = {
  internalOrigin: new URL('http://127.0.0.1'),
  allowedImageHosts: new Set(),
  maxConcurrentRenders: 2,
  renderTimeoutMs: 30_000
}

function fakeBrowser (context: object = {}): Browser & { disconnect: () => void } {
  let connected = true
  let disconnected: (() => void) | undefined
  return {
    isConnected: () => connected,
    on: (event: string, listener: () => void) => {
      if (event === 'disconnected') disconnected = listener
      return undefined as never
    },
    close: vi.fn(async () => { connected = false }),
    newContext: vi.fn(async () => context as never),
    disconnect: () => {
      connected = false
      disconnected?.()
    }
  } as unknown as Browser & { disconnect: () => void }
}

beforeEach(async () => {
  await closeBrowser()
  vi.clearAllMocks()
})

describe('browser manager', () => {
  it('shares concurrent cold starts and caches the connected browser', async () => {
    const browser = fakeBrowser()
    let resolveLaunch!: (browser: Browser) => void
    vi.mocked(chromium.launch).mockReturnValue(new Promise(resolve => { resolveLaunch = resolve }))

    const first = getBrowser()
    const second = getBrowser()
    expect(chromium.launch).toHaveBeenCalledTimes(1)
    expect(chromium.launch).toHaveBeenCalledWith({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
    resolveLaunch(browser)

    await expect(first).resolves.toBe(browser)
    await expect(second).resolves.toBe(browser)
    await expect(getBrowser()).resolves.toBe(browser)
  })

  it('clears a disconnected browser and launches again', async () => {
    const first = fakeBrowser()
    const second = fakeBrowser()
    vi.mocked(chromium.launch).mockResolvedValueOnce(first).mockResolvedValueOnce(second)

    await expect(getBrowser()).resolves.toBe(first)
    first.disconnect()
    await expect(getBrowser()).resolves.toBe(second)
    expect(chromium.launch).toHaveBeenCalledTimes(2)
  })

  it('closes an in-flight launch without repopulating state or launching twice', async () => {
    const browser = fakeBrowser()
    let resolveLaunch!: (browser: Browser) => void
    vi.mocked(chromium.launch).mockReturnValue(new Promise(resolve => { resolveLaunch = resolve }))

    const launching = getBrowser()
    const closing = closeBrowser()
    const afterClose = getBrowser()
    expect(chromium.launch).toHaveBeenCalledTimes(1)

    const replacement = fakeBrowser()
    vi.mocked(chromium.launch).mockResolvedValueOnce(replacement)
    resolveLaunch(browser)
    await closing
    await expect(launching).resolves.toBe(browser)
    expect(browser.close).toHaveBeenCalledOnce()

    await expect(afterClose).resolves.toBe(replacement)
    expect(chromium.launch).toHaveBeenCalledTimes(2)
  })

  it('cleans up a failed in-flight launch without rejecting closeBrowser', async () => {
    const error = new Error('launch failed')
    vi.mocked(chromium.launch).mockRejectedValueOnce(error)

    const launching = getBrowser()
    await expect(closeBrowser()).resolves.toBeUndefined()
    await expect(launching).rejects.toBe(error)

    const browser = fakeBrowser()
    vi.mocked(chromium.launch).mockResolvedValue(browser)
    await expect(getBrowser()).resolves.toBe(browser)
    expect(chromium.launch).toHaveBeenCalledTimes(2)
  })

  it('reserves capacity synchronously and releases each lease once', () => {
    const firstRelease = reserveRender(config)
    const secondRelease = reserveRender(config)

    expect(() => reserveRender(config)).toThrowError(expect.objectContaining({ code: 'render_capacity_exhausted' }))
    firstRelease()
    firstRelease()
    const thirdRelease = reserveRender(config)
    expect(thirdRelease).toBeTypeOf('function')
    thirdRelease()
    secondRelease()
  })

  it('creates isolated trusted-size contexts without shared headers or persistence', async () => {
    const context = {
      setDefaultTimeout: vi.fn(),
      setDefaultNavigationTimeout: vi.fn()
    }
    const browserWithContext = fakeBrowser(context)
    vi.mocked(chromium.launch).mockResolvedValue(browserWithContext)

    await createRenderContext({ width: 1200, height: 630 }, 1_500)
    expect(chromium.launch).toHaveBeenCalledWith({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      timeout: 1_500
    })
    expect(browserWithContext.newContext).toHaveBeenCalledWith({
      viewport: { width: 1200, height: 630 },
      deviceScaleFactor: 1,
      acceptDownloads: false,
      serviceWorkers: 'block'
    })
    expect(context.setDefaultTimeout).toHaveBeenCalledWith(1_500)
    expect(context.setDefaultNavigationTimeout).toHaveBeenCalledWith(1_500)
  })

  it('treats a legacy browser state without closing as open', async () => {
    const globalState = globalThis as typeof globalThis & Record<symbol, unknown>
    globalState[Symbol.for('framekit.server.browser')] = {
      browser: null,
      launching: null,
      activeRenders: 0
    }
    const browser = fakeBrowser()
    vi.mocked(chromium.launch).mockResolvedValue(browser)

    await expect(getBrowser()).resolves.toBe(browser)
    await expect(getBrowser()).resolves.toBe(browser)
    expect(chromium.launch).toHaveBeenCalledOnce()
  })
})
