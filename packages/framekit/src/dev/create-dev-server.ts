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
  let generationRunning = false
  let generationPending = false
  let generationTimer: NodeJS.Timeout | undefined

  async function generate(): Promise<void> {
    if (generationRunning) {
      generationPending = true
      return
    }

    generationRunning = true

    try {
      const templates = await writeTemplateModule({ projectRoot: options.projectRoot })
      console.log(`FrameKit: ${templates.length} plantilla(s)`)
    } finally {
      generationRunning = false

      if (generationPending) {
        generationPending = false
        await generate()
      }
    }
  }

  function scheduleGeneration(): void {
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
  const httpServer: Server = createServer((request, response) => {
    void handler(request, response)
  })

  const templateWatcher: TemplateWatcher = watchTemplates({
    projectRoot: options.projectRoot,
    onStructureChange: scheduleGeneration,
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
      clearTimeout(generationTimer)
      await templateWatcher.close()

      await new Promise<void>((resolve, reject) => {
        if (!httpServer.listening) {
          resolve()
          return
        }

        httpServer.closeAllConnections()
        httpServer.close((error) => (error ? reject(error) : resolve()))
      })

      await app.close()
    },
  }
}
