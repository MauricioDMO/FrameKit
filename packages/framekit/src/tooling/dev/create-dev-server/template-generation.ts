import { writeTemplateModule } from '../../codegen/write-template-module'

export interface TemplateGenerator {
  generate(): Promise<void>
  schedule(): void
  stop(): void
  close(): Promise<void>
}

export function createTemplateGenerator (projectRoot: string, reportError: (error: unknown) => void): TemplateGenerator {
  let closing = false
  let generationPending = false
  let generationRunning: Promise<void> | undefined

  function generate (): Promise<void> {
    if (generationRunning) {
      generationPending = true
      return generationRunning
    }

    generationRunning = (async () => {
      try {
        do {
          generationPending = false
          const templates = await writeTemplateModule({ projectRoot })
          console.log(`FrameKit: ${templates.length} template${templates.length === 1 ? '' : 's'}`)
        } while (generationPending)
      } finally {
        generationPending = false
        generationRunning = undefined
      }
    })()

    return generationRunning
  }

  function schedule (): void {
    if (closing) return

    generate().catch((error: unknown) => {
      reportError(error)
    })
  }

  function stop (): void {
    closing = true
    generationPending = false
  }

  async function close (): Promise<void> {
    stop()
    await generationRunning?.catch(() => undefined)
  }

  return { generate, schedule, stop, close }
}
