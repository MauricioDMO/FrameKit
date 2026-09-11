import { createImageHandler } from '@mauriciodmo/framekit/server'
import { templates } from '@framekit/generated/templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export const POST = createImageHandler(templates)
