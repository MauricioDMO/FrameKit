import { createServer, type Server } from 'node:http'

import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  app: {
    prepare: vi.fn(),
    getRequestHandler: vi.fn(),
    getUpgradeHandler: vi.fn(),
    close: vi.fn(),
  },
  watcher: { close: vi.fn() },
  watchTemplates: vi.fn(),
  writeTemplateModule: vi.fn(),
}))

vi.mock('next', () => ({ default: vi.fn(() => mocks.app) }))
vi.mock('../codegen/write-template-module', () => ({ writeTemplateModule: mocks.writeTemplateModule }))
vi.mock('./watch-templates', () => ({ watchTemplates: mocks.watchTemplates }))

import { createDevServer } from './create-dev-server'

const options = { projectRoot: '/tmp/framekit', hostname: '127.0.0.1', port: 0 }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.app.prepare.mockResolvedValue(undefined)
  mocks.app.getRequestHandler.mockReturnValue(() => undefined)
  mocks.app.getUpgradeHandler.mockReturnValue(async () => undefined)
  mocks.app.close.mockResolvedValue(undefined)
  mocks.watcher.close.mockResolvedValue(undefined)
  mocks.watchTemplates.mockReturnValue(mocks.watcher)
  mocks.writeTemplateModule.mockResolvedValue([])
})

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

async function listen(server: Server): Promise<number> {
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  if (!address || typeof address === 'string') throw new Error('Expected a TCP server address')
  return address.port
}

async function close(server: Server): Promise<void> {
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()))
}

describe('createDevServer startup cleanup', () => {
  it('closes Next when prepare fails', async () => {
    const error = new Error('prepare failed')
    mocks.app.prepare.mockRejectedValue(error)

    await expect(createDevServer(options)).rejects.toBe(error)
    expect(mocks.app.close).toHaveBeenCalledOnce()
    expect(mocks.watcher.close).not.toHaveBeenCalled()
  })

  it('uses the next port when the requested port is occupied', async () => {
    const blocker = createServer()
    const port = await listen(blocker)

    try {
      const server = await createDevServer({ ...options, port })
      await server.close()
    } finally {
      await close(blocker)
    }
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
    const watchOptions = mocks.watchTemplates.mock.calls[0]?.[0]
    if (!watchOptions) throw new Error('Expected watcher options')

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
