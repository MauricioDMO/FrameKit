'use client'

import { IconCopy, IconDownload, IconInfoCircle, IconRotate, IconX } from '@tabler/icons-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { resolveTemplateData } from '../core/resolve-template-data'
import { validateTemplateData } from '../core/validation'
import type { TemplateDataValidationError } from '../core/validation'
import type { ImageFieldScope, InferTemplateData, TemplateBase, TemplateMeta, TemplateRegistryEntry, TemplateRenderProps } from '../types'
import { EditorControls } from './components/editor-controls'
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

export function FrameKitEditor<Definition extends TemplateBase>({ template, definition, messages, sidebarCollapsed = false }: FrameKitEditorProps<Definition>) {
  const { slug, assets } = template
  const exportRef = useRef<HTMLDivElement>(null)
  const metadataCloseRef = useRef<HTMLButtonElement>(null)
  const [exporting, setExporting] = useState(false)
  const [metadataOpen, setMetadataOpen] = useState(false)
  const { selectedVariant, userEdits, errors, setErrors, changeVariant, clearVariant, changeField, resetVersion } = useEditorState(slug, definition)
  const { metadataLabel, closeLabel } = messages
  const hasMetadata = template.meta.description !== undefined || template.meta.marketingDescription !== undefined || (template.meta.tags?.length ?? 0) > 0

  useEffect(() => {
    if (!metadataOpen) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setMetadataOpen(false)
    }

    document.addEventListener('keydown', closeOnEscape)
    metadataCloseRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      previousFocus?.focus()
    }
  }, [metadataOpen])

  let resolvedData: InferTemplateData<Definition>
  try {
    resolvedData = resolveTemplateData(definition, selectedVariant, userEdits as Partial<InferTemplateData<Definition>> & Record<string, string | number | boolean>, assets)
  } catch {
    return <div role="alert" className="flex min-h-[60vh] items-center justify-center p-8 text-[#17221d] dark:text-[#e6eee9]">{messages.dataError}</div>
  }

  function changeFieldValidation(key: string, error?: TemplateDataValidationError) {
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

  async function uploadImage(key: string, file: File, scope: ImageFieldScope): Promise<void> {
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

  function exportPng() {
    return runExport((element) => exportTemplate(element, slug, definition.width, definition.height))
  }

  function copyPng() {
    return runExport((element) => copyTemplate(element, definition.width, definition.height))
  }

  return (
    <div className="flex min-h-screen flex-col text-[#17221d] xl:h-full xl:min-h-0 dark:text-[#e6eee9]">
      <header className="flex min-h-20.5 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-4 sm:px-7 dark:border-white/10 dark:bg-[#1d2923]">
        <div>
          <div className="flex flex-wrap items-start gap-x-10 gap-y-2">
            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] text-[#4d675a] uppercase dark:text-[#a4b8ac]">{messages.templateEditor}</p>
              <h1 className="mt-1 text-xl font-black tracking-tight">{template.meta.title}</h1>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {hasMetadata && <button type="button" onClick={() => setMetadataOpen(true)} aria-haspopup="dialog" aria-controls="template-metadata-dialog" className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9] focus:ring-2 focus:ring-[#7fae98] focus:outline-none dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036] dark:focus:ring-[#c8f7d9]"><IconInfoCircle size={15} aria-hidden="true" />{metadataLabel}</button>}
          <button type="button" onClick={clearVariant} className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9] dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]"><IconRotate size={15} />{messages.reset}</button>
          <button type="button" disabled={exporting} onClick={exportPng} className="inline-flex items-center gap-2 rounded-xl bg-[#173d31] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f2c23] disabled:cursor-not-allowed disabled:opacity-50"><IconDownload size={15} />{exporting ? messages.generating : messages.downloadPng}</button>
          <button type="button" disabled={exporting} onClick={copyPng} className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]"><IconCopy size={15} />{exporting ? messages.generating : messages.copyPng}</button>
        </div>
      </header>
      <div className={`grid min-h-0 flex-1 gap-4 p-4 ${sidebarCollapsed ? 'xl:grid-cols-[400px_1fr]' : 'xl:grid-cols-[300px_1fr]'} xl:overflow-hidden`}>
        <EditorControls key={resetVersion} definition={definition} messages={messages} selectedVariant={selectedVariant} data={resolvedData} errors={errors} onVariantChange={changeVariant} onFieldChange={changeField} onFieldValidationError={changeFieldValidation} onImageUpload={process.env.NODE_ENV === 'production' ? undefined : uploadImage} />
        <TemplatePreview width={definition.width} height={definition.height} label={messages.preview} actualSizeLabel={messages.actualSize} fitToViewLabel={messages.fitToView}>
          <div ref={exportRef} style={{ width: definition.width, height: definition.height }}>
            {definition.render({
              data: resolvedData,
              assets,
              variant: selectedVariant as TemplateRenderProps<Definition>['variant'],
              width: definition.width,
              height: definition.height,
            })}
          </div>
        </TemplatePreview>
      </div>
      {metadataOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10271f]/60 p-4" onClick={(event) => { if (event.target === event.currentTarget) setMetadataOpen(false) }}>
          <div id="template-metadata-dialog" role="dialog" aria-modal="true" aria-labelledby="template-metadata-title" className="max-h-[80vh] w-full max-w-xl overflow-hidden rounded-2xl border border-black/10 bg-[#faf9f5] shadow-[0_24px_80px_rgba(16,39,31,0.32)] dark:border-white/10 dark:bg-[#1d2923]">
            <div className="flex items-start justify-between gap-4 border-b border-black/8 px-5 py-4 dark:border-white/10 sm:px-6">
              <div>
                <p className="text-[10px] font-bold tracking-[0.2em] text-[#4d675a] uppercase dark:text-[#a4b8ac]">{metadataLabel}</p>
                <h2 id="template-metadata-title" className="mt-1 text-xl font-black tracking-tight">{template.meta.title}</h2>
              </div>
              <button ref={metadataCloseRef} type="button" onClick={() => setMetadataOpen(false)} aria-label={closeLabel} title={closeLabel} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-[#4e5a53] transition hover:bg-[#efeee9] focus:ring-2 focus:ring-[#7fae98] focus:outline-none dark:text-[#d7e2dc] dark:hover:bg-[#2d4036] dark:focus:ring-[#c8f7d9]"><IconX size={18} aria-hidden="true" /></button>
            </div>
            <div className="max-h-[60vh] space-y-6 overflow-y-auto p-5 sm:p-6">
              <TemplateTags meta={template.meta} messages={messages} />
              <TemplateMetadata meta={template.meta} messages={messages} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function TemplateMetadata({ meta, messages }: { meta: TemplateMeta, messages: EditorMessages }) {
  if (meta.description === undefined && meta.marketingDescription === undefined) return null

  return (
    <dl className="space-y-5 text-sm text-[#59665f] dark:text-[#b8c8be]">
      {meta.description !== undefined && (
        <div>
          <dt className="font-bold tracking-[0.12em] text-[#537568] uppercase dark:text-[#91ae9f]">{messages.descriptionLabel}</dt>
          <dd className="mt-1 leading-6">{meta.description}</dd>
        </div>
      )}
      {meta.marketingDescription !== undefined && (
        <div>
          <dt className="font-bold tracking-[0.12em] text-[#537568] uppercase dark:text-[#91ae9f]">{messages.marketingDescriptionLabel}</dt>
          <dd className="mt-1 leading-6">{meta.marketingDescription}</dd>
        </div>
      )}
    </dl>
  )
}

function TemplateTags({ meta, messages }: { meta: TemplateMeta, messages: EditorMessages }) {
  if (!meta.tags || meta.tags.length === 0) return null

  return (
    <div>
      <p className="font-bold text-[10px] tracking-[0.12em] text-[#537568] uppercase dark:text-[#91ae9f]">{messages.tagsLabel}</p>
      <ul aria-label={messages.tagsLabel} className="mt-1 flex flex-wrap gap-1.5 text-xs text-[#59665f] dark:text-[#b8c8be]">
        {meta.tags.map((tag) => <li key={tag} className="rounded-full border border-[#cccec8] px-2 py-0.5 dark:border-white/15">{tag}</li>)}
      </ul>
    </div>
  )
}
