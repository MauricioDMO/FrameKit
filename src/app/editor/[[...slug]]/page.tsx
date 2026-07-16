import { ImageIcon } from 'lucide-react'
import { notFound } from 'next/navigation'

import { TemplateEditor } from '@/components/editor/template-editor'
import { getTemplateConfig } from '@/lib/templates/get-template-config'

interface EditorPageProps {
  params: Promise<{ slug?: string[] }>
}

export default async function EditorPage({ params }: EditorPageProps) {
  const { slug = [] } = await params

  if (slug.length === 0) return <EditorEmptyState />

  const config = await getTemplateConfig(slug)
  if (!config) notFound()

  const templateSlug = slug.join('/')

  return (
    <TemplateEditor
      key={templateSlug}
      templateSlug={templateSlug}
      config={config}
    />
  )
}

function EditorEmptyState() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#173d31] text-[#b9f8d2] shadow-[0_10px_30px_rgba(23,61,49,0.25)]">
          <ImageIcon size={28} strokeWidth={1.7} />
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-[#577066]">
          Lienzo preparado
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#17221d]">
          Selecciona una plantilla
        </h1>
        <p className="mt-3 leading-7 text-[#657168]">
          Elige un formato en la navegación para editar su contenido y exportarlo
          como PNG.
        </p>
      </div>
    </div>
  )
}
