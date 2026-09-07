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
  if (url.startsWith('data:')) return true
  try {
    return new URL(url).origin === internalOrigin.origin
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
  const release = reserveRender(options.config)
  const job = createRenderJob(options.payload)
  const renderUrl = new URL(`/__framekit/render/${encodeURIComponent(job.id)}`, options.config.internalOrigin).toString()
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
  options.signal?.addEventListener('abort', onCallerAbort, { once: true })
  const timer = setTimeout(() => {
    deadline = true
    controller.abort()
  }, options.config.renderTimeoutMs)
  controller.signal.addEventListener('abort', () => { closeActive().catch(() => undefined) }, { once: true })

  const abortError = (): ImageRenderError => deadline
    ? new ImageRenderError({ code: 'render_timeout', message: 'Image render timed out' })
    : failure('Image render aborted')

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
    context = await wait(createRenderContext(options.payload))
    page = await wait(context.newPage())
    const primaryPage = page

    await context.route('**/*', async route => {
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
        await route.continue({ headers: { ...request.headers(), 'x-framekit-render-token': job.token } })
        return
      }
      await route.continue()
    })
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
    }))
    await wait(page.addStyleTag({ content: '*, *::before, *::after { animation: none !important; transition: none !important; }' }))
    const bytes = Buffer.from(await wait(root.screenshot({ type: 'png' })))
    if (!isPng(bytes)) throw failure('Render screenshot is not a PNG')
    return bytes
  } catch (error) {
    if (isImageRenderError(error)) throw error
    if (controller.signal.aborted) throw abortError()
    throw failure(error instanceof Error ? error.message : 'Image render failed', error)
  } finally {
    clearTimeout(timer)
    options.signal?.removeEventListener('abort', onCallerAbort)
    await closeActive()
    deleteRenderJob(job.id)
    release()
  }
}
