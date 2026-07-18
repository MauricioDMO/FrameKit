'use client'

import { Download, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import type { getMessages } from '@/i18n/messages'
import type { TemplateDefinition } from '@/lib/framekit'
import { resolveTemplateData, validateTemplateData } from '@/lib/framekit'

import { EditorField } from './fields'
import { TemplatePreview } from './template-preview'

interface FramekitEditorProps {
  slug: string
  definition: TemplateDefinition
  messages: ReturnType<typeof getMessages>['editor']
}

interface EditorState {
  selectedLocale: string
  dataByLocale: Record<string, Record<string, string>>
}

const STORAGE_KEY = (slug: string) => `framekit:${slug}:v1`

function getInitialState(definition: TemplateDefinition): EditorState {
  const firstLocale = Object.keys(definition.content)[0]
  return {
    selectedLocale: firstLocale,
    dataByLocale: {},
  }
}

function loadPersistedState(
  slug: string,
  definition: TemplateDefinition,
): EditorState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY(slug))
    if (!stored) return null

    const parsed = JSON.parse(stored) as Partial<EditorState>

    if (!parsed || typeof parsed !== 'object') return null

    const validLocales = new Set(Object.keys(definition.content))
    if (parsed.selectedLocale && !validLocales.has(parsed.selectedLocale)) {
      return null
    }

    const validFieldKeys = new Set(Object.keys(definition.fields))
    const cleanedDataByLocale: Record<string, Record<string, string>> = {}

    if (parsed.dataByLocale && typeof parsed.dataByLocale === 'object') {
      for (const [locale, fields] of Object.entries(parsed.dataByLocale)) {
        if (!validLocales.has(locale)) continue
        if (!fields || typeof fields !== 'object') continue

        const cleanedFields: Record<string, string> = {}
        for (const [key, value] of Object.entries(fields)) {
          if (!validFieldKeys.has(key)) continue
          if (typeof value !== 'string') continue
          cleanedFields[key] = value
        }
        cleanedDataByLocale[locale] = cleanedFields
      }
    }

    return {
      selectedLocale: parsed.selectedLocale ?? Object.keys(definition.content)[0],
      dataByLocale: cleanedDataByLocale,
    }
  } catch {
    return null
  }
}

export function FrameKitEditor({
  slug,
  definition,
  messages,
}: FramekitEditorProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const hydratedRef = useRef(false)
  const [state, setState] = useState<EditorState>(() => {
    const restored = loadPersistedState(slug, definition)
    return restored ?? getInitialState(definition)
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [exporting, setExporting] = useState(false)

  const selectedLocale = state.selectedLocale
  const userEdits = state.dataByLocale[selectedLocale] ?? {}
  const resolvedData = resolveTemplateData(definition, selectedLocale, userEdits)

  const editorFields = Object.entries(definition.fields).map(([key, field]) => ({
    key,
    type: field.kind,
    required: field.required ?? true,
    label: field.label,
    placeholder: field.placeholder,
  }))

  useEffect(() => {
    hydratedRef.current = true
  }, [])

  useEffect(() => {
    if (!hydratedRef.current) return
    localStorage.setItem(STORAGE_KEY(slug), JSON.stringify(state))
  }, [state, slug])

  function changeLocale(nextLocale: string) {
    setState((current) => ({
      ...current,
      selectedLocale: nextLocale,
    }))
  }

  function resetLocale() {
    setState((current) => {
      const next = { ...current }
      delete next.dataByLocale[selectedLocale]
      return next
    })
    setErrors((current) => {
      const next = { ...current }
      delete next[selectedLocale]
      return next
    })
  }

  function updateField(key: string, value: string) {
    setState((current) => ({
      ...current,
      dataByLocale: {
        ...current.dataByLocale,
        [selectedLocale]: {
          ...current.dataByLocale[selectedLocale],
          [key]: value,
        },
      },
    }))
    if (errors[key]) {
      setErrors((current) => {
        const next = { ...current }
        delete next[key]
        return next
      })
    }
  }

  async function exportPng() {
    const element = exportRef.current
    if (!element || exporting) return

    const validationErrors = validateTemplateData(definition, selectedLocale, resolvedData)
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      const firstErrorKey = Object.keys(validationErrors)[0]
      const firstInput = document.querySelector(`[data-field-key="${firstErrorKey}"]`) as HTMLInputElement | null
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
    <div className="flex min-h-screen flex-col text-[#17221d] dark:text-[#e6eee9] xl:h-full xl:min-h-0">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-4 sm:px-7 dark:border-white/10 dark:bg-[#1d2923]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#4d675a] dark:text-[#a4b8ac]">
            {messages.templateEditor}
          </p>
          <h1 className="mt-1 text-xl font-black tracking-[-0.025em]">
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
        <aside className="rounded-2xl border border-black/8 bg-[#faf9f5] p-4 shadow-[0_6px_24px_rgba(45,53,48,0.05)] dark:border-white/10 dark:bg-[#1d2923] xl:min-h-0 xl:overflow-y-auto">
          <div className="flex items-baseline justify-between border-b border-black/8 pb-3 dark:border-white/10">
            <h2 className="font-black tracking-tight">{messages.content}</h2>
            <span className="text-xs text-[#5f6963] dark:text-[#b8c8be]">
              {definition.width} × {definition.height}
            </span>
          </div>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#59665f] dark:text-[#b8c8be]">
                {messages.contentLanguageLabel}
              </span>
              <select
                value={selectedLocale}
                onChange={(event) => changeLocale(event.target.value)}
                className="studio-select w-full rounded-xl border border-[#d6d5ce] bg-[#fbfaf6] px-3 py-2 text-sm font-bold text-[#17221d] outline-none transition focus:border-[#39775f] focus:ring-3 focus:ring-[#39775f]/10 dark:border-white/15 dark:bg-[#24342c] dark:text-[#e6eee9]"
              >
                {Object.entries(definition.content).map(([value, contentEntry]) => (
                  <option key={value} value={value}>{contentEntry.language}</option>
                ))}
              </select>
            </label>
            {editorFields.map((field) => (
              <div key={field.key} data-field-key={field.key}>
                <EditorField
                  field={field}
                  value={resolvedData[field.key] ?? ''}
                  onChange={(value) => updateField(field.key, value)}
                  error={errors[field.key]}
                />
              </div>
            ))}
          </div>
        </aside>

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
