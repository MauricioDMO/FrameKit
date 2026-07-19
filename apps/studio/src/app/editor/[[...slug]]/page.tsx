import { notFound } from 'next/navigation'

import { templateManifest } from '@framekit/generated/templates'
import { EditorEmptyState } from '@/components/editor/editor-empty-state'
import { TemplateRoute } from '@/components/editor/template-route'

interface EditorPageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { slug = [] } = await params

  if (slug.length === 0) return <EditorEmptyState />

  const templateSlug = slug.join('/')

  if (!templateManifest.some((entry) => entry.slug === templateSlug)) notFound()

  return <TemplateRoute slug={templateSlug} />
}
