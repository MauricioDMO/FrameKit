import type { Metadata } from 'next'

import { createRenderPage } from '@mauriciodmo/framekit/server'

import { RenderClient } from './render-client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
}

export default createRenderPage(RenderClient)
