import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http'
import type { Duplex } from 'node:stream'

import { handleAssetUpload } from '../asset-upload'
import { authorizeAssetRequest } from './asset-authorization'

type RequestHandler = (request: IncomingMessage, response: ServerResponse) => void
type UpgradeHandler = (request: IncomingMessage, socket: Duplex, head: Buffer) => Promise<void>

export interface DevHttpServer {
  server: Server
  close(): Promise<void>
}

export function createDevHttpServer (options: {
  projectRoot: string
  requestHandler: RequestHandler
  upgradeHandler: UpgradeHandler
  generate: () => Promise<void>
}): DevHttpServer {
  const httpServer = createServer((request, response) => {
    const pathname = new URL(request.url ?? '/', 'http://framekit.local').pathname
    if (pathname === '/framekit/assets') {
      if (!authorizeAssetRequest(request, response)) return
      handleAssetUpload(request, response, {
        projectRoot: options.projectRoot,
        regenerate: options.generate
      })
      return
    }
    options.requestHandler(request, response)
  })

  const upgradedSockets = new Set<Duplex>()
  httpServer.on('upgrade', (request, socket, head) => {
    upgradedSockets.add(socket)
    socket.once('close', () => upgradedSockets.delete(socket))
    options.upgradeHandler(request, socket, head).catch((error: unknown) => {
      socket.destroy()
      console.error(error)
    })
  })

  async function close (): Promise<void> {
    if (!httpServer.listening) return

    for (const socket of upgradedSockets) socket.destroy()
    httpServer.closeAllConnections()
    await new Promise<void>((resolve, reject) => {
      httpServer.close((error) => (error ? reject(error) : resolve()))
    })
  }

  return { server: httpServer, close }
}

export async function listenDevHttpServer (server: Server, port: number, hostname: string): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      server.off('error', onError)
      reject(error)
    }

    server.once('error', onError)
    server.listen(port, hostname, () => {
      server.off('error', onError)
      resolve()
    })
  })
}
