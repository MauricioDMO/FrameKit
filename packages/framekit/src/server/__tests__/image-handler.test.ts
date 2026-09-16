import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as templateData from '@/core/template-data/resolve-template-data'
import * as validation from '@/core/validation'
import { defineTemplate, field } from '@/index'
import { createApiToken } from '@/server/access/api-tokens'
import { getDatabase, resetDatabaseForTests } from '@/server/access/database'
import { createStudioImageHandler } from '@/server/image-handler'
import { ImageRenderError, type ImageRenderErrorCode } from '@/server/errors'
import type { ImageRenderRuntimeConfig } from '@/server/config'
import type { TemplateAssetManifest, TemplateRegistryEntry } from '@/types'

const mocks = vi.hoisted(() => ({
  prepare: vi.fn(),
  render: vi.fn()
}))

vi.mock('@/server/image-input', () => ({ prepareRenderInputs: mocks.prepare }))
vi.mock('@/server/render-image', () => ({ renderTemplateImage: mocks.render }))

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const emptyAssets: TemplateAssetManifest = { common: {}, variants: {} }
let imageToken = ''
const definition = defineTemplate({
  meta: { title: 'Image handler test' },
  width: 1200,
  height: 630,
  fields: {
    title: field.text({ label: 'Title', defaultValue: 'Default title' }),
    count: field.number({ label: 'Count', defaultValue: 1 })
  },
  content: {
    en: {},
    es: { title: 'Spanish' }
  },
  variants: { default: 'en' },
  render: () => null
})

function createEntry (overrides: Partial<TemplateRegistryEntry> = {}): TemplateRegistryEntry {
  return {
    slug: 'social/card',
    segments: ['social', 'card'],
    meta: definition.meta,
    width: definition.width,
    height: definition.height,
    variants: definition.variants,
    variantKeys: ['en', 'es'],
    assets: emptyAssets,
    load: vi.fn(async () => ({ default: definition })),
    ...overrides
  }
}

function setEnvironment (overrides: Record<string, string> = {}): void {
  vi.stubEnv('PORT', overrides.PORT ?? '3000')
  vi.stubEnv('FRAMEKIT_ALLOWED_IMAGE_HOSTS', overrides.FRAMEKIT_ALLOWED_IMAGE_HOSTS ?? 'images.example.com')
  vi.stubEnv('FRAMEKIT_MAX_CONCURRENT_RENDERS', overrides.FRAMEKIT_MAX_CONCURRENT_RENDERS ?? '2')
  vi.stubEnv('FRAMEKIT_RENDER_TIMEOUT_MS', overrides.FRAMEKIT_RENDER_TIMEOUT_MS ?? '30000')
}

function requestFor (body: unknown, headers: Record<string, string> = {}, signal?: AbortSignal): Request {
  return new Request('http://framekit.test/api/framekit/images/render', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${imageToken}`,
      'content-type': 'application/json',
      ...headers
    },
    body: JSON.stringify(body),
    signal
  })
}

function rawRequest (body: string, headers: Record<string, string> = {}): Request {
  return new Request('http://framekit.test/api/framekit/images/render', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${imageToken}`,
      'content-type': 'application/json',
      ...headers
    },
    body
  })
}

function responseError (code: ImageRenderErrorCode, message = 'internal secret') {
  return new ImageRenderError({ code, message })
}

async function responseJson (response: Response): Promise<Record<string, unknown>> {
  return await response.json() as Record<string, unknown>
}

beforeEach(() => {
  resetDatabaseForTests()
  setEnvironment()
  vi.stubEnv('FRAMEKIT_DATABASE_PATH', ':memory:')
  vi.clearAllMocks()
  getDatabase().prepare(`
    INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('image-user', 'image-user', 'test-hash', 'user', 1, 1, 1)
  imageToken = createApiToken('image-user', 'Image handler test').token
  mocks.prepare.mockImplementation(async ({ data, assets }: { data: Record<string, unknown>; assets: TemplateAssetManifest }) => ({
    edits: data,
    assets
  }))
  mocks.render.mockResolvedValue(png)
})

afterEach(() => {
  resetDatabaseForTests()
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
  vi.useRealTimers()
})

describe('createStudioImageHandler', () => {
  it('binds the registry without running request-time work', () => {
    const entry = createEntry()
    const handler = createStudioImageHandler([entry])

    expect(handler).toBeTypeOf('function')
    expect(entry.load).not.toHaveBeenCalled()
    expect(mocks.prepare).not.toHaveBeenCalled()
    expect(mocks.render).not.toHaveBeenCalled()
  })

  it('authenticates before reading the body or loading a template', async () => {
    const body = new ReadableStream<Uint8Array>()
    const request = new Request('http://framekit.test/api/framekit/images/render', {
      method: 'POST',
      headers: { authorization: 'Bearer wrong', 'content-type': 'application/json' },
      body,
      duplex: 'half'
    } as RequestInit)
    const entry = createEntry()

    const response = await createStudioImageHandler([entry])(request)

    expect(response.status).toBe(401)
    expect(response.headers.get('www-authenticate')).toBe('Bearer')
    expect(request.bodyUsed).toBe(false)
    expect(entry.load).not.toHaveBeenCalled()
    expect(mocks.prepare).not.toHaveBeenCalled()
    expect(mocks.render).not.toHaveBeenCalled()
  })

  it('parses PORT per request and rejects invalid values', async () => {
    const entry = createEntry()
    const handler = createStudioImageHandler([entry])
    vi.stubEnv('PORT', '65536')

    const unconfigured = await handler(requestFor({ template: entry.slug }))
    expect(unconfigured.status).toBe(503)
    expect(await responseJson(unconfigured)).toEqual({
      error: 'api_not_configured',
      message: 'Image rendering API is not configured'
    })

    setEnvironment({ PORT: '4321' })
    const configured = await handler(requestFor({ template: entry.slug }))
    expect(configured.status).toBe(200)
    expect(mocks.render.mock.calls[0][0].config.internalOrigin.href).toBe('http://localhost:4321/')

    setEnvironment()
    const defaultPort = await handler(requestFor({ template: entry.slug }))
    expect(defaultPort.status).toBe(200)
    expect(mocks.render.mock.calls[1][0].config.internalOrigin.href).toBe('http://localhost:3000/')
  })

  it.each([
    ['malformed JSON', () => rawRequest('{')],
    ['null root', () => rawRequest('null')],
    ['array root', () => rawRequest('[]')],
    ['unknown top-level key', () => rawRequest('{"template":"social/card","filename":"secret.png"}')],
    ['dangerous top-level key', () => rawRequest('{"template":"social/card","__proto__":{}}')],
    ['dangerous data key', () => rawRequest('{"template":"social/card","data":{"constructor":"secret"}}')],
    ['missing template', () => rawRequest('{}')],
    ['empty template', () => rawRequest('{"template":""}')],
    ['invalid variant', () => rawRequest('{"template":"social/card","variant":null}')],
    ['empty variant', () => rawRequest('{"template":"social/card","variant":""}')],
    ['invalid data', () => rawRequest('{"template":"social/card","data":null}')]
  ])('rejects %s before template work', async (_name, makeRequest) => {
    const entry = createEntry()
    const response = await createStudioImageHandler([entry])(makeRequest())

    expect(response.status).toBe(400)
    expect((await responseJson(response)).error).toBe('invalid_request')
    expect(entry.load).not.toHaveBeenCalled()
    expect(mocks.prepare).not.toHaveBeenCalled()
  })

  it('requires JSON content and rejects compressed bodies', async () => {
    const entry = createEntry()
    const handler = createStudioImageHandler([entry])

    const contentType = await handler(rawRequest('{}', { 'content-type': 'text/plain' }))
    const compressed = await handler(rawRequest('{}', { 'content-encoding': 'gzip' }))

    expect(contentType.status).toBe(400)
    expect(compressed.status).toBe(400)
    expect(entry.load).not.toHaveBeenCalled()
  })

  it('finds an exact slug and selects the default or requested variant', async () => {
    const entry = createEntry()
    const handler = createStudioImageHandler([entry])

    const missing = await handler(requestFor({ template: 'social/other' }))
    expect(missing.status).toBe(404)
    expect(entry.load).not.toHaveBeenCalled()

    const defaultResponse = await handler(requestFor({ template: entry.slug, data: { title: 'Default' } }))
    expect(defaultResponse.status).toBe(200)
    expect(mocks.render.mock.calls[0][0].payload.variant).toBe('en')

    const spanishResponse = await handler(requestFor({ template: entry.slug, variant: 'es', data: { title: 'Hola' } }))
    expect(spanishResponse.status).toBe(200)
    expect(mocks.render.mock.calls[1][0].payload.variant).toBe('es')

    const unknown = await handler(requestFor({ template: entry.slug, variant: 'fr' }))
    expect(unknown.status).toBe(400)
    expect(mocks.prepare).toHaveBeenCalledTimes(2)
  })

  it.each([
    ['loader failure', () => Promise.reject(new Error('secret loader path'))],
    ['definition failure', () => Promise.resolve({ default: {} as never })]
  ])('maps %s to a generic render failure', async (_name, load) => {
    const entry = createEntry({ load: vi.fn(load) })
    const response = await createStudioImageHandler([entry])(requestFor({ template: entry.slug }))
    const body = await responseJson(response)

    expect(response.status).toBe(500)
    expect(body).toEqual({ error: 'render_failed', message: 'Image render failed' })
    expect(JSON.stringify(body)).not.toContain('secret')
    expect(mocks.prepare).not.toHaveBeenCalled()
    expect(mocks.render).not.toHaveBeenCalled()
  })

  it('prepares inputs before rendering and passes one signal through the pipeline', async () => {
    const entry = createEntry()
    const preparedAssets: TemplateAssetManifest = { common: { logo: '/logo.png' }, variants: { es: {} } }
    const order: string[] = []
    mocks.prepare.mockImplementationOnce(async (options: { signal: AbortSignal; assets: TemplateAssetManifest; data: Record<string, unknown>; allowedImageHosts: ReadonlySet<string> }) => {
      order.push('prepare')
      expect(options.assets).toBe(entry.assets)
      expect(options.data).toEqual({ title: 'Prepared', count: 2 })
      expect(options.allowedImageHosts).toEqual(new Set(['images.example.com']))
      return { edits: { title: 'Resolved', count: 3 }, assets: preparedAssets }
    })
    mocks.render.mockImplementationOnce(async (options: { signal: AbortSignal; config: ImageRenderRuntimeConfig; payload: unknown }) => {
      order.push('render')
      expect(options.signal).toBe(mocks.prepare.mock.calls[0][0].signal)
      expect(options.config.renderTimeoutMs).toBe(30_000)
      expect(options.payload).toEqual({
        template: entry.slug,
        variant: 'en',
        data: { title: 'Resolved', count: 3 },
        assets: preparedAssets,
        width: definition.width,
        height: definition.height
      })
      return png
    })

    const response = await createStudioImageHandler([entry])(requestFor({
      template: entry.slug,
      data: { title: 'Prepared', count: 2 }
    }))

    expect(response.status).toBe(200)
    expect(order).toEqual(['prepare', 'render'])
    expect(mocks.prepare).toHaveBeenCalledOnce()
    expect(mocks.render).toHaveBeenCalledOnce()
  })

  it('runs canonical resolution and validation once and returns safe field errors', async () => {
    const entry = createEntry()
    mocks.prepare.mockResolvedValueOnce({ edits: { title: '' }, assets: emptyAssets })
    const resolve = vi.spyOn(templateData, 'resolveTemplateData')
    const validate = vi.spyOn(validation, 'validateTemplateData')

    const response = await createStudioImageHandler([entry])(requestFor({ template: entry.slug }))
    const body = await responseJson(response)

    expect(response.status).toBe(422)
    expect(body).toEqual({
      error: 'invalid_template_data',
      message: 'Template data is invalid',
      fields: { title: { code: 'required' } }
    })
    expect(resolve).toHaveBeenCalledOnce()
    expect(validate).toHaveBeenCalledOnce()
    expect(mocks.render).not.toHaveBeenCalled()
  })

  it.each([
    ['unsupported_image', 415],
    ['invalid_template_data', 422],
    ['image_host_not_allowed', 422],
    ['image_fetch_failed', 502],
    ['request_too_large', 413]
  ] as const)('maps preparation code %s to HTTP %s', async (code, status) => {
    const entry = createEntry()
    mocks.prepare.mockRejectedValueOnce(responseError(code))

    const response = await createStudioImageHandler([entry])(requestFor({ template: entry.slug }))
    const body = await responseJson(response)

    expect(response.status).toBe(status)
    expect(body.error).toBe(code)
    expect(body.message).not.toContain('internal secret')
    expect(mocks.render).not.toHaveBeenCalled()
  })

  it.each([
    ['render_capacity_exhausted', 503],
    ['render_timeout', 504],
    ['render_failed', 500]
  ] as const)('maps render code %s to HTTP %s', async (code, status) => {
    const entry = createEntry()
    mocks.render.mockRejectedValueOnce(responseError(code))

    const response = await createStudioImageHandler([entry])(requestFor({ template: entry.slug }))
    const body = await responseJson(response)

    expect(response.status).toBe(status)
    expect(body).toEqual({ error: code, message: expect.any(String) })
    expect(JSON.stringify(body)).not.toContain('internal secret')
    if (code === 'render_capacity_exhausted') expect(response.headers.get('retry-after')).toBe('1')
  })

  it('returns raw PNG bytes with safe no-store headers', async () => {
    const entry = createEntry()
    const response = await createStudioImageHandler([entry])(requestFor({ template: entry.slug }))

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(response.headers.get('content-length')).toBe(String(png.byteLength))
    expect(response.headers.get('content-disposition')).toBe('inline; filename="social-card.png"')
    expect(response.headers.get('cache-control')).toBe('no-store')
    expect(response.headers.get('x-content-type-options')).toBe('nosniff')
    expect(Buffer.from(await response.arrayBuffer())).toEqual(png)
  })

  it('maps a request deadline during preparation and aborts pending work', async () => {
    vi.useFakeTimers()
    setEnvironment({ FRAMEKIT_RENDER_TIMEOUT_MS: '1' })
    const entry = createEntry()
    let signal: AbortSignal | undefined
    mocks.prepare.mockImplementationOnce((options: { signal: AbortSignal }) => {
      signal = options.signal
      return new Promise(() => undefined)
    })

    const pending = createStudioImageHandler([entry])(requestFor({ template: entry.slug }))
    await Promise.resolve()
    await vi.advanceTimersByTimeAsync(1)
    const response = await pending

    expect(response.status).toBe(504)
    expect((await responseJson(response)).error).toBe('render_timeout')
    expect(signal?.aborted).toBe(true)
    expect(mocks.render).not.toHaveBeenCalled()
  })

  it('handles caller aborts as a safe existing render failure', async () => {
    const entry = createEntry()
    const caller = new AbortController()
    let signal: AbortSignal | undefined
    mocks.prepare.mockImplementationOnce((options: { signal: AbortSignal }) => {
      signal = options.signal
      return new Promise(() => undefined)
    })

    const pending = createStudioImageHandler([entry])(requestFor({ template: entry.slug }, {}, caller.signal))
    await vi.waitFor(() => expect(mocks.prepare).toHaveBeenCalledOnce())
    caller.abort()
    const response = await pending

    expect(response.status).toBe(500)
    expect((await responseJson(response)).error).toBe('render_failed')
    expect(signal?.aborted).toBe(true)
    expect(mocks.render).not.toHaveBeenCalled()
  })
})
