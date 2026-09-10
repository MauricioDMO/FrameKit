import { notFound } from 'next/navigation'
import type { ComponentType } from 'react'

interface StudioPageProps {
  params: Promise<{ section: string, slug?: string[] }>
}

export function createStudioPage (StudioClient: ComponentType) {
  return async function StudioPage ({ params }: StudioPageProps) {
    const { section } = await params
    if (section !== 'editor' && section !== 'brand') notFound()

    return <StudioClient />
  }
}
