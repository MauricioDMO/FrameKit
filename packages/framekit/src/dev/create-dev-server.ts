import { createServer, type Server } from 'node:http'
import type { Duplex } from 'node:stream'

import next from 'next'

import { writeTemplateModule } from '../codegen/write-template-module'
import { watchTemplates, type TemplateWatcher } from './watch-templates'

export interface DevServerOptions {
  projectRoot: string
  hostname: string
  port: number
  onError?: (error: Error) => void
}

export interface DevServer {
  close(): Promise<void>
}

export async function createDevServer(options: DevServerOptions): Promise<DevServer> {
  let closing = false
  let generationPending = false
  let generationRunning: Promise<void> | undefined

  function reportError(error: unknown): void {
    const normalizedError = error instanceof Error ? error : new Error(String(error))

    if (options.onError) {
      options.onError(normalizedError)
      return
    }

    console.error(normalizedError)
    process.exitCode = 1
  }

  function generate(): Promise<void> {
    if (generationRunning) {
      generationPending = true
      return generationRunning
    }

    generationRunning = (async () => {
      try {
        do {
          generationPending = false
          const templates = await writeTemplateModule({ projectRoot: options.projectRoot })
          console.log(`FrameKit: ${templates.length} plantilla(s)`)
        } while (generationPending)
      } finally {
        generationPending = false
        generationRunning = undefined
      }
    })()

    return generationRunning
  }

  function scheduleGeneration(): void {
    if (closing) return

    void generate().catch((error: unknown) => {
      reportError(error)
    })
  }

  await generate()

  const app = next({
    dev: true,
    dir: options.projectRoot,
    hostname: options.hostname,
    port: options.port,
    turbopack: true,
  })

  let httpServer: Server | undefined
  let templateWatcher: TemplateWatcher | undefined
  const upgradedSockets = new Set<Duplex>()

  async function closeResources(): Promise<void> {
    closing = true

    let closeError: unknown
    try {
      await templateWatcher?.close()
    } catch (error) {
      closeError = error
    }

    generationPending = false
    await generationRunning?.catch(() => undefined)

    try {
      if (httpServer?.listening) {
        for (const socket of upgradedSockets) socket.destroy()
        httpServer.closeAllConnections()
        await new Promise<void>((resolve, reject) => {
          httpServer!.close((error) => (error ? reject(error) : resolve()))
        })
      }
    } catch (error) {
      closeError ??= error
    }

    try {
      await app.close()
    } catch (error) {
      closeError ??= error
    }

    if (closeError) throw closeError
  }

  try {
    await app.prepare()

    const handler = app.getRequestHandler()
    const upgradeHandler = app.getUpgradeHandler()
    httpServer = createServer((request, response) => {
      void handler(request, response)
    })

    httpServer.on('upgrade', (request, socket, head) => {
      upgradedSockets.add(socket)
      socket.once('close', () => upgradedSockets.delete(socket))
      void upgradeHandler(request, socket, head).catch((error: unknown) => {
        socket.destroy()
        console.error(error)
      })
    })

    templateWatcher = watchTemplates({
      projectRoot: options.projectRoot,
      onStructureChange: scheduleGeneration,
      onError(error) {
        reportError(error)
      },
    })

    await new Promise<void>((resolve, reject) => {
      const onError = (error: Error) => {
        httpServer!.off('error', onError)
        reject(error)
      }

      httpServer!.once('error', onError)
      httpServer!.listen(options.port, options.hostname, () => {
        httpServer!.off('error', onError)
        resolve()
      })
    })

    httpServer.on('error', (error) => {
      reportError(error)
    })

    console.log(`FrameKit Studio: http://${options.hostname}:${options.port}`)

    return { close: closeResources }
  } catch (error) {
    await closeResources().catch(() => undefined)
    throw error
  }
}
