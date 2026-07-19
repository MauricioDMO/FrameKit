import process from 'node:process'

import {
  createDevServer,
  writeTemplateModule,
} from '@mauriciodmo/framekit/dev'

const projectRoot = process.cwd()
const hostname = process.env.HOSTNAME ?? 'localhost'
const port = Number.parseInt(process.env.PORT ?? '3000', 10)

async function main(): Promise<void> {
  if (process.argv.includes('--generate')) {
    const templates = await writeTemplateModule({ projectRoot })
    console.log(`FrameKit: ${templates.length} plantilla(s)`)
    return
  }

  const server = await createDevServer({ projectRoot, hostname, port })
  let closing = false

  async function close(signal: string): Promise<void> {
    if (closing) return
    closing = true

    console.log(`Cerrando FrameKit (${signal})`)
    await server.close()
  }

  function handleSignal(signal: string): void {
    void close(signal).then(
      () => process.exit(0),
      (error: unknown) => {
        console.error(error)
        process.exit(1)
      },
    )
  }

  process.once('SIGINT', () => handleSignal('SIGINT'))
  process.once('SIGTERM', () => handleSignal('SIGTERM'))
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
