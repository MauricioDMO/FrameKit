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
}))

vi.mock('next', () => ({ default: vi.fn(() => mocks.app) }))
vi.mock('../codegen/write-template-module', () => ({ writeTemplateModule: vi.fn(async () => []) }))
vi.mock('./watch-templates', () => ({ watchTemplates: vi.fn(() => mocks.watcher) }))

import { createDevServer } from './create-dev-server'

const options = { projectRoot: '/tmp/framekit', hostname: '127.0.0.1', port: 0 }

beforeEach(() => {
  vi.clearAllMocks()
  mocks.app.prepare.mockResolvedValue(undefined)
  mocks.app.getRequestHandler.mockReturnValue(() => undefined)
  mocks.app.getUpgradeHandler.mockReturnValue(async () => undefined)
  mocks.app.close.mockResolvedValue(undefined)
  mocks.watcher.close.mockResolvedValue(undefined)
})

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

  it('closes the watcher, HTTP server, and Next when the port is occupied', async () => {
    const blocker = createServer()
    const port = await listen(blocker)

    try {
      await expect(createDevServer({ ...options, port })).rejects.toMatchObject({ code: 'EADDRINUSE' })
      expect(mocks.watcher.close).toHaveBeenCalledOnce()
      expect(mocks.app.close).toHaveBeenCalledOnce()
    } finally {
      await close(blocker)
    }

    const server = await createDevServer({ ...options, port })
    await server.close()
  })
})
