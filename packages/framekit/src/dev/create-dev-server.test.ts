import { EventEmitter } from 'node:events'

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  app: {
    prepare: vi.fn(),
    getRequestHandler: vi.fn(),
    getUpgradeHandler: vi.fn(),
    close: vi.fn(),
  },
  watcher: { close: vi.fn() },
  createServer: vi.fn(),
  next: vi.fn(),
  watchTemplates: vi.fn(),
  writeTemplateModule: vi.fn(),
}))

vi.mock('node:http', () => ({ createServer: mocks.createServer }))
vi.mock('next', () => ({ default: mocks.next }))
vi.mock('../codegen/write-template-module', () => ({ writeTemplateModule: mocks.writeTemplateModule }))
vi.mock('./watch-templates', () => ({ watchTemplates: mocks.watchTemplates }))

import { createDevServer } from './create-dev-server'

const options = { projectRoot: '/tmp/framekit', hostname: '127.0.0.1', port: 0 }

class MockHttpServer extends EventEmitter {
  listening = false
  private boundPort = 0

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
    port: this.boundPort,
  }))

  readonly closeAllConnections = vi.fn()

  readonly close = vi.fn((callback: (error?: Error) => void) => {
    this.listening = false
    callback()
  })

  constructor(private readonly listenErrors: NodeJS.ErrnoException[] = []) {
    super()
  }
}

beforeEach(() => {
  vi.clearAllMocks()
  mocks.next.mockReturnValue(mocks.app)
  mocks.app.prepare.mockResolvedValue(undefined)
  mocks.app.getRequestHandler.mockReturnValue(() => undefined)
  mocks.app.getUpgradeHandler.mockReturnValue(async () => undefined)
  mocks.app.close.mockResolvedValue(undefined)
  mocks.watcher.close.mockResolvedValue(undefined)
  mocks.watchTemplates.mockReturnValue(mocks.watcher)
  mocks.writeTemplateModule.mockResolvedValue([])
  mocks.createServer.mockImplementation(() => new MockHttpServer())
})

afterEach(() => {
  vi.restoreAllMocks()
})

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

function errnoError(code: string): NodeJS.ErrnoException {
  return Object.assign(new Error(code), { code })
}

function getWatchOptions(): {
  onStructureChange: () => void
  onError: (error: Error) => void
} {
  const watchOptions = mocks.watchTemplates.mock.calls[0]?.[0]
  if (!watchOptions) throw new Error('Expected watcher options')
  return watchOptions
}

describe('createDevServer', () => {
  it('passes the project and network options to Next', async () => {
    const server = await createDevServer({ ...options, hostname: 'studio.test', port: 4_321 })

    expect(mocks.next).toHaveBeenCalledOnce()
    expect(mocks.next).toHaveBeenCalledWith({
      dev: true,
      dir: '/tmp/framekit',
      hostname: 'studio.test',
      port: 4_321,
      turbopack: true,
    })

    await server.close()
  })

  it('closes Next when prepare fails', async () => {
    const error = new Error('prepare failed')
    mocks.app.prepare.mockRejectedValue(error)

    await expect(createDevServer(options)).rejects.toBe(error)
    expect(mocks.app.close).toHaveBeenCalledOnce()
    expect(mocks.watcher.close).not.toHaveBeenCalled()
  })

  it('uses the next port when the requested port is occupied', async () => {
    const httpServer = new MockHttpServer([errnoError('EADDRINUSE')])
    mocks.createServer.mockReturnValue(httpServer)
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined)

    const server = await createDevServer({ ...options, port: 4_100 })

    expect(httpServer.listen).toHaveBeenNthCalledWith(1, 4_100, options.hostname, expect.any(Function))
    expect(httpServer.listen).toHaveBeenNthCalledWith(2, 4_101, options.hostname, expect.any(Function))
    expect(log).toHaveBeenCalledWith(`FrameKit Studio: http://${options.hostname}:4101`)

    await server.close()
  })

  it('stops retrying at the maximum port', async () => {
    const error = errnoError('EADDRINUSE')
    const httpServer = new MockHttpServer([error])
    mocks.createServer.mockReturnValue(httpServer)

    await expect(createDevServer({ ...options, port: 65_535 })).rejects.toBe(error)
    expect(httpServer.listen).toHaveBeenCalledOnce()
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
    void closing.then(() => {
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
