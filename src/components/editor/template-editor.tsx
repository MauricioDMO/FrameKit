'use client'

import { Download, RotateCcw } from 'lucide-react'
import { useRef, useState } from 'react'

import { templateRegistry } from '@/generated/template-registry'
import type { TemplateConfig, TemplateData } from '@/lib/templates/types'

import { EditorField } from './editor-field'
import { TemplatePreview } from './template-preview'

interface TemplateEditorProps {
  templateSlug: string
  config: TemplateConfig
}

export function TemplateEditor({ templateSlug, config }: TemplateEditorProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<TemplateData>(() => ({ ...config.defaults }))
  const [exporting, setExporting] = useState(false)
  const Template = templateRegistry[templateSlug]

  function updateField(key: string, value: string) {
    setData((current) => ({ ...current, [key]: value }))
  }

  async function exportPng() {
    const element = exportRef.current
    if (!element || exporting) return

    try {
      setExporting(true)
      await document.fonts.ready

      const { domToPng } = await import('modern-screenshot')
      const image = await domToPng(element, {
        width: config.width,
        height: config.height,
        scale: 1,
      })
      const link = document.createElement('a')

      link.href = image
      link.download = `${
        config.fileName ?? templateSlug.replaceAll('/', '-')
      }.png`
      link.click()
    } catch (error) {
      console.error('No se pudo exportar la plantilla:', error)
      window.alert('No fue posible generar la imagen.')
    } finally {
      setExporting(false)
    }
  }

  if (!Template) {
    return (
      <div className="p-8 text-sm">
        No se encontró el componente. Ejecuta{' '}
        <code className="rounded bg-black/8 px-2 py-1">
          pnpm templates:generate
        </code>
        .
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-4 sm:px-7">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4d675a]">
            Editor de plantilla
          </p>
          <h1 className="mt-1 text-xl font-black tracking-[-0.025em]">
            {config.title}
          </h1>
          {config.description && (
            <p className="mt-1 max-w-2xl text-sm text-[#6c756f]">
              {config.description}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setData({ ...config.defaults })}
            className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9]"
          >
            <RotateCcw size={15} />
            Restablecer
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={exportPng}
            className="inline-flex items-center gap-2 rounded-xl bg-[#173d31] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f2c23] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} />
            {exporting ? 'Generando...' : 'Descargar PNG'}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-5 p-4 sm:p-5 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-black/8 bg-[#faf9f5] p-5 shadow-[0_6px_24px_rgba(45,53,48,0.05)] xl:max-h-[calc(100vh-132px)] xl:overflow-y-auto">
          <div className="flex items-baseline justify-between border-b border-black/8 pb-4">
            <h2 className="font-black tracking-tight">Contenido</h2>
            <span className="text-xs text-[#5f6963]">
              {config.width} × {config.height}
            </span>
          </div>
          <div className="mt-5 space-y-5">
            {config.fields.map((field) => (
              <EditorField
                key={field.key}
                field={field}
                value={data[field.key] ?? ''}
                onChange={(value) => updateField(field.key, value)}
              />
            ))}
          </div>
        </aside>

        <TemplatePreview width={config.width} height={config.height}>
          <div
            ref={exportRef}
            style={{ width: config.width, height: config.height }}
          >
            <Template data={data} width={config.width} height={config.height} />
          </div>
        </TemplatePreview>
      </div>
    </div>
  )
}
