import next from 'next'

import { createDevHttpServer, listenDevHttpServer, type DevHttpServer } from './http-server'
import { createTemplateGenerator } from './template-generation'
import { watchTemplates, type TemplateWatcher } from '@/tooling/dev/watch-templates'

export interface DevServerOptions {
  projectRoot: string
  hostname: string
  port: number
  env?: NodeJS.ProcessEnv
  onError?: (error: Error) => void
}

export interface DevServer {
  close(): Promise<void>
}

export async function createDevServer (options: DevServerOptions): Promise<DevServer> {
  const env = options.env ?? process.env

  function reportError (error: unknown): void {
    const normalizedError = error instanceof Error ? error : new Error(String(error))

    if (options.onError) {
      options.onError(normalizedError)
      return
    }

    console.error(normalizedError)
    process.exitCode = 1
  }

  const generator = createTemplateGenerator(options.projectRoot, reportError)
  await generator.generate()

  const app = next({
    dev: true,
    dir: options.projectRoot,
    hostname: options.hostname,
    port: options.port,
    turbopack: true
  })

  let httpServer: DevHttpServer | undefined
  let templateWatcher: TemplateWatcher | undefined

  async function closeResources (): Promise<void> {
    generator.stop()

    let closeError: unknown
    try {
      await templateWatcher?.close()
    } catch (error) {
      closeError = error
    }

    await generator.close()

    try {
      await httpServer?.close()
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

    httpServer = createDevHttpServer({
      projectRoot: options.projectRoot,
      requestHandler: app.getRequestHandler(),
      upgradeHandler: app.getUpgradeHandler(),
      generate: generator.generate,
      env
    })

    templateWatcher = watchTemplates({
      projectRoot: options.projectRoot,
      onStructureChange: generator.schedule,
      onError: reportError
    })

    await listenDevHttpServer(httpServer.server, options.port, options.hostname)

    const address = httpServer.server.address()
    if (!address || typeof address === 'string') throw new Error('Expected a TCP server address')
    const port = address.port

    httpServer.server.on('error', (error) => {
      reportError(error)
    })

    console.log(`FrameKit Studio: http://${options.hostname}:${port}`)

    return { close: closeResources }
  } catch (error) {
    await closeResources().catch(() => undefined)
    throw error
  }
}
