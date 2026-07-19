import { createServer, type Server } from 'node:http'

import next from 'next'

import { writeTemplateModule } from '../codegen/write-template-module'
import { watchTemplates, type TemplateWatcher } from './watch-templates'

export interface DevServerOptions {
  projectRoot: string
  hostname: string
  port: number
}

export interface DevServer {
  close(): Promise<void>
}

export async function createDevServer(options: DevServerOptions): Promise<DevServer> {
  let closing = false
  let generationPending = false
  let generationRunning: Promise<void> | undefined
  let generationTimer: NodeJS.Timeout | undefined

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

    clearTimeout(generationTimer)
    generationTimer = setTimeout(() => {
      void generate().catch((error: unknown) => {
        console.error(error)
        process.exitCode = 1
      })
    }, 150)
  }

  await generate()

  const app = next({
    dev: true,
    dir: options.projectRoot,
    hostname: options.hostname,
    port: options.port,
    turbopack: true,
  })

  await app.prepare()

  const handler = app.getRequestHandler()
  const upgradeHandler = app.getUpgradeHandler()
  const httpServer: Server = createServer((request, response) => {
    void handler(request, response)
  })
  const upgradedSockets = new Set<Parameters<typeof upgradeHandler>[1]>()

  httpServer.on('upgrade', (request, socket, head) => {
    upgradedSockets.add(socket)
    socket.once('close', () => upgradedSockets.delete(socket))
    void upgradeHandler(request, socket, head).catch((error: unknown) => {
      socket.destroy()
      console.error(error)
    })
  })

  const templateWatcher: TemplateWatcher = watchTemplates({
    projectRoot: options.projectRoot,
    onStructureChange: scheduleGeneration,
    onError(error) {
      console.error(error)
      process.exitCode = 1
    },
  })

  await new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      httpServer.off('error', onError)
      reject(error)
    }

    httpServer.once('error', onError)
    httpServer.listen(options.port, options.hostname, () => {
      httpServer.off('error', onError)
      resolve()
    })
  })

  httpServer.on('error', (error) => {
    console.error(error)
    process.exitCode = 1
  })

  console.log(`FrameKit Studio: http://${options.hostname}:${options.port}`)

  return {
    async close() {
      closing = true
      clearTimeout(generationTimer)
      await templateWatcher.close()
      clearTimeout(generationTimer)
      generationPending = false
      await generationRunning?.catch(() => undefined)

      await new Promise<void>((resolve, reject) => {
        if (!httpServer.listening) {
          resolve()
          return
        }

        for (const socket of upgradedSockets) socket.destroy()
        httpServer.closeAllConnections()
        httpServer.close((error) => (error ? reject(error) : resolve()))
      })

      await app.close()
    },
  }
}
