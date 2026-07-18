'use client'

import { Download, RotateCcw } from 'lucide-react'
import { useRef, useState } from 'react'

import type { getMessages } from '@/i18n/messages'
import type { TemplateDataValidationError, TemplateDefinition } from '@/lib/framekit'
import { resolveTemplateData, validateTemplateData } from '@/lib/framekit'

import { EditorControls } from './editor-controls'
import { TemplatePreview } from './template-preview'
import { useFramekitEditorState } from './use-framekit-editor-state'

interface FramekitEditorProps {
  slug: string
  definition: TemplateDefinition
  messages: ReturnType<typeof getMessages>['editor']
}

function translateValidationError(
  error: TemplateDataValidationError,
  messages: ReturnType<typeof getMessages>['editor'],
) {
  switch (error.code) {
    case 'required':
      return messages.errorRequired
    case 'invalid_number':
      return messages.errorInvalidNumber
    case 'number_too_small':
      return messages.errorNumberTooSmall.replace('{min}', String(error.min ?? ''))
    case 'number_too_large':
      return messages.errorNumberTooLarge.replace('{max}', String(error.max ?? ''))
    case 'invalid_url':
      return messages.errorInvalidUrl
  }
}

export function FrameKitEditor({
  slug,
  definition,
  messages,
}: FramekitEditorProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const {
    selectedLocale,
    userEdits,
    errors,
    setErrors,
    changeLocale,
    resetLocale,
    updateField,
  } = useFramekitEditorState(slug, definition)
  const resolvedData = resolveTemplateData(definition, selectedLocale, userEdits)

  async function exportPng() {
    const element = exportRef.current
    if (!element || exporting) return

    const validationErrors = validateTemplateData(definition, resolvedData)
    if (Object.keys(validationErrors).length > 0) {
      const translatedErrors = Object.fromEntries(
        Object.entries(validationErrors).map(([key, error]) => [
          key,
          translateValidationError(error, messages),
        ]),
      )
      setErrors(translatedErrors)
      const firstErrorKey = Object.keys(validationErrors)[0]
      const fieldContainer = Array.from(
        document.querySelectorAll<HTMLElement>('[data-field-key]'),
      ).find((candidate) => candidate.dataset.fieldKey === firstErrorKey)
      const firstInput = fieldContainer?.querySelector<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >('input, textarea, select')
      firstInput?.focus()
      return
    }

    try {
      setExporting(true)
      await document.fonts.ready

      const { domToPng } = await import('modern-screenshot')
      const image = await domToPng(element, {
        width: definition.width,
        height: definition.height,
        scale: 1,
      })
      const link = document.createElement('a')

      link.href = image
      link.download = `${slug.replaceAll('/', '-')}.png`
      link.click()
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
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#4d675a] uppercase dark:text-[#a4b8ac]">
            {messages.templateEditor}
          </p>
          <h1 className="mt-1 text-xl font-black tracking-tight">
            {slug.split('/').pop()!.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetLocale}
            className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9] dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]"
          >
            <RotateCcw size={15} />
            {messages.reset}
          </button>
          <button
            type="button"
            disabled={exporting}
            onClick={exportPng}
            className="inline-flex items-center gap-2 rounded-xl bg-[#173d31] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f2c23] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={15} />
            {exporting ? messages.generating : messages.downloadPng}
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[300px_1fr] xl:overflow-hidden">
        <EditorControls
          definition={definition}
          messages={messages}
          selectedLocale={selectedLocale}
          data={resolvedData}
          errors={errors}
          onLocaleChange={changeLocale}
          onFieldChange={updateField}
        />

        <TemplatePreview
          width={definition.width}
          height={definition.height}
          label={messages.preview}
          actualSizeLabel={messages.actualSize}
          fitToViewLabel={messages.fitToView}
        >
          <div
            ref={exportRef}
            style={{ width: definition.width, height: definition.height }}
          >
            {definition.render({
              data: resolvedData,
              locale: selectedLocale,
              width: definition.width,
              height: definition.height,
            })}
          </div>
        </TemplatePreview>
      </div>
    </div>
  )
}
