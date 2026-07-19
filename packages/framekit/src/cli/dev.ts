import process from 'node:process'

import { createDevServer } from '../dev/create-dev-server'
import { getServerOptions } from '../dev/server-options'

export async function dev(projectRoot: string): Promise<never> {
  const { hostname, port } = getServerOptions(process.env)
  let rejectFailure: (error: Error) => void = () => undefined
  const failure = new Promise<never>((_resolve, reject) => {
    rejectFailure = reject
  })
  let server

  try {
    server = await createDevServer({ projectRoot, hostname, port, onError: rejectFailure })
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    process.exit(1)
  }

  let resolveSignal: (signal: NodeJS.Signals) => void = () => undefined
  const signal = new Promise<NodeJS.Signals>((resolve) => {
    resolveSignal = resolve
  })
  const onSigint = () => resolveSignal('SIGINT')
  const onSigterm = () => resolveSignal('SIGTERM')
  process.once('SIGINT', onSigint)
  process.once('SIGTERM', onSigterm)

  let exitCode = 0

  try {
    const receivedSignal = await Promise.race([signal, failure])
    console.log(`Cerrando FrameKit (${receivedSignal})`)
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error))
    exitCode = 1
  } finally {
    process.off('SIGINT', onSigint)
    process.off('SIGTERM', onSigterm)
    try {
      await server.close()
    } catch (error) {
      console.error(error instanceof Error ? error.message : String(error))
      exitCode = 1
    }
  }

  process.exit(exitCode)
}
