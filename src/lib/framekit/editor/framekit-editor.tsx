'use client'

import { Download, RotateCcw } from 'lucide-react'
import { useRef, useState } from 'react'

import { resolveTemplateData } from '../core/resolve-template-data'
import { validateTemplateData } from '../core/validation'
import type { TemplateDefinition } from '../types'
import { EditorControls } from './components/editor-controls'
import { TemplatePreview } from './components/template-preview'
import { exportTemplate } from './export-template'
import { useEditorState } from './state/use-editor-state'
import type { EditorMessages } from './types'
import { translateValidationError } from './validation'

interface FrameKitEditorProps {
  slug: string
  definition: TemplateDefinition
  messages: EditorMessages
}

export function FrameKitEditor({ slug, definition, messages }: FrameKitEditorProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const { selectedLocale, userEdits, errors, setErrors, changeLocale, clearLocale, changeField } = useEditorState(slug, definition)
  const resolvedData = resolveTemplateData(definition, selectedLocale, userEdits)

  async function exportPng() {
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
      await exportTemplate(element, slug, definition.width, definition.height)
    } catch (error) {
      console.error(messages.exportError, error)
      window.alert(messages.exportAlert)
    } finally {
      setExporting(false)
    }
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
        </div>
      </header>
      <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[300px_1fr] xl:overflow-hidden">
        <EditorControls definition={definition} messages={messages} selectedLocale={selectedLocale} data={resolvedData} errors={errors} onLocaleChange={changeLocale} onFieldChange={changeField} />
        <TemplatePreview width={definition.width} height={definition.height} label={messages.preview} actualSizeLabel={messages.actualSize} fitToViewLabel={messages.fitToView}>
          <div ref={exportRef} style={{ width: definition.width, height: definition.height }}>
            {definition.render({ data: resolvedData, locale: selectedLocale, width: definition.width, height: definition.height })}
          </div>
        </TemplatePreview>
      </div>
    </div>
  )
}
