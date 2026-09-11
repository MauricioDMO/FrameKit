import { createImageHandler } from '@mauriciodmo/framekit/server'
import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

const templates = [] as readonly TemplateRegistryEntry[]
const handler: (request: Request) => Promise<Response> = createImageHandler(templates)

export { handler }
