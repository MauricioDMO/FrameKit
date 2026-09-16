import { Buffer } from 'node:buffer'

import type { BrowserContext, Page } from 'playwright-core'

import type { ImageRenderRuntimeConfig, ResolvedRenderPayload } from './config'
import { ImageRenderError } from './errors'
import { createRenderJob, deleteRenderJob } from './render-job'
import { createRenderContext, reserveRender } from './browser'

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])

function failure (message: string, cause?: unknown): ImageRenderError {
  return new ImageRenderError({ code: 'render_failed', message, cause })
}

function isImageRenderError (error: unknown): error is ImageRenderError {
  return error instanceof ImageRenderError
}

function isAllowedRequest (url: string, internalOrigin: URL): boolean {
  if (/^data:/i.test(url)) return true
  try {
    const parsed = new URL(url)
    return (parsed.protocol === 'http:' || parsed.protocol === 'https:') && parsed.origin === internalOrigin.origin
  } catch {
    return false
  }
}

function isDevHmrWebSocket (url: string, internalOrigin: URL): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'ws:' &&
      parsed.hostname === internalOrigin.hostname &&
      parsed.port === internalOrigin.port &&
      parsed.username === '' &&
      parsed.password === '' &&
      parsed.pathname === '/_next/hmr'
  } catch {
    return false
  }
}

function isPng (bytes: Buffer): boolean {
  return bytes.length >= pngSignature.length && pngSignature.every((byte, index) => bytes[index] === byte)
}

export async function renderTemplateImage (options: {
  payload: ResolvedRenderPayload
  config: ImageRenderRuntimeConfig
  signal?: AbortSignal
}): Promise<Buffer> {
  let release: (() => void) | undefined
  let job: ReturnType<typeof createRenderJob> | undefined
  let renderUrl: string | undefined
  const controller = new AbortController()
  let deadline = false
  let context: BrowserContext | undefined
  let page: Page | undefined
  let closing: Promise<void> | undefined

  const closeActive = (): Promise<void> => {
    if (closing !== undefined) return closing
    closing = (async () => {
      await page?.close().catch(() => undefined)
      await context?.close().catch(() => undefined)
    })()
    return closing
  }

  const onCallerAbort = (): void => controller.abort()
  const abortError = (): ImageRenderError => deadline
    ? new ImageRenderError({ code: 'render_timeout', message: 'Image render timed out' })
    : failure('Image render aborted')

  if (options.signal?.aborted) throw abortError()

  options.signal?.addEventListener('abort', onCallerAbort, { once: true })
  const timer = setTimeout(() => {
    deadline = true
    controller.abort()
  }, options.config.renderTimeoutMs)
  controller.signal.addEventListener('abort', () => { closeActive().catch(() => undefined) }, { once: true })

  const wait = async <T> (promise: Promise<T>): Promise<T> => {
    if (controller.signal.aborted) throw abortError()
    return await Promise.race([
      promise,
      new Promise<never>((_resolve, reject) => {
        controller.signal.addEventListener('abort', () => reject(abortError()), { once: true })
      })
    ])
  }

  try {
    release = reserveRender(options.config)
    const createdJob = createRenderJob(options.payload)
    job = createdJob
    const privateRenderUrl = new URL(`/framekit/render/${encodeURIComponent(createdJob.id)}`, options.config.internalOrigin).toString()
    renderUrl = privateRenderUrl

    const contextPromise = createRenderContext(options.payload, options.config.renderTimeoutMs)
    contextPromise.then(value => {
      if (controller.signal.aborted) value.close().catch(() => undefined)
    }).catch(() => undefined)
    context = await wait(contextPromise)
    await wait(context.routeWebSocket('**/*', websocket => {
      if (isDevHmrWebSocket(websocket.url(), options.config.internalOrigin)) {
        websocket.connectToServer()
        return
      }

      websocket.close()
    }))
    const pagePromise = context.newPage()
    pagePromise.then(value => {
      if (controller.signal.aborted) value.close().catch(() => undefined)
    }).catch(() => undefined)
    page = await wait(pagePromise)
    page.setDefaultTimeout(options.config.renderTimeoutMs)
    page.setDefaultNavigationTimeout(options.config.renderTimeoutMs)
    const primaryPage = page

    await wait(context.route('**/*', async route => {
      const request = route.request()
      const requestUrl = request.url()
      const navigation = request.isNavigationRequest()
      if (navigation && (requestUrl !== renderUrl || request.frame() !== primaryPage.mainFrame())) {
        await route.abort()
        return
      }
      if (!isAllowedRequest(requestUrl, options.config.internalOrigin)) {
        await route.abort()
        return
      }
      if (navigation && requestUrl === renderUrl && request.method() === 'GET') {
        await route.continue({ headers: { ...request.headers(), 'x-framekit-render-token': createdJob.token } })
        return
      }
      await route.continue()
    }))
    context.on('page', popup => { popup.close().catch(() => undefined) })
    page.on('download', download => { download.cancel().catch(() => undefined) })

    const response = await wait(page.goto(renderUrl, { waitUntil: 'load' }))
    const status = response?.status()
    if (status === undefined || status < 200 || status >= 300) throw failure(`Render page returned HTTP ${status ?? 'unknown'}`)

    const stateResult = await wait(page.waitForFunction(() => {
      if (document.querySelector('[data-framekit-render-state="error"]')) return 'error'
      return document.querySelector('[data-framekit-render-state="ready"]') ? 'ready' : undefined
    }))
    const state = await stateResult.jsonValue()
    if (state === 'error') {
      throw failure('Render page reported an error')
    }

    const root = page.locator('[data-framekit-render-root]')
    if (await wait(root.count()) !== 1) throw failure('Render page must contain exactly one render root')
    await wait(page.evaluate(async () => {
      await document.fonts.ready
      const root = document.querySelector('[data-framekit-render-root]')
      if (!root) {
        throw new Error('Render root is missing')
      }
      for (const image of root.querySelectorAll('img')) {
        if (!image.complete) {
          await new Promise<void>((resolve, reject) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => reject(new Error('Image failed to load')), { once: true })
          })
        }
        if (image.decode) {
          await image.decode()
        }
        if (image.naturalWidth === 0 || image.naturalHeight === 0) {
          throw new Error('Image has no dimensions')
        }
      }
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      for (const animation of document.getAnimations()) animation.cancel()
    }))
    await wait(page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' }))
    const bytes = Buffer.from(await wait(root.screenshot({ type: 'png' })))
    if (!isPng(bytes)) throw failure('Render screenshot is not a PNG')
    return bytes
  } catch (error) {
    if (isImageRenderError(error)) throw error
    if (controller.signal.aborted) throw abortError()
    throw failure('Image render failed', error)
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', onCallerAbort)
    await closeActive()
    if (job !== undefined) deleteRenderJob(job.id)
    release?.()
  }
}
