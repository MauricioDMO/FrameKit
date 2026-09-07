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

function fakePage (rootCount = 1, screenshot = png) {
  const frame = {}
  const page = {
    mainFrame: () => frame,
    goto: vi.fn(async () => ({ status: () => 200 })),
    waitForFunction: vi.fn(async () => ({ jsonValue: async () => 'ready' })),
    locator: vi.fn(() => ({ count: vi.fn(async () => rootCount), screenshot: vi.fn(async () => screenshot) })),
    evaluate: vi.fn(async () => undefined),
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
    const route = (request: Record<string, unknown>) => ({ request: () => request, continue: vi.fn(async () => undefined), abort: vi.fn(async () => undefined) })
    const privateRequest = { url: () => 'http://127.0.0.1/__framekit/render/' + 'a'.repeat(64), method: () => 'GET', headers: () => ({ accept: 'text/html' }), isNavigationRequest: () => true, frame: () => frame }
    const privateRoute = route(privateRequest)
    await handler(privateRoute)
    expect(privateRoute.continue).toHaveBeenCalledWith({ headers: { accept: 'text/html', 'x-framekit-render-token': 'b'.repeat(64) } })

    const assetRoute = route({ ...privateRequest, url: () => 'http://127.0.0.1/_next/app.js', isNavigationRequest: () => false })
    await handler(assetRoute)
    expect(assetRoute.continue).toHaveBeenCalledWith()

    const externalRoute = route({ ...privateRequest, url: () => 'https://example.com/image.png', isNavigationRequest: () => false })
    await handler(externalRoute)
    expect(externalRoute.abort).toHaveBeenCalledOnce()
  })

  it('fails before creating a job when capacity is exhausted', async () => {
    const error = new ImageRenderError({ code: 'render_capacity_exhausted', message: 'full' })
    mocks.reserve.mockImplementationOnce(() => { throw error })
    await expect(renderTemplateImage({ payload, config })).rejects.toBe(error)
    expect(mocks.createJob).not.toHaveBeenCalled()
    expect(mocks.createContext).not.toHaveBeenCalled()
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
})
