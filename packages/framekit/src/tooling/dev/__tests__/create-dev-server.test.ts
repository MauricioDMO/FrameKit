import { EventEmitter } from 'node:events'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { Readable } from 'node:stream'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createDevServer } from '@/tooling/dev/create-dev-server'

import { responseFor, type TestResponse } from './asset-upload/support'

const mocks = vi.hoisted(() => ({
  app: {
    prepare: vi.fn(),
    getRequestHandler: vi.fn(),
    getUpgradeHandler: vi.fn(),
    close: vi.fn()
  },
  watcher: { close: vi.fn() },
  createServer: vi.fn(),
  getSession: vi.fn(),
  handleAssetUpload: vi.fn(),
  isValidSessionSecret: vi.fn((value: unknown) => {
    if (typeof value !== 'string' || value.length !== Math.ceil(32 * 4 / 3) || !/^[A-Za-z0-9_-]+$/.test(value)) return false

    let decoded: Buffer
    try {
      decoded = Buffer.from(value, 'base64url')
    } catch {
      return false
    }

    return decoded.length === 32 && decoded.toString('base64url') === value
  }),
  next: vi.fn(),
  watchTemplates: vi.fn(),
  writeTemplateModule: vi.fn()
}))

vi.mock('node:http', () => ({ createServer: mocks.createServer }))
vi.mock('next', () => ({ default: mocks.next }))
vi.mock('@/server/access/sessions', () => ({ getSession: mocks.getSession, isValidSessionSecret: mocks.isValidSessionSecret }))
vi.mock('@/tooling/dev/asset-upload', () => ({ handleAssetUpload: mocks.handleAssetUpload }))
vi.mock('@/tooling/codegen/write-template-module', () => ({ writeTemplateModule: mocks.writeTemplateModule }))
vi.mock('@/tooling/dev/watch-templates', () => ({ watchTemplates: mocks.watchTemplates }))

const options = { projectRoot: '/tmp/framekit', hostname: '127.0.0.1', port: 0 }
const sessionSecret = Buffer.alloc(32, 1).toString('base64url')
const localHeaders = {
  host: '127.0.0.1:40000',
  origin: 'http://127.0.0.1:40000',
  cookie: `framekit_session=${sessionSecret}`
}

type RequestHandler = (request: IncomingMessage, response: ServerResponse) => void

class MockHttpServer extends EventEmitter {
  listening = false
  private boundPort = 0
  readonly requestHandler: RequestHandler

  readonly listen = vi.fn((port: number, _hostname: string, callback: () => void) => {
    const error = this.listenErrors.shift()
    if (error) {
      this.emit('error', error)
    } else {
      this.boundPort = port === 0 ? 40_000 : port
      this.listening = true
      callback()
    }

    return this
  })

  readonly address = vi.fn(() => ({
    address: '127.0.0.1',
    family: 'IPv4',
    port: this.boundPort
  }))

  readonly closeAllConnections = vi.fn()

  readonly close = vi.fn((callback: (error?: Error) => void) => {
    this.listening = false
    callback()
  })

  constructor (private readonly listenErrors: NodeJS.ErrnoException[] = [], requestHandler: RequestHandler = () => undefined) {
    super()
    this.requestHandler = requestHandler
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'true')
  mocks.next.mockReturnValue(mocks.app)
  mocks.app.prepare.mockResolvedValue(undefined)
  mocks.app.getRequestHandler.mockReturnValue(() => undefined)
  mocks.app.getUpgradeHandler.mockReturnValue(async () => undefined)
  mocks.app.close.mockResolvedValue(undefined)
  mocks.watcher.close.mockResolvedValue(undefined)
  mocks.watchTemplates.mockReturnValue(mocks.watcher)
  mocks.writeTemplateModule.mockResolvedValue([])
  mocks.getSession.mockReturnValue(undefined)
  mocks.handleAssetUpload.mockResolvedValue(true)
  mocks.createServer.mockImplementation((requestHandler: RequestHandler) => new MockHttpServer([], requestHandler))
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllEnvs()
})

function deferred (): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void
  const promise = new Promise<void>((_resolve) => {
    resolve = _resolve
  })
  return { promise, resolve }
}

function errnoError (code: string): NodeJS.ErrnoException {
  return Object.assign(new Error(code), { code })
}

function getWatchOptions (): {
  onStructureChange: () => void
  onError: (error: Error) => void
  } {
  const watchOptions = mocks.watchTemplates.mock.calls[0]?.[0]
  if (!watchOptions) throw new Error('Expected watcher options')
  return watchOptions
}

function sendRequest (server: MockHttpServer, headers: Record<string, string | undefined>, url = '/framekit/assets'): { request: IncomingMessage; response: TestResponse } {
  const request = Readable.from([]) as unknown as IncomingMessage
  Object.assign(request, { method: 'POST', url, headers })
  const response = responseFor()
  server.requestHandler(request, response as unknown as ServerResponse)
  return { request, response }
}

function getHttpServer (): MockHttpServer {
  const server = mocks.createServer.mock.results[0]?.value as MockHttpServer | undefined
  if (!server) throw new Error('Expected HTTP server')
  return server
}

describe('createDevServer', () => {
  it('reads the live process environment for each asset upload request', async () => {
    vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'false')
    const server = await createDevServer(options)

    try {
      const unauthenticated = sendRequest(getHttpServer(), {
        host: localHeaders.host,
        origin: localHeaders.origin
      })
      expect(unauthenticated.response.body).toBeUndefined()

      vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'true')
      const authenticated = sendRequest(getHttpServer(), localHeaders)
      expect(authenticated.response.statusCode).toBe(401)
      expect(authenticated.response.body).toBe(JSON.stringify({ error: 'Unauthorized' }))
      expect(mocks.handleAssetUpload).toHaveBeenCalledOnce()
    } finally {
      await server.close()
    }
  })

  it('passes the project and network options to Next', async () => {
    const server = await createDevServer({ ...options, hostname: 'studio.test', port: 4_321 })
    const httpServer = getHttpServer()

    expect(mocks.next).toHaveBeenCalledOnce()
    expect(mocks.next).toHaveBeenCalledWith({
      dev: true,
      dir: '/tmp/framekit',
      hostname: 'studio.test',
      port: 4_321,
      turbopack: true
    })
    expect(httpServer.listen).toHaveBeenCalledOnce()
    expect(httpServer.listen).toHaveBeenCalledWith(4_321, 'studio.test', expect.any(Function))
    expect(httpServer.address()).toMatchObject({ port: 4_321 })

    await server.close()
  })

  it.each([
    { name: 'missing cookie', headers: { host: localHeaders.host, origin: localHeaders.origin }, status: 401, error: 'Unauthorized' },
    { name: 'malformed cookie', headers: { ...localHeaders, cookie: 'framekit_session=malformed' }, status: 401, error: 'Unauthorized' },
    { name: 'malformed duplicate cookie', headers: { ...localHeaders, cookie: `${localHeaders.cookie}; framekit_session` }, status: 401, error: 'Unauthorized' },
    { name: 'bearer-only credentials', headers: { host: localHeaders.host, origin: localHeaders.origin, authorization: `Bearer ${sessionSecret}` }, status: 401, error: 'Unauthorized' },
    { name: 'cross-origin request without a cookie', headers: { host: localHeaders.host, origin: 'http://other.test:40000' }, status: 401, error: 'Unauthorized' },
    { name: 'missing Origin', headers: { host: localHeaders.host, cookie: localHeaders.cookie }, status: 403, error: 'Forbidden' },
    { name: 'null Origin', headers: { ...localHeaders, origin: 'null' }, status: 403, error: 'Forbidden' },
    { name: 'malformed Origin', headers: { ...localHeaders, origin: 'not a URL' }, status: 403, error: 'Forbidden' },
    { name: 'cross-origin Origin', headers: { ...localHeaders, origin: 'http://other.test:40000' }, status: 403, error: 'Forbidden' }
  ])('rejects $name before upload or file work', async ({ headers, status, error }) => {
    const server = await createDevServer(options)
    const generationCalls = mocks.writeTemplateModule.mock.calls.length

    try {
      const { response } = sendRequest(getHttpServer(), headers)

      expect(response.statusCode).toBe(status)
      expect(response.body).toBe(JSON.stringify({ error }))
      expect(mocks.getSession).not.toHaveBeenCalled()
      expect(mocks.handleAssetUpload).not.toHaveBeenCalled()
      expect(mocks.writeTemplateModule).toHaveBeenCalledTimes(generationCalls)
    } finally {
      await server.close()
    }
  })

  it('passes a valid local same-origin session to asset upload', async () => {
    mocks.getSession.mockReturnValue({ id: 'user-1', username: 'Alice', role: 'user' })
    const server = await createDevServer(options)

    try {
      const { response } = sendRequest(getHttpServer(), localHeaders)

      expect(response.body).toBeUndefined()
      expect(mocks.getSession).toHaveBeenCalledWith(sessionSecret, { env: expect.any(Object) })
      expect(mocks.handleAssetUpload).toHaveBeenCalledOnce()
    } finally {
      await server.close()
    }
  })

  it('allows a same-origin asset upload without authentication when disabled', async () => {
    vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'false')
    const server = await createDevServer(options)

    try {
      const { response } = sendRequest(getHttpServer(), {
        host: localHeaders.host,
        origin: localHeaders.origin
      })

      expect(response.body).toBeUndefined()
      expect(mocks.isValidSessionSecret).not.toHaveBeenCalled()
      expect(mocks.getSession).not.toHaveBeenCalled()
      expect(mocks.handleAssetUpload).toHaveBeenCalledOnce()
    } finally {
      await server.close()
    }
  })

  it('rejects cross-origin asset uploads without authentication', async () => {
    vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'false')
    mocks.getSession.mockReturnValue({ id: 'user-1', username: 'Alice', role: 'user' })
    const server = await createDevServer(options)

    try {
      const { response } = sendRequest(getHttpServer(), {
        ...localHeaders,
        origin: 'http://other.test:40000',
        cookie: localHeaders.cookie
      })

      expect(response.statusCode).toBe(403)
      expect(response.body).toBe(JSON.stringify({ error: 'Forbidden' }))
      expect(mocks.isValidSessionSecret).not.toHaveBeenCalled()
      expect(mocks.getSession).not.toHaveBeenCalled()
      expect(mocks.handleAssetUpload).not.toHaveBeenCalled()
    } finally {
      await server.close()
    }
  })

  it('returns a generic error for invalid authentication configuration', async () => {
    vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'invalid')
    const server = await createDevServer(options)

    try {
      const { response } = sendRequest(getHttpServer(), localHeaders)

      expect(response.statusCode).toBe(500)
      expect(response.body).toBe(JSON.stringify({ error: 'Internal server error' }))
      expect(response.body).not.toContain('FRAMEKIT_AUTH_ENABLED')
      expect(mocks.isValidSessionSecret).not.toHaveBeenCalled()
      expect(mocks.getSession).not.toHaveBeenCalled()
      expect(mocks.handleAssetUpload).not.toHaveBeenCalled()
    } finally {
      await server.close()
    }
  })

  it('rejects a canonical but unknown session before upload or file work', async () => {
    const server = await createDevServer(options)
    const generationCalls = mocks.writeTemplateModule.mock.calls.length

    try {
      const { response } = sendRequest(getHttpServer(), localHeaders)

      expect(response.statusCode).toBe(401)
      expect(response.body).toBe(JSON.stringify({ error: 'Unauthorized' }))
      expect(mocks.isValidSessionSecret).toHaveBeenCalledWith(sessionSecret)
      expect(mocks.getSession).toHaveBeenCalledWith(sessionSecret, { env: expect.any(Object) })
      expect(mocks.handleAssetUpload).not.toHaveBeenCalled()
      expect(mocks.writeTemplateModule).toHaveBeenCalledTimes(generationCalls)
    } finally {
      await server.close()
    }
  })

  it('returns a generic unauthorized response when session lookup throws', async () => {
    mocks.getSession.mockImplementation(() => {
      throw new Error('database unavailable')
    })
    const server = await createDevServer(options)

    try {
      const { response } = sendRequest(getHttpServer(), localHeaders)

      expect(response.statusCode).toBe(401)
      expect(response.body).toBe(JSON.stringify({ error: 'Unauthorized' }))
      expect(mocks.handleAssetUpload).not.toHaveBeenCalled()
    } finally {
      await server.close()
    }
  })

  it('accepts the external same-origin Origin through forwarded HTTPS headers', async () => {
    mocks.getSession.mockReturnValue({ id: 'user-1', username: 'Alice', role: 'user' })
    const server = await createDevServer(options)

    try {
      sendRequest(getHttpServer(), {
        host: '127.0.0.1:40000',
        origin: 'https://framekit.example.com',
        cookie: `framekit_session=${sessionSecret}`,
        'x-forwarded-proto': 'https, http',
        'x-forwarded-host': 'framekit.example.com, 127.0.0.1:40000'
      })

      expect(mocks.getSession).toHaveBeenCalledWith(sessionSecret, { env: expect.any(Object) })
      expect(mocks.handleAssetUpload).toHaveBeenCalledOnce()
    } finally {
      await server.close()
    }
  })

  it.each([
    { name: 'an invalid protocol', forwarded: { 'x-forwarded-proto': 'ftp', 'x-forwarded-host': 'framekit.example.com' } },
    { name: 'an invalid host', forwarded: { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'framekit.example.com/path' } },
    { name: 'a backslash in the host', forwarded: { 'x-forwarded-proto': 'https', 'x-forwarded-host': 'framekit.example.com\\' } },
    { name: 'an empty forwarded value', forwarded: { 'x-forwarded-proto': '', 'x-forwarded-host': 'framekit.example.com' } }
  ])('fails closed for $name', async ({ forwarded }) => {
    const server = await createDevServer(options)
    const generationCalls = mocks.writeTemplateModule.mock.calls.length

    try {
      const { response } = sendRequest(getHttpServer(), {
        host: '127.0.0.1:40000',
        origin: 'https://framekit.example.com',
        cookie: `framekit_session=${sessionSecret}`,
        ...forwarded
      })

      expect(response.statusCode).toBe(403)
      expect(response.body).toBe(JSON.stringify({ error: 'Forbidden' }))
      expect(mocks.getSession).not.toHaveBeenCalled()
      expect(mocks.handleAssetUpload).not.toHaveBeenCalled()
      expect(mocks.writeTemplateModule).toHaveBeenCalledTimes(generationCalls)
    } finally {
      await server.close()
    }
  })

  it('delegates non-asset requests to Next without session protection', async () => {
    const nextHandler = vi.fn()
    mocks.app.getRequestHandler.mockReturnValue(nextHandler)
    const server = await createDevServer(options)

    try {
      const result = sendRequest(getHttpServer(), {}, '/studio')

      expect(nextHandler).toHaveBeenCalledWith(result.request, result.response)
      expect(mocks.getSession).not.toHaveBeenCalled()
      expect(mocks.handleAssetUpload).not.toHaveBeenCalled()
    } finally {
      await server.close()
    }
  })

  it('keeps the private render path on the Next handler', async () => {
    const nextHandler = vi.fn()
    mocks.app.getRequestHandler.mockReturnValue(nextHandler)
    const server = await createDevServer(options)

    try {
      const result = sendRequest(getHttpServer(), {}, '/framekit/render/job-1')

      expect(nextHandler).toHaveBeenCalledWith(result.request, result.response)
      expect(mocks.getSession).not.toHaveBeenCalled()
      expect(mocks.handleAssetUpload).not.toHaveBeenCalled()
    } finally {
      await server.close()
    }
  })

  it('closes Next when prepare fails', async () => {
    const error = new Error('prepare failed')
    mocks.app.prepare.mockRejectedValue(error)

    await expect(createDevServer(options)).rejects.toBe(error)
    expect(mocks.app.close).toHaveBeenCalledOnce()
    expect(mocks.watcher.close).not.toHaveBeenCalled()
  })

  it('fails instead of binding a different port when the requested port is occupied', async () => {
    const error = errnoError('EADDRINUSE')
    const httpServer = new MockHttpServer([error])
    mocks.createServer.mockReturnValue(httpServer)

    await expect(createDevServer({ ...options, port: 4_100 })).rejects.toBe(error)

    expect(httpServer.listen).toHaveBeenCalledOnce()
    expect(httpServer.listen).toHaveBeenCalledWith(4_100, options.hostname, expect.any(Function))
    expect(mocks.watcher.close).toHaveBeenCalledOnce()
    expect(mocks.app.close).toHaveBeenCalledOnce()
  })

  it('cleans up when binding fails for a non-retryable error', async () => {
    const error = errnoError('EACCES')
    const httpServer = new MockHttpServer([error])
    mocks.createServer.mockReturnValue(httpServer)

    await expect(createDevServer(options)).rejects.toBe(error)
    expect(mocks.watcher.close).toHaveBeenCalledOnce()
    expect(mocks.app.close).toHaveBeenCalledOnce()
  })

  it('waits for the watcher before closing the HTTP server and Next', async () => {
    const releaseWatcher = deferred()
    const events: string[] = []
    mocks.watcher.close.mockImplementation(async () => {
      events.push('watcher:start')
      await releaseWatcher.promise
      events.push('watcher:end')
    })
    mocks.app.close.mockImplementation(async () => {
      events.push('app')
    })

    const server = await createDevServer(options)
    const httpServer = mocks.createServer.mock.results[0]?.value as MockHttpServer | undefined
    if (!httpServer) throw new Error('Expected HTTP server')

    const closing = server.close()
    await Promise.resolve()
    expect(events).toEqual(['watcher:start'])
    expect(mocks.app.close).not.toHaveBeenCalled()

    releaseWatcher.resolve()
    await closing

    expect(events).toEqual(['watcher:start', 'watcher:end', 'app'])
    expect(httpServer.closeAllConnections).toHaveBeenCalledOnce()
    expect(httpServer.close).toHaveBeenCalledOnce()
  })

  it('waits for Next to finish closing', async () => {
    const releaseApp = deferred()
    mocks.app.close.mockReturnValue(releaseApp.promise)

    const server = await createDevServer(options)
    const closing = server.close()
    await vi.waitFor(() => expect(mocks.app.close).toHaveBeenCalledOnce())

    let settled = false
    closing.then(() => {
      settled = true
    })
    await Promise.resolve()
    expect(settled).toBe(false)

    releaseApp.resolve()
    await closing
    expect(settled).toBe(true)
  })

  it('surfaces watcher cleanup errors after closing Next', async () => {
    const error = new Error('watcher close failed')
    mocks.watcher.close.mockRejectedValue(error)

    const server = await createDevServer(options)

    await expect(server.close()).rejects.toBe(error)
    expect(mocks.app.close).toHaveBeenCalledOnce()
  })

  it('surfaces Next cleanup errors', async () => {
    const error = new Error('Next close failed')
    mocks.app.close.mockRejectedValue(error)

    const server = await createDevServer(options)

    await expect(server.close()).rejects.toBe(error)
    expect(mocks.watcher.close).toHaveBeenCalledOnce()
  })

  it('reports watcher errors through the configured callback', async () => {
    const onError = vi.fn()
    const error = new Error('watcher failed')
    const server = await createDevServer({ ...options, onError })

    getWatchOptions().onError(error)

    expect(onError).toHaveBeenCalledOnce()
    expect(onError).toHaveBeenCalledWith(error)
    await server.close()
  })

  it('coalesces template changes while generation is running', async () => {
    let generationCount = 0
    const secondGenerationStarted = deferred()
    const thirdGenerationStarted = deferred()
    const releaseSecondGeneration = deferred()

    mocks.writeTemplateModule.mockImplementation(async () => {
      generationCount += 1
      if (generationCount === 2) {
        secondGenerationStarted.resolve()
        await releaseSecondGeneration.promise
      }
      if (generationCount === 3) thirdGenerationStarted.resolve()
      return []
    })

    const server = await createDevServer(options)
    const watchOptions = getWatchOptions()

    watchOptions.onStructureChange()
    await secondGenerationStarted.promise
    watchOptions.onStructureChange()
    watchOptions.onStructureChange()
    expect(mocks.writeTemplateModule).toHaveBeenCalledTimes(2)

    releaseSecondGeneration.resolve()
    await thirdGenerationStarted.promise
    await server.close()

    expect(mocks.writeTemplateModule).toHaveBeenCalledTimes(3)
  })
})
