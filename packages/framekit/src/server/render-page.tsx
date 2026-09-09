import type { ComponentType } from 'react'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import type { ResolvedRenderPayload } from './config'
import { loadRenderRequest } from './render-job'

interface RenderClientProps {
  payload: ResolvedRenderPayload
}

interface RenderPageProps {
  params: Promise<{ id: string }>
}

export function createRenderPage (RenderClient: ComponentType<RenderClientProps>) {
  return async function RenderPage ({ params }: RenderPageProps) {
    const { id } = await params
    const requestHeaders = await headers()
    const token = requestHeaders.get('x-framekit-render-token')
    if (token === null) notFound()

    const payload = loadRenderRequest(id, token)
    if (payload === undefined) notFound()

    return <RenderClient payload={payload} />
  }
}
