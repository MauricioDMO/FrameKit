import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createApiToken, revokeApiToken } from '@/server/access/api-tokens'
import { getDatabase, resetDatabaseForTests } from '@/server/access/database'
import { createSession } from '@/server/access/sessions'
import { updateUser } from '@/server/access/users'
import { createStudioImageHandler } from '@/server/image-handler'
import { defineTemplate } from '@/index'
import type { TemplateAssetManifest, TemplateRegistryEntry } from '@/types'

const mocks = vi.hoisted(() => ({
  prepare: vi.fn(),
  render: vi.fn()
}))

vi.mock('@/server/image-input', () => ({ prepareRenderInputs: mocks.prepare }))
vi.mock('@/server/render-image', () => ({ renderTemplateImage: mocks.render }))

const png = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
const emptyAssets: TemplateAssetManifest = { common: {}, variants: {} }
const definition = defineTemplate({
  meta: { title: 'Studio image handler test' },
  width: 1200,
  height: 630,
  fields: {},
  content: { default: {} },
  variants: { default: 'default' },
  render: () => null
})

let originalDatabasePath: string | undefined
let temporaryRoot = ''

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

function insertUser (id = 'studio-user', active = true): { id: string; username: string; role: 'user' } {
  const user = { id, username: id, role: 'user' as const }
  getDatabase().prepare(`
    INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, user.username, 'test-hash', user.role, active ? 1 : 0, 1, 1)
  return user
}

function requestFor (body: unknown = { template: 'social/card' }, url = 'http://framekit.test/api/framekit/images/render', headers: Record<string, string> = {}): Request {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body)
  })
}

async function responseBody (response: Response): Promise<Record<string, unknown>> {
  return await response.json() as Record<string, unknown>
}

beforeEach(async () => {
  resetDatabaseForTests()
  originalDatabasePath = process.env.FRAMEKIT_DATABASE_PATH
  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-studio-image-'))
  process.env.FRAMEKIT_DATABASE_PATH = path.join(temporaryRoot, 'framekit.sqlite')
  vi.stubEnv('FRAMEKIT_INTERNAL_ORIGIN', 'http://127.0.0.1:3000')
  vi.stubEnv('FRAMEKIT_ALLOWED_IMAGE_HOSTS', '')
  vi.stubEnv('FRAMEKIT_MAX_CONCURRENT_RENDERS', '2')
  vi.stubEnv('FRAMEKIT_RENDER_TIMEOUT_MS', '30000')
  vi.clearAllMocks()
  mocks.prepare.mockImplementation(async ({ data, assets }: { data: Record<string, unknown>; assets: TemplateAssetManifest }) => ({ edits: data, assets }))
  mocks.render.mockResolvedValue(png)
})

afterEach(async () => {
  resetDatabaseForTests()
  if (originalDatabasePath === undefined) delete process.env.FRAMEKIT_DATABASE_PATH
  else process.env.FRAMEKIT_DATABASE_PATH = originalDatabasePath
  await rm(temporaryRoot, { recursive: true, force: true })
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

describe('createStudioImageHandler', () => {
  it('accepts a valid API token and records last use', async () => {
    const user = insertUser()
    const token = createApiToken(user.id, 'Studio render')
    const response = await createStudioImageHandler([createEntry()])(requestFor(undefined, undefined, { authorization: `Bearer ${token.token}` }))

    expect(response.status).toBe(200)
    expect(response.headers.get('content-type')).toBe('image/png')
    expect(Buffer.from(await response.arrayBuffer())).toEqual(png)
    expect(getDatabase().prepare('SELECT last_used_at FROM api_tokens WHERE id = ?').get(token.id)?.last_used_at).toEqual(expect.any(Number))
  })

  it('accepts a valid same-origin session, including the HTTPS reverse-proxy origin', async () => {
    const user = insertUser()
    const secret = createSession(user.id)
    const response = await createStudioImageHandler([createEntry()])(requestFor(undefined, 'http://framekit.test/api/framekit/images/render', {
      Cookie: `framekit_session=${secret}`,
      Origin: 'http://framekit.test'
    }))

    expect(response.status).toBe(200)

    const proxySecret = createSession(user.id)
    const proxyResponse = await createStudioImageHandler([createEntry()])(requestFor(undefined, 'http://0.0.0.0:3000/api/framekit/images/render', {
      Cookie: `framekit_session=${proxySecret}`,
      Origin: 'https://framekit.example.com',
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'framekit.example.com'
    }))

    expect(proxyResponse.status).toBe(200)
  })

  it('does not fall back to a session when an invalid Bearer header is present', async () => {
    const user = insertUser()
    const secret = createSession(user.id)
    const body = new ReadableStream<Uint8Array>()
    const request = new Request('http://framekit.test/api/framekit/images/render', {
      method: 'POST',
      headers: {
        authorization: 'Bearer invalid',
        Cookie: `framekit_session=${secret}`,
        Origin: 'http://framekit.test',
        'content-type': 'application/json'
      },
      body,
      duplex: 'half'
    } as RequestInit)

    const response = await createStudioImageHandler([createEntry()])(request)

    expect(response.status).toBe(401)
    expect(request.bodyUsed).toBe(false)
    expect(mocks.prepare).not.toHaveBeenCalled()
    expect(mocks.render).not.toHaveBeenCalled()
  })

  it('rejects revoked tokens, inactive users, expired sessions, and cross-origin sessions before rendering', async () => {
    const user = insertUser()
    const handler = createStudioImageHandler([createEntry()])
    const token = createApiToken(user.id, 'Revoked')
    revokeApiToken(token.id, user)
    const revoked = await handler(requestFor(undefined, undefined, { authorization: `Bearer ${token.token}` }))
    expect(revoked.status).toBe(401)

    const inactiveToken = createApiToken(user.id, 'Inactive')
    updateUser(user.id, { active: false })
    const inactive = await handler(requestFor(undefined, undefined, { authorization: `Bearer ${inactiveToken.token}` }))
    expect(inactive.status).toBe(401)

    const activeUser = insertUser('active-user')
    const expiredSecret = createSession(activeUser.id)
    getDatabase().prepare('UPDATE sessions SET expires_at = 0 WHERE token_hash IS NOT NULL').run()
    const expired = await handler(requestFor(undefined, undefined, {
      Cookie: `framekit_session=${expiredSecret}`,
      Origin: 'http://framekit.test'
    }))
    expect(expired.status).toBe(401)

    const crossOriginSecret = createSession(activeUser.id)
    const crossOrigin = await handler(requestFor(undefined, undefined, {
      Cookie: `framekit_session=${crossOriginSecret}`,
      Origin: 'https://other.example'
    }))
    expect(crossOrigin.status).toBe(401)
    expect(mocks.prepare).not.toHaveBeenCalled()
    expect(mocks.render).not.toHaveBeenCalled()
    expect(await responseBody(crossOrigin)).toMatchObject({ error: 'unauthorized' })
  })
})
