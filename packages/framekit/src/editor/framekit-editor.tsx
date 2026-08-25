'use client'

import { Copy, Download, RotateCcw } from 'lucide-react'
import { useRef, useState } from 'react'

import { resolveTemplateData } from '../core/resolve-template-data'
import { validateTemplateData } from '../core/validation'
import type { ImageFieldScope, TemplateAssetManifest, TemplateDefinition } from '../types'
import { EditorControls } from './components/editor-controls'
import { TemplatePreview } from './components/template-preview'
import { copyTemplate, exportTemplate } from './export-template'
import { useEditorState } from './state/use-editor-state'
import type { EditorMessages } from './types'
import { translateValidationError } from './validation'

interface FrameKitEditorProps {
  slug: string
  definition: TemplateDefinition
  assets?: TemplateAssetManifest
  messages: EditorMessages
  sidebarCollapsed?: boolean
}

const emptyAssets: TemplateAssetManifest = { common: {}, variants: {} }

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result)
      const separator = result.indexOf(',')
      resolve(separator === -1 ? result : result.slice(separator + 1))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Could not read image'))
    reader.readAsDataURL(file)
  })
}

export function FrameKitEditor({ slug, definition, assets = emptyAssets, messages, sidebarCollapsed = false }: FrameKitEditorProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const { selectedLocale, userEdits, errors, setErrors, changeLocale, clearLocale, changeField } = useEditorState(slug, definition)
  const resolvedData = resolveTemplateData(definition, selectedLocale, userEdits, assets)

  async function uploadImage(key: string, file: File, scope: ImageFieldScope): Promise<void> {
    try {
      const response = await fetch('/__framekit/assets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          templateSlug: slug,
          variant: scope === 'common' ? 'common' : selectedLocale,
          fieldKey: key,
          filename: file.name,
          mimeType: file.type,
          data: await readFileAsBase64(file),
        }),
      })

      if (!response.ok) throw new Error(`Asset upload failed with ${response.status}`)
      window.location.reload()
    } catch (error) {
      setErrors((current) => ({ ...current, [key]: messages.imageUploadError }))
      throw error
    }
  }

  async function runExport(action: (element: HTMLDivElement) => Promise<void>) {
    const element = exportRef.current
    if (!element || exporting) return

    const validationErrors = validateTemplateData(definition, resolvedData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(Object.fromEntries(Object.entries(validationErrors).map(([key, error]) => [key, translateValidationError(error, messages)])))
      const firstErrorKey = Object.keys(validationErrors)[0]
      const fieldContainer = Array.from(document.querySelectorAll<HTMLElement>('[data-field-key]')).find((candidate) => candidate.dataset.fieldKey === firstErrorKey)
      fieldContainer?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')?.focus()
      return
    }

    try {
      setExporting(true)
      await action(element)
    } catch (error) {
      console.error(messages.exportError, error)
      window.alert(messages.exportAlert)
    } finally {
      setExporting(false)
    }
  }

  function exportPng() {
    return runExport((element) => exportTemplate(element, slug, definition.width, definition.height))
  }

  function copyPng() {
    return runExport((element) => copyTemplate(element, definition.width, definition.height))
  }

  return (
    <div className="flex min-h-screen flex-col text-[#17221d] xl:h-full xl:min-h-0 dark:text-[#e6eee9]">
      <header className="flex h-20.5 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-4 sm:px-7 dark:border-white/10 dark:bg-[#1d2923]">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#4d675a] uppercase dark:text-[#a4b8ac]">{messages.templateEditor}</p>
          <h1 className="mt-1 text-xl font-black tracking-tight">{slug.split('/').pop()!.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={clearLocale} className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9] dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]"><RotateCcw size={15} />{messages.reset}</button>
          <button type="button" disabled={exporting} onClick={exportPng} className="inline-flex items-center gap-2 rounded-xl bg-[#173d31] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f2c23] disabled:cursor-not-allowed disabled:opacity-50"><Download size={15} />{exporting ? messages.generating : messages.downloadPng}</button>
          <button type="button" disabled={exporting} onClick={copyPng} className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]"><Copy size={15} />{exporting ? messages.generating : messages.copyPng ?? 'Copy PNG'}</button>
        </div>
      </header>
      <div className={`grid min-h-0 flex-1 gap-4 p-4 ${sidebarCollapsed ? 'xl:grid-cols-[400px_1fr]' : 'xl:grid-cols-[300px_1fr]'} xl:overflow-hidden`}>
        <EditorControls definition={definition} messages={messages} selectedLocale={selectedLocale} data={resolvedData} errors={errors} onLocaleChange={changeLocale} onFieldChange={changeField} onImageUpload={process.env.NODE_ENV === 'production' ? undefined : uploadImage} />
        <TemplatePreview width={definition.width} height={definition.height} label={messages.preview} actualSizeLabel={messages.actualSize} fitToViewLabel={messages.fitToView}>
          <div ref={exportRef} style={{ width: definition.width, height: definition.height }}>
            {definition.render({ data: resolvedData, assets, variant: selectedLocale, width: definition.width, height: definition.height })}
          </div>
        </TemplatePreview>
      </div>
    </div>
  )
}
