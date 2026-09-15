import { createStudioPage } from '@mauriciodmo/framekit/studio/root'
import { StudioClient } from '@framekit/generated/studio-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export default createStudioPage(StudioClient)
