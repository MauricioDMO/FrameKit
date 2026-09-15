import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

import { createStudioAccessHandler } from '@/server'
import { getDatabase, resetDatabaseForTests } from '@/server/access/database'
import { hashPassword } from '@/server/access/passwords'
import { createSession, getSession } from '@/server/access/sessions'

const origin = 'https://framekit.test'
const internalOrigin = 'http://127.0.0.1:3000'
const reverseProxyOrigin = 'https://framekit.example.com'
const password = 'correct horse battery staple'
const changedPassword = 'another correct battery staple'
const accessRequestLimit = 64 * 1024
const sessionLifetimeMs = 30 * 24 * 60 * 60 * 1000
const environmentKeys = ['FRAMEKIT_DATABASE_PATH', 'FRAMEKIT_ADMIN_USERNAME', 'FRAMEKIT_ADMIN_PASSWORD', 'FRAMEKIT_API_KEY', 'FRAMEKIT_PUBLIC_ORIGIN', 'NODE_ENV'] as const

let passwordHash = ''
let originalEnvironment: Partial<Record<typeof environmentKeys[number], string>>
let temporaryRoot = ''
let handler: (request: Request) => Promise<Response>

beforeAll(async () => {
  passwordHash = await hashPassword(password)
})

beforeEach(async () => {
  resetDatabaseForTests()
  originalEnvironment = {}
  for (const key of environmentKeys) {
    originalEnvironment[key] = process.env[key]
    delete process.env[key]
  }

  temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-http-'))
  process.env.FRAMEKIT_DATABASE_PATH = path.join(temporaryRoot, 'framekit.sqlite')
  handler = createStudioAccessHandler()
})

afterEach(async () => {
  vi.useRealTimers()
  resetDatabaseForTests()
  for (const key of environmentKeys) {
    const value = originalEnvironment[key]
    if (value === undefined) delete process.env[key]
    else (process.env as Record<string, string>)[key] = value
  }
  await rm(temporaryRoot, { recursive: true, force: true })
})

afterAll(() => {
  vi.useRealTimers()
})

function insertUser (id: string, username: string, options: { active?: boolean; passwordHash?: string; role?: 'admin' | 'user' } = {}): { id: string; username: string; role: 'admin' | 'user' } {
  const user = { id, username, role: options.role ?? 'user' }
  getDatabase().prepare(`
    INSERT INTO users (id, username, password_hash, role, active, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(user.id, user.username, options.passwordHash ?? passwordHash, user.role, options.active === false ? 0 : 1, 1, 1)
  return user
}

function sessionCount (): number {
  return getDatabase().prepare('SELECT COUNT(*) AS count FROM sessions').get()?.count as number
}

function jsonRequest (pathname: string, method: string, body: unknown, headers: Record<string, string> = {}, requestOrigin = origin, requestUrlOrigin = requestOrigin): Request {
  return new Request(`${requestUrlOrigin}${pathname}`, {
    method,
    headers: {
      'content-type': 'application/json',
      Origin: requestOrigin,
      ...headers
    },
    body: JSON.stringify(body)
  })
}

function rawRequest (pathname: string, method: string, body: string, headers: Record<string, string> = {}): Request {
  return new Request(`${origin}${pathname}`, {
    method,
    headers: {
      'content-type': 'application/json',
      Origin: origin,
      ...headers
    },
    body
  })
}

function missingOriginRequest (pathname: string, method: string, body: string): Request {
  return new Request(`${origin}${pathname}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body
  })
}

function emptyRequest (pathname: string, method: string, headers: Record<string, string> = {}): Request {
  return new Request(`${origin}${pathname}`, { method, headers })
}

function streamRequest (pathname: string, method: string, chunks: Uint8Array[], headers: Record<string, string> = {}): Request {
  const stream = new ReadableStream<Uint8Array>({
    start (controller) {
      for (const chunk of chunks) controller.enqueue(chunk)
      controller.close()
    }
  })
  const request = new Request(`${origin}${pathname}`, {
    method,
    headers: {
      'content-type': 'application/json',
      Origin: origin,
      ...headers
    },
    body: stream,
    duplex: 'half'
  } as RequestInit)
  return request
}

function sessionCookie (secret: string): string {
  return `framekit_session=${secret}`
}

function responseCookie (response: Response): string {
  const cookie = response.headers.get('set-cookie')
  if (cookie === null) throw new Error('Expected Set-Cookie')
  return cookie
}

async function responseBody (response: Response): Promise<Record<string, unknown>> {
  return await response.json() as Record<string, unknown>
}

function expectJsonResponse (response: Response): void {
  expect(response.headers.get('cache-control')).toBe('no-store')
  expect(response.headers.get('content-type')).toBe('application/json')
}

describe('createStudioAccessHandler', () => {
  it('does not initialize SQLite during public import or factory creation', () => {
    expect(existsSync(path.join(temporaryRoot, 'framekit.sqlite'))).toBe(false)
    expect(handler).toBeTypeOf('function')
    expect(existsSync(path.join(temporaryRoot, 'framekit.sqlite'))).toBe(false)
  })

  it('bootstraps the first administrator and sets every login cookie attribute', async () => {
    const now = new Date('2026-09-14T12:34:56.789Z')
    vi.useFakeTimers()
    vi.setSystemTime(now)
    process.env.FRAMEKIT_ADMIN_PASSWORD = password
    vi.stubEnv('NODE_ENV', 'production')

    const response = await handler(jsonRequest('/api/framekit/login', 'POST', { username: 'admin', password }))
    const body = await responseBody(response)
    const cookie = responseCookie(response)

    expect(response.status).toBe(200)
    expectJsonResponse(response)
    expect(body).toMatchObject({ username: 'admin', role: 'admin' })
    expect(Object.keys(body)).toEqual(['id', 'username', 'role'])
    expect(JSON.stringify(body)).not.toContain(password)
    expect(cookie).toMatch(/^framekit_session=[A-Za-z0-9_-]{43}; /)
    expect(cookie).toContain('; HttpOnly')
    expect(cookie).toContain('; SameSite=Lax')
    expect(cookie).toContain('; Path=/')
    expect(cookie).toContain('; Max-Age=2592000')
    expect(cookie).toContain(`; Expires=${new Date(now.getTime() + sessionLifetimeMs).toUTCString()}`)
    expect(cookie).toContain('; Secure')
  }, 30_000)

  it('accepts same-origin HTTPS login and account mutation through an HTTP reverse proxy', async () => {
    const user = insertUser('proxy-user', 'ProxyUser')
    vi.stubEnv('NODE_ENV', 'production')
    expect(process.env.FRAMEKIT_PUBLIC_ORIGIN).toBeUndefined()
    const proxyHeaders = {
      'x-forwarded-proto': 'https',
      'x-forwarded-host': 'framekit.example.com'
    }

    // Next forwards an internal URL to the route adapter while preserving the
    // proxy's canonical HTTPS origin headers.
    const loginResponse = await handler(jsonRequest('/api/framekit/login', 'POST', { username: user.username, password }, proxyHeaders, reverseProxyOrigin, internalOrigin))
    const loginBody = await responseBody(loginResponse)
    const cookie = responseCookie(loginResponse).split(';', 1)[0]

    expect(loginResponse.status).toBe(200)
    expectJsonResponse(loginResponse)
    expect(loginBody).toEqual(user)
    expect(Object.keys(loginBody)).toEqual(['id', 'username', 'role'])
    expect(responseCookie(loginResponse)).toContain('; Secure')

    const patchResponse = await handler(jsonRequest('/api/framekit/account', 'PATCH', { username: 'ProxyRenamed' }, { ...proxyHeaders, Cookie: cookie }, reverseProxyOrigin, internalOrigin))
    const patchBody = await responseBody(patchResponse)

    expect(patchResponse.status).toBe(200)
    expectJsonResponse(patchResponse)
    expect(patchBody).toEqual({ ...user, username: 'ProxyRenamed' })
    expect(Object.keys(patchBody)).toEqual(['id', 'username', 'role'])
  }, 30_000)

  const forwardedOriginCases: Array<{ name: string; headers: Record<string, string> }> = [
    { name: 'a non-HTTPS forwarded protocol', headers: { 'x-forwarded-proto': 'http', 'x-forwarded-host': 'framekit.example.com' } },
    { name: 'an incomplete forwarded origin', headers: { 'x-forwarded-proto': 'https' } },
    { name: 'a malformed forwarded host', headers: { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'framekit.example.com/path' } },
    { name: 'an ambiguous forwarded origin', headers: { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'framekit.example.com, attacker.example.com' } }
  ]

  it.each(forwardedOriginCases)('rejects $name before using a public origin', async ({ headers }) => {
    const request = jsonRequest('/api/framekit/login', 'POST', { username: 'ProxyUser', password }, headers, reverseProxyOrigin, internalOrigin)
    const response = await handler(request)

    expect(response.status).toBe(403)
    expect(await responseBody(response)).toEqual({ error: 'forbidden', message: 'Forbidden' })
    expect(request.bodyUsed).toBe(false)
  })

  it('does not use FRAMEKIT_PUBLIC_ORIGIN when forwarding headers are absent', async () => {
    process.env.FRAMEKIT_PUBLIC_ORIGIN = reverseProxyOrigin
    const request = jsonRequest('/api/framekit/login', 'POST', { username: 'ProxyUser', password }, {}, reverseProxyOrigin, internalOrigin)
    const response = await handler(request)

    expect(response.status).toBe(403)
    expect(await responseBody(response)).toEqual({ error: 'forbidden', message: 'Forbidden' })
    expect(request.bodyUsed).toBe(false)
  })

  it('uses one 401 response for unknown, inactive, wrong, and invalid credentials', async () => {
    insertUser('active-user', 'Alice')
    insertUser('inactive-user', 'Inactive', { active: false })
    const cases: Array<{ username: unknown; password: unknown }> = [
      { username: 'Missing', password },
      { username: 'Inactive', password },
      { username: 'Alice', password: 'wrong password' },
      { username: 'bad!', password },
      { username: 'Alice', password: 'short' },
      { username: 42, password }
    ]

    for (const credentials of cases) {
      const response = await handler(jsonRequest('/api/framekit/login', 'POST', credentials))
      expect(response.status).toBe(401)
      expectJsonResponse(response)
      expect(await responseBody(response)).toEqual({ error: 'unauthorized', message: 'Unauthorized' })
      expect(response.headers.get('set-cookie')).toBeNull()
    }
    expect(sessionCount()).toBe(0)
  }, 30_000)

  it('rejects malformed JSON and non-exact access bodies', async () => {
    const requests = [
      rawRequest('/api/framekit/login', 'POST', '{'),
      rawRequest('/api/framekit/login', 'POST', '[]'),
      jsonRequest('/api/framekit/login', 'POST', { username: 'Alice' }),
      jsonRequest('/api/framekit/login', 'POST', { username: 'Alice', password, extra: true }),
      rawRequest('/api/framekit/login', 'POST', JSON.stringify({ username: 'Alice', password }), { 'content-type': 'text/plain' })
    ]

    for (const request of requests) {
      const response = await handler(request)
      expect(response.status).toBe(400)
      expectJsonResponse(response)
      expect(await responseBody(response)).toEqual({ error: 'invalid_request', message: 'Invalid request' })
      expect(response.headers.get('set-cookie')).toBeNull()
    }
  })

  it('enforces the 64 KiB encoded limit and strict UTF-8 decoding', async () => {
    const declaredTooLarge = rawRequest('/api/framekit/login', 'POST', '{}', { 'content-length': String(accessRequestLimit + 1) })
    const declaredResponse = await handler(declaredTooLarge)
    expect(declaredResponse.status).toBe(413)
    expect(await responseBody(declaredResponse)).toEqual({ error: 'request_too_large', message: 'Request body exceeds the size limit' })
    expect(declaredTooLarge.bodyUsed).toBe(false)

    const streamedTooLarge = streamRequest('/api/framekit/login', 'POST', [new Uint8Array(accessRequestLimit), new Uint8Array([32])])
    const streamedResponse = await handler(streamedTooLarge)
    expect(streamedResponse.status).toBe(413)
    expect(await responseBody(streamedResponse)).toEqual({ error: 'request_too_large', message: 'Request body exceeds the size limit' })

    const exactBody = JSON.stringify({ username: 'Alice', password, extra: true })
    const exact = `${exactBody}${' '.repeat(accessRequestLimit - Buffer.byteLength(exactBody, 'utf8'))}`
    const exactResponse = await handler(rawRequest('/api/framekit/login', 'POST', exact, { 'content-length': String(accessRequestLimit) }))
    expect(exactResponse.status).toBe(400)
    expect(await responseBody(exactResponse)).toEqual({ error: 'invalid_request', message: 'Invalid request' })

    const malformedUtf8 = streamRequest('/api/framekit/login', 'POST', [new Uint8Array([0xc3, 0x28])])
    const malformedResponse = await handler(malformedUtf8)
    expect(malformedResponse.status).toBe(400)
    expect(await responseBody(malformedResponse)).toEqual({ error: 'invalid_request', message: 'Invalid request' })
  })

  it('returns the safe account DTO and updates only the active session user', async () => {
    const user = insertUser('account-user', 'Alice')
    const secret = createSession(user.id)

    const getResponse = await handler(emptyRequest('/api/framekit/account', 'GET', { Cookie: sessionCookie(secret) }))
    expect(getResponse.status).toBe(200)
    expectJsonResponse(getResponse)
    expect(await responseBody(getResponse)).toEqual(user)

    const patchResponse = await handler(jsonRequest('/api/framekit/account', 'PATCH', { username: 'Renamed.User' }, { Cookie: sessionCookie(secret) }))
    expect(patchResponse.status).toBe(200)
    const patchBody = await responseBody(patchResponse)
    expect(patchBody).toEqual({ ...user, username: 'Renamed.User' })

    const renamedResponse = await handler(emptyRequest('/api/framekit/account', 'GET', { Cookie: sessionCookie(secret) }))
    expect(await responseBody(renamedResponse)).toEqual({ ...user, username: 'Renamed.User' })
    expect(JSON.stringify(patchBody)).not.toContain('password_hash')
  })

  it('maps invalid and duplicate username mutations to stable responses', async () => {
    const first = insertUser('first-user', 'FirstUser')
    insertUser('second-user', 'SecondUser')
    const secret = createSession(first.id)

    const duplicate = await handler(jsonRequest('/api/framekit/account', 'PATCH', { username: 'seconduser' }, { Cookie: sessionCookie(secret) }))
    expect(duplicate.status).toBe(409)
    expectJsonResponse(duplicate)
    expect(await responseBody(duplicate)).toEqual({ error: 'conflict', message: 'Conflict' })

    const invalid = await handler(jsonRequest('/api/framekit/account', 'PATCH', { username: 'bad!' }, { Cookie: sessionCookie(secret) }))
    expect(invalid.status).toBe(400)
    expect(await responseBody(invalid)).toEqual({ error: 'invalid_request', message: 'Invalid request' })
    expect(getDatabase().prepare('SELECT username FROM users WHERE id = ?').get(first.id)?.username).toBe(first.username)
  })

  it('verifies the current password, invalidates every session, and expires the cookie', async () => {
    const user = insertUser('password-user', 'PasswordUser')
    const firstSecret = createSession(user.id)
    const secondSecret = createSession(user.id)

    const wrong = await handler(jsonRequest('/api/framekit/account/password', 'POST', { currentPassword: 'wrong password', newPassword: changedPassword }, { Cookie: sessionCookie(firstSecret) }))
    expect(wrong.status).toBe(401)
    expect(await responseBody(wrong)).toEqual({ error: 'unauthorized', message: 'Unauthorized' })
    expect(sessionCount()).toBe(2)

    const response = await handler(jsonRequest('/api/framekit/account/password', 'POST', { currentPassword: password, newPassword: changedPassword }, { Cookie: sessionCookie(firstSecret) }))
    const cookie = responseCookie(response)
    expect(response.status).toBe(200)
    expect(await responseBody(response)).toEqual({ status: 'ok' })
    expect(cookie).toContain('framekit_session=;')
    expect(cookie).toContain('Max-Age=0')
    expect(cookie).toContain(`Expires=${new Date(0).toUTCString()}`)
    expect(getSession(firstSecret)).toBeUndefined()
    expect(getSession(secondSecret)).toBeUndefined()
    expect(sessionCount()).toBe(0)

    const afterPassword = await handler(emptyRequest('/api/framekit/account', 'GET', { Cookie: sessionCookie(firstSecret) }))
    expect(afterPassword.status).toBe(401)
  }, 30_000)

  it('rejects invalid new passwords without changing the session', async () => {
    const user = insertUser('invalid-password-user', 'PasswordUser')
    const secret = createSession(user.id)

    const response = await handler(jsonRequest('/api/framekit/account/password', 'POST', { currentPassword: password, newPassword: 'short' }, { Cookie: sessionCookie(secret) }))
    expect(response.status).toBe(400)
    expect(await responseBody(response)).toEqual({ error: 'invalid_request', message: 'Invalid request' })
    expect(getSession(secret)).toEqual(user)
    expect(response.headers.get('set-cookie')).toBeNull()
  }, 30_000)

  it('makes logout idempotent and expires the cookie for missing, invalid, and valid cookies', async () => {
    const user = insertUser('logout-user', 'LogoutUser')
    const secret = createSession(user.id)

    for (const cookie of [undefined, 'framekit_session=malformed']) {
      const headers: Record<string, string> = { Origin: origin }
      if (cookie !== undefined) headers.Cookie = cookie
      const response = await handler(emptyRequest('/api/framekit/logout', 'POST', { Origin: origin, ...headers }))
      expect(response.status).toBe(200)
      expectJsonResponse(response)
      expect(await responseBody(response)).toEqual({ status: 'ok' })
      const responseCookieHeader = responseCookie(response)
      expect(responseCookieHeader).toContain('framekit_session=;')
      expect(responseCookieHeader).not.toContain('; Secure')
    }

    const response = await handler(emptyRequest('/api/framekit/logout', 'POST', { Origin: origin, Cookie: sessionCookie(secret) }))
    expect(response.status).toBe(200)
    expect(await responseBody(response)).toEqual({ status: 'ok' })
    expect(responseCookie(response)).toContain('Max-Age=0')
    expect(sessionCount()).toBe(0)
  })

  it('rejects missing, null, malformed, and cross-origin headers before body or database work', async () => {
    process.env.FRAMEKIT_ADMIN_PASSWORD = password
    const requests = [
      missingOriginRequest('/api/framekit/login', 'POST', JSON.stringify({ username: 'admin', password })),
      rawRequest('/api/framekit/login', 'POST', JSON.stringify({ username: 'admin', password }), { Origin: 'null' }),
      rawRequest('/api/framekit/login', 'POST', JSON.stringify({ username: 'admin', password }), { Origin: 'not a URL' }),
      rawRequest('/api/framekit/login', 'POST', JSON.stringify({ username: 'admin', password }), { Origin: 'https://other.test' })
    ]

    for (const request of requests) {
      const response = await handler(request)
      expect(response.status).toBe(403)
      expectJsonResponse(response)
      expect(await responseBody(response)).toEqual({ error: 'forbidden', message: 'Forbidden' })
      expect(request.bodyUsed).toBe(false)
    }
    expect(existsSync(path.join(temporaryRoot, 'framekit.sqlite'))).toBe(false)
  })

  it('rejects cookie-authenticated unsafe mutations before parsing or mutating', async () => {
    const user = insertUser('origin-user', 'OriginUser')
    const secret = createSession(user.id)
    const cookie = sessionCookie(secret)

    const patch = jsonRequest('/api/framekit/account', 'PATCH', { username: 'ChangedUser' }, { Cookie: cookie, Origin: 'https://other.test' })
    const patchResponse = await handler(patch)
    expect(patchResponse.status).toBe(403)
    expect(patch.bodyUsed).toBe(false)

    const logout = emptyRequest('/api/framekit/logout', 'POST', { Cookie: cookie, Origin: 'https://other.test' })
    const logoutResponse = await handler(logout)
    expect(logoutResponse.status).toBe(403)
    expect(logoutResponse.headers.get('set-cookie')).toBeNull()
    expect(getSession(secret)).toEqual(user)
    expect(getDatabase().prepare('SELECT username FROM users WHERE id = ?').get(user.id)?.username).toBe(user.username)
  })

  it('matches exact paths and methods without disclosing route names', async () => {
    const requests = [
      { request: emptyRequest('/api/framekit/tokens', 'GET'), status: 404, allow: null },
      { request: emptyRequest('/api/framekit/login/', 'POST'), status: 404, allow: null },
      { request: emptyRequest('/api/framekit/login', 'GET'), status: 405, allow: 'POST' },
      { request: emptyRequest('/api/framekit/account', 'POST'), status: 405, allow: 'GET, PATCH' },
      { request: emptyRequest('/api/framekit/account/password', 'GET'), status: 405, allow: 'POST' }
    ]

    for (const { request, status, allow } of requests) {
      const response = await handler(request)
      const body = await responseBody(response)
      expect(response.status).toBe(status)
      expectJsonResponse(response)
      expect(response.headers.get('allow')).toBe(allow)
      expect(JSON.stringify(body)).not.toContain('framekit')
      expect(JSON.stringify(body)).not.toContain('account')
    }
  })
})
