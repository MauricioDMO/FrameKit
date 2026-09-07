import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { ImageRenderRuntimeConfig, ResolvedRenderPayload } from '@/server/config'
import { ImageRenderError } from '@/server/errors'
import { renderTemplateImage } from '@/server/render-image'

const mocks = vi.hoisted(() => ({
  reserve: vi.fn(() => vi.fn()),
  createContext: vi.fn(),
  createJob: vi.fn(() => ({ id: 'a'.repeat(64), token: 'b'.repeat(64) })),
  deleteJob: vi.fn()
}))

vi.mock('@/server/browser', () => ({ reserveRender: mocks.reserve, createRenderContext: mocks.createContext }))
vi.mock('@/server/render-job', () => ({ createRenderJob: mocks.createJob, deleteRenderJob: mocks.deleteJob }))

const config: ImageRenderRuntimeConfig = {
  internalOrigin: new URL('http://127.0.0.1'),
  allowedImageHosts: new Set(),
  maxConcurrentRenders: 2,
  renderTimeoutMs: 30_000
}
const payload = { template: 'card', variant: 'default', data: {}, assets: {}, width: 1200, height: 630 } as ResolvedRenderPayload
const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

function fakePage (rootCount = 1, screenshot = png, evaluateInPage = false) {
  const frame = {}
  const page = {
    mainFrame: () => frame,
    setDefaultTimeout: vi.fn(),
    setDefaultNavigationTimeout: vi.fn(),
    goto: vi.fn(async (): Promise<{ status: () => number }> => ({ status: () => 200 })),
    waitForFunction: vi.fn(async () => ({ jsonValue: async () => 'ready' })),
    locator: vi.fn(() => ({ count: vi.fn(async () => rootCount), screenshot: vi.fn(async () => screenshot) })),
    evaluate: vi.fn(async (callback?: () => Promise<unknown>) => evaluateInPage && callback !== undefined ? callback() : undefined),
    addStyleTag: vi.fn(async () => undefined),
    on: vi.fn(),
    close: vi.fn(async () => undefined)
  }
  return { page, frame }
}

function fakeContext (page: ReturnType<typeof fakePage>['page']) {
  return {
    newPage: vi.fn(async () => page),
    route: vi.fn(),
    routeWebSocket: vi.fn(),
    on: vi.fn(),
    close: vi.fn(async () => undefined)
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  const { page } = fakePage()
  mocks.createContext.mockResolvedValue(fakeContext(page))
})

describe('renderTemplateImage', () => {
  it('orchestrates a private render and returns verified PNG bytes', async () => {
    const { page } = fakePage()
    const context = fakeContext(page)
    mocks.createContext.mockResolvedValue(context)

    await expect(renderTemplateImage({ payload, config })).resolves.toEqual(png)
    expect(mocks.createContext).toHaveBeenCalledWith(payload, config.renderTimeoutMs)
    expect(page.setDefaultTimeout).toHaveBeenCalledWith(config.renderTimeoutMs)
    expect(page.setDefaultNavigationTimeout).toHaveBeenCalledWith(config.renderTimeoutMs)
    expect(page.goto).toHaveBeenCalledWith('http://127.0.0.1/__framekit/render/' + 'a'.repeat(64), { waitUntil: 'load' })
    expect(context.close).toHaveBeenCalledOnce()
    expect(mocks.deleteJob).toHaveBeenCalledWith('a'.repeat(64))
  })

  it('scopes the token to the exact main-document GET and blocks external requests', async () => {
    const { page, frame } = fakePage()
    const context = fakeContext(page)
    mocks.createContext.mockResolvedValue(context)
    await renderTemplateImage({ payload, config })
    const handler = context.route.mock.calls[0][1]
    expect(context.routeWebSocket).toHaveBeenCalledWith('**/*', expect.any(Function))
    const websocketHandler = context.routeWebSocket.mock.calls[0][1]
    const websocket = { close: vi.fn(async () => undefined) }
    await websocketHandler(websocket)
    expect(websocket.close).toHaveBeenCalledOnce()
    const route = (request: Record<string, unknown>) => ({ request: () => request, continue: vi.fn(async () => undefined), abort: vi.fn(async () => undefined) })
    const privateRequest = { url: () => 'http://127.0.0.1/__framekit/render/' + 'a'.repeat(64), method: () => 'GET', headers: () => ({ accept: 'text/html' }), isNavigationRequest: () => true, frame: () => frame }
    const privateRoute = route(privateRequest)
    await handler(privateRoute)
    expect(privateRoute.continue).toHaveBeenCalledWith({ headers: { accept: 'text/html', 'x-framekit-render-token': 'b'.repeat(64) } })

    const assetRoute = route({ ...privateRequest, url: () => 'http://127.0.0.1/_next/app.js', isNavigationRequest: () => false })
    await handler(assetRoute)
    expect(assetRoute.continue).toHaveBeenCalledWith()

    const internalPostRoute = route({ ...privateRequest, url: () => 'http://127.0.0.1/api/render-state', method: () => 'POST', isNavigationRequest: () => false })
    await handler(internalPostRoute)
    expect(internalPostRoute.continue).toHaveBeenCalledWith()

    const externalRoute = route({ ...privateRequest, url: () => 'https://example.com/image.png', isNavigationRequest: () => false })
    await handler(externalRoute)
    expect(externalRoute.abort).toHaveBeenCalledOnce()

    for (const url of ['BLOB:http://127.0.0.1/image', 'file:///tmp/image', 'ftp://127.0.0.1/image', 'ws://127.0.0.1/socket', 'wss://127.0.0.1/socket', 'chrome-extension://id/file']) {
      const rejectedRoute = route({ ...privateRequest, url: () => url, isNavigationRequest: () => false })
      await handler(rejectedRoute)
      expect(rejectedRoute.abort).toHaveBeenCalledOnce()
    }
  })

  it('fails before creating a job when capacity is exhausted', async () => {
    const error = new ImageRenderError({ code: 'render_capacity_exhausted', message: 'full' })
    mocks.reserve.mockImplementationOnce(() => { throw error })
    await expect(renderTemplateImage({ payload, config })).rejects.toBe(error)
    expect(mocks.createJob).not.toHaveBeenCalled()
    expect(mocks.createContext).not.toHaveBeenCalled()
  })

  it('fails before reserving capacity when the caller is already aborted', async () => {
    const controller = new AbortController()
    controller.abort()

    await expect(renderTemplateImage({ payload, config, signal: controller.signal })).rejects.toMatchObject({
      code: 'render_failed',
      message: 'Image render aborted'
    })
    expect(mocks.reserve).not.toHaveBeenCalled()
    expect(mocks.createJob).not.toHaveBeenCalled()
    expect(mocks.createContext).not.toHaveBeenCalled()
  })

  it('cleans the capacity lease when job setup fails', async () => {
    const release = vi.fn()
    mocks.reserve.mockReturnValueOnce(release)
    mocks.createJob.mockImplementationOnce(() => { throw new Error('job failed') })
    await expect(renderTemplateImage({ payload, config })).rejects.toMatchObject({ code: 'render_failed' })
    expect(release).toHaveBeenCalledOnce()
    expect(mocks.deleteJob).not.toHaveBeenCalled()
  })

  it('deletes the job and releases capacity when context setup fails', async () => {
    const release = vi.fn()
    mocks.reserve.mockReturnValueOnce(release)
    mocks.createContext.mockRejectedValueOnce(new Error('context failed'))
    await expect(renderTemplateImage({ payload, config })).rejects.toMatchObject({ code: 'render_failed' })
    expect(mocks.deleteJob).toHaveBeenCalledWith('a'.repeat(64))
    expect(release).toHaveBeenCalledOnce()
  })

  it.each([
    ['missing render root', 0, png],
    ['invalid PNG', 1, Buffer.from('not png')]
  ])('rejects %s', async (_name, rootCount, screenshot) => {
    const { page } = fakePage(rootCount, screenshot)
    mocks.createContext.mockResolvedValue(fakeContext(page))
    await expect(renderTemplateImage({ payload, config })).rejects.toMatchObject({ code: 'render_failed' })
    expect(mocks.deleteJob).toHaveBeenCalled()
  })

  it('fails immediately on the error marker, multiple roots, and non-success navigation', async () => {
    const { page: errorPage } = fakePage()
    errorPage.waitForFunction.mockResolvedValue({ jsonValue: async () => 'error' })
    mocks.createContext.mockResolvedValue(fakeContext(errorPage))
    await expect(renderTemplateImage({ payload, config })).rejects.toMatchObject({ code: 'render_failed' })

    const { page: manyRoots } = fakePage(2)
    mocks.createContext.mockResolvedValue(fakeContext(manyRoots))
    await expect(renderTemplateImage({ payload, config })).rejects.toMatchObject({ code: 'render_failed' })

    const { page: badResponse } = fakePage()
    badResponse.goto.mockResolvedValue({ status: () => 503 })
    mocks.createContext.mockResolvedValue(fakeContext(badResponse))
    await expect(renderTemplateImage({ payload, config })).rejects.toMatchObject({ code: 'render_failed' })
  })

  it('waits for images, rejects zero dimensions, and disables CSS and Web Animations', async () => {
    const decode = vi.fn(async () => undefined)
    const image = {
      complete: false,
      naturalWidth: 20,
      naturalHeight: 20,
      decode,
      addEventListener: vi.fn((event: string, listener: () => void) => { if (event === 'load') listener() })
    }
    const animation = { cancel: vi.fn() }
    vi.stubGlobal('document', {
      fonts: { ready: Promise.resolve() },
      querySelector: () => ({ querySelectorAll: () => [image] }),
      getAnimations: () => [animation]
    })
    vi.stubGlobal('requestAnimationFrame', (callback: () => void) => { callback(); return 0 })
    const { page } = fakePage(1, png, true)
    mocks.createContext.mockResolvedValue(fakeContext(page))
    await renderTemplateImage({ payload, config })
    expect(decode).toHaveBeenCalledOnce()
    expect(animation.cancel).toHaveBeenCalledOnce()
    expect(page.addStyleTag).toHaveBeenCalledWith(expect.objectContaining({ content: expect.stringContaining('animation: none') }))

    image.complete = true
    image.naturalWidth = 0
    await expect(renderTemplateImage({ payload, config })).rejects.toMatchObject({ code: 'render_failed' })
    vi.unstubAllGlobals()
  })

  it('closes active resources and cleans up on caller abort', async () => {
    const { page } = fakePage()
    const context = fakeContext(page)
    page.goto.mockReturnValue(new Promise(() => undefined))
    mocks.createContext.mockResolvedValue(context)
    const controller = new AbortController()
    const render = renderTemplateImage({ payload, config, signal: controller.signal })
    await vi.waitFor(() => expect(page.goto).toHaveBeenCalled())
    controller.abort()
    await expect(render).rejects.toMatchObject({ code: 'render_failed' })
    expect(page.close).toHaveBeenCalled()
    expect(context.close).toHaveBeenCalled()
    expect(mocks.deleteJob).toHaveBeenCalled()
  })

  it('maps the render deadline and closes active resources', async () => {
    const { page } = fakePage()
    const context = fakeContext(page)
    page.goto.mockReturnValue(new Promise(() => undefined))
    mocks.createContext.mockResolvedValue(context)
    await expect(renderTemplateImage({ payload, config: { ...config, renderTimeoutMs: 1 } })).rejects.toMatchObject({ code: 'render_timeout' })
    expect(context.close).toHaveBeenCalled()
    expect(mocks.deleteJob).toHaveBeenCalled()
  })

  it('keeps unexpected Playwright diagnostics out of the public error', async () => {
    const diagnostics = new Error('Navigation failed for https://secret.example/render in Chromium')
    const { page } = fakePage()
    page.goto.mockRejectedValueOnce(diagnostics)
    mocks.createContext.mockResolvedValue(fakeContext(page))

    let error: unknown
    try {
      await renderTemplateImage({ payload, config })
    } catch (caught) {
      error = caught
    }

    expect(error).toBeInstanceOf(ImageRenderError)
    const renderError = error as ImageRenderError
    expect(renderError.code).toBe('render_failed')
    expect(renderError.message).toBe('Image render failed')
    expect(renderError.cause).toBe(diagnostics)
    expect(renderError.toJSON()).toEqual({ code: 'render_failed', message: 'Image render failed' })
    expect(JSON.stringify(renderError)).not.toContain('secret.example')
  })
})
