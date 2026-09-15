import { createStudioAccessHandler } from '@mauriciodmo/framekit/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const handler = createStudioAccessHandler()

export const GET = handler
export const POST = handler
export const PATCH = handler
export const DELETE = handler
