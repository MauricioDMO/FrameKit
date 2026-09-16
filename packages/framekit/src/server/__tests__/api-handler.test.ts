import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate } from '@/index'
import { createFrameKitApiHandler } from '@/server'
import { createApiToken } from '@/server/access/api-tokens'
import { getDatabase, resetDatabaseForTests } from '@/server/access/database'
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
  meta: { title: 'API handler test' },
  width: 1200,
  height: 630,
  fields: {},
  content: { default: {} },
  variants: { default: 'default' },
  render: () => null
})

function createEntry (): TemplateRegistryEntry {
  return {
    slug: 'social/card',
    segments: ['social', 'card'],
    meta: definition.meta,
    width: definition.width,
    height: definition.height,
    variants: definition.variants,
    variantKeys: ['default'],
    assets: emptyAssets,
    load: vi.fn(async () => ({ default: definition }))
  }
}

function imageRequest (method = 'POST', pathname = '/api/framekit/images/render', body?: unknown, headers: Record<string, string> = {}): Request {
  return new Request(`http://framekit.test${pathname}`, {
    method,
    headers: {
      authorization: `Bearer ${imageToken}`,
      'content-type': 'application/json',
      ...headers
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  })
}

async function responseBody (response: Response): Promise<Record<string, unknown>> {
  return await response.json() as Record<string, unknown>
}

beforeEach(() => {
  resetDatabaseForTests()
  vi.stubEnv('FRAMEKIT_DATABASE_PATH', ':memory:')
  vi.stubEnv('FRAMEKIT_INTERNAL_ORIGIN', 'http://127.0.0.1:3000')
  vi.stubEnv('FRAMEKIT_ALLOWED_IMAGE_HOSTS', '')
  vi.stubEnv('FRAMEKIT_MAX_CONCURRENT_RENDERS', '2')
  vi.stubEnv('FRAMEKIT_RENDER_TIMEOUT_MS', '30000')
  vi.clearAllMocks()
  getDatabase().prepare(`
    INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run('api-user', 'api-user', 'test-hash', 'user', 1, 1, 1)
  imageToken = createApiToken('api-user', 'API handler test').token
  mocks.prepare.mockImplementation(async ({ data, assets }: { data: Record<string, unknown>; assets: TemplateAssetManifest }) => ({
    edits: data,
    assets
  }))
  mocks.render.mockResolvedValue(png)
})

afterEach(() => {
  resetDatabaseForTests()
  vi.unstubAllEnvs()
})

describe('createFrameKitApiHandler', () => {
  it('dispatches the canonical image route without requiring Origin', async () => {
    const entry = createEntry()
    const response = await createFrameKitApiHandler([entry])(imageRequest('POST', '/api/framekit/images/render', { template: entry.slug }))

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(Buffer.from(await response.arrayBuffer())).toEqual(png)
    expect(mocks.render).toHaveBeenCalledOnce()
  })

  it('rejects unsupported image methods before body parsing', async () => {
    const body = new ReadableStream<Uint8Array>()
    const request = new Request('http://framekit.test/api/framekit/images/render', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body,
      duplex: 'half'
    } as RequestInit)

    const response = await createFrameKitApiHandler([createEntry()])(request)

    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
    expect(await responseBody(response)).toEqual({ error: 'method_not_allowed', message: 'Method not allowed' })
    expect(request.bodyUsed).toBe(false)
    expect(mocks.prepare).not.toHaveBeenCalled()
  })

  it('returns 404 for unknown image actions and the removed versioned route', async () => {
    const handler = createFrameKitApiHandler([createEntry()])

    for (const pathname of ['/api/framekit/images/thumbnail', '/api/v1/images']) {
      const request = imageRequest('POST', pathname, { template: 'social/card' })
      const response = await handler(request)

      expect(response.status).toBe(404)
      expect(await responseBody(response)).toEqual({ error: 'not_found', message: 'Not found' })
      expect(request.bodyUsed).toBe(false)
    }
  })

  it('leaves access method dispatch with the access handler', async () => {
    const response = await createFrameKitApiHandler([])(imageRequest('GET', '/api/framekit/login'))

    expect(response.status).toBe(405)
    expect(response.headers.get('allow')).toBe('POST')
    expect(await responseBody(response)).toEqual({ error: 'method_not_allowed', message: 'Method not allowed' })
  })
})
