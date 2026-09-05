'use client'

import { useCallback, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { resolveTemplateData } from '../core/resolve-template-data'
import { validateTemplateData } from '../core/validation'
import type { TemplateDataValidationError } from '../core/validation'
import type { ImageFieldScope, InferTemplateData, TemplateBase, TemplateRegistryEntry, TemplateRenderProps } from '../types'
import { EditorHeader } from './components/editor-header'
import { EditorControls } from './components/editor-controls'
import { TemplateMetadataDialog } from './components/template-metadata-dialog'
import { TemplatePreview } from './components/template-preview'
import { copyTemplate, exportTemplate } from './export-template'
import { useEditorState } from './state/use-editor-state'
import type { EditorMessages } from './types'
import { translateValidationError } from './validation'

interface FrameKitEditorProps<Definition extends TemplateBase> {
  template: TemplateRegistryEntry
  definition: Definition & {
    render(props: TemplateRenderProps<Definition>): ReactNode
  }
  messages: EditorMessages
  sidebarCollapsed?: boolean
}

function readFileAsBase64 (file: File): Promise<string> {
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

export function FrameKitEditor<Definition extends TemplateBase> ({ template, definition, messages, sidebarCollapsed = false }: FrameKitEditorProps<Definition>) {
  const { slug, assets } = template
  const exportRef = useRef<HTMLDivElement>(null)
  const [exporting, setExporting] = useState(false)
  const [metadataOpen, setMetadataOpen] = useState(false)
  const { selectedVariant, userEdits, errors, setErrors, changeVariant, clearVariant, changeField, resetVersion } = useEditorState(slug, definition)
  const hasMetadata = template.meta.description !== undefined || template.meta.marketingDescription !== undefined || (template.meta.tags?.length ?? 0) > 0
  const closeMetadata = useCallback(() => setMetadataOpen(false), [])

  let resolvedData: InferTemplateData<Definition>
  try {
    resolvedData = resolveTemplateData(definition, selectedVariant, userEdits as Partial<InferTemplateData<Definition>> & Record<string, string | number | boolean>, assets)
  } catch {
    return <div role="alert" className="flex min-h-[60vh] items-center justify-center p-8 text-[#17221d] dark:text-[#e6eee9]">{messages.dataError}</div>
  }

  function changeFieldValidation (key: string, error?: TemplateDataValidationError) {
    setErrors((current) => {
      if (!error) {
        if (!current[key]) return current
        const next = { ...current }
        delete next[key]
        return next
      }
      return { ...current, [key]: translateValidationError(error, messages) }
    })
  }

  async function uploadImage (key: string, file: File, scope: ImageFieldScope): Promise<void> {
    try {
      const response = await fetch('/__framekit/assets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          templateSlug: slug,
          variant: scope === 'common' ? 'common' : selectedVariant,
          fieldKey: key,
          filename: file.name,
          mimeType: file.type,
          data: await readFileAsBase64(file)
        })
      })

      if (!response.ok) throw new Error(`Asset upload failed with ${response.status}`)
      window.location.reload()
    } catch (error) {
      setErrors((current) => ({ ...current, [key]: messages.imageUploadError }))
      throw error
    }
  }

  async function runExport (action: (element: HTMLDivElement) => Promise<void>) {
    const element = exportRef.current
    if (!element || exporting) return

    const validationErrors = validateTemplateData(definition, resolvedData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors((current) => ({ ...current, ...Object.fromEntries(Object.entries(validationErrors).map(([key, error]) => [key, translateValidationError(error, messages)])) }))
      const firstErrorKey = Object.keys(validationErrors)[0]
      const fieldContainer = Array.from(document.querySelectorAll<HTMLElement>('[data-field-key]')).find((candidate) => candidate.dataset.fieldKey === firstErrorKey)
      const visibleControl = fieldContainer?.querySelector<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('textarea, select, input:not(.sr-only)')
      const control = visibleControl ?? fieldContainer?.querySelector<HTMLInputElement>('input')
      control?.focus()
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

  function exportPng () {
    return runExport((element) => exportTemplate(element, slug, definition.width, definition.height))
  }

  function copyPng () {
    return runExport((element) => copyTemplate(element, definition.width, definition.height))
  }

  return (
    <div className="flex min-h-screen flex-col text-[#17221d] xl:h-full xl:min-h-0 dark:text-[#e6eee9]">
      <EditorHeader title={template.meta.title} messages={messages} hasMetadata={hasMetadata} exporting={exporting} onOpenMetadata={() => setMetadataOpen(true)} onReset={clearVariant} onExport={exportPng} onCopy={copyPng} />
      <div className={`grid min-h-0 flex-1 gap-4 p-4 ${sidebarCollapsed ? 'xl:grid-cols-[400px_1fr]' : 'xl:grid-cols-[300px_1fr]'} xl:overflow-hidden`}>
        <EditorControls key={resetVersion} definition={definition} messages={messages} selectedVariant={selectedVariant} data={resolvedData} errors={errors} onVariantChange={changeVariant} onFieldChange={changeField} onFieldValidationError={changeFieldValidation} onImageUpload={process.env.NODE_ENV === 'production' ? undefined : uploadImage} />
        <TemplatePreview width={definition.width} height={definition.height} label={messages.preview} actualSizeLabel={messages.actualSize} fitToViewLabel={messages.fitToView}>
          <div ref={exportRef} style={{ width: definition.width, height: definition.height }}>
            {definition.render({
              data: resolvedData,
              assets,
              variant: selectedVariant as TemplateRenderProps<Definition>['variant'],
              width: definition.width,
              height: definition.height
            })}
          </div>
        </TemplatePreview>
      </div>
      <TemplateMetadataDialog open={metadataOpen} meta={template.meta} messages={messages} onClose={closeMetadata} />
    </div>
  )
}
