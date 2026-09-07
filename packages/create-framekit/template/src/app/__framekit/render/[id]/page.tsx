import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import { loadRenderRequest } from '@mauriciodmo/framekit/server'

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

interface RenderPageProps {
  params: Promise<{ id: string }>
}

export default async function RenderPage({ params }: RenderPageProps) {
  const { id } = await params
  const requestHeaders = await headers()
  const token = requestHeaders.get('x-framekit-render-token')
  if (token === null) notFound()

  const payload = loadRenderRequest(id, token)
  if (payload === undefined) notFound()

  return <RenderClient payload={payload} />
}
