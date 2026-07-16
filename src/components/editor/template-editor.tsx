'use client'

import { Download, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { templateRegistry } from '@/generated/template-registry'
import type { Locale } from '@/i18n/locales'
import type { getMessages } from '@/i18n/messages'
import type {
  TemplateConfig,
  TemplateData,
} from '@/lib/templates/types'
import {
  hasTemplateLanguage,
  localizeTemplateConfig,
} from '@/lib/templates/types'

import { EditorField } from './fields'
import { TemplatePreview } from './template-preview'

interface TemplateEditorProps {
  templateSlug: string
  config: TemplateConfig
  locale: Locale
  messages: ReturnType<typeof getMessages>['editor']
}

interface EditorContent {
  locale: string
  data: TemplateData
}

function getDefaultContent(config: TemplateConfig, locale: Locale): EditorContent {
  const localizedConfig = localizeTemplateConfig(config, locale)

  return {
    locale: localizedConfig.language,
    data: { ...localizedConfig.content },
  }
}

function getStoredContent(
  config: TemplateConfig,
  templateSlug: string,
): EditorContent | null {
  try {
    const stored = JSON.parse(
      window.sessionStorage.getItem(`image-studio:${templateSlug}`) ?? 'null',
    ) as Partial<EditorContent> | null

    if (!stored || !stored.locale || !hasTemplateLanguage(config, stored.locale)) {
      return null
    }

    if (!stored.data || !Object.values(stored.data).every((value) => typeof value === 'string')) {
      return null
    }

    return { locale: stored.locale, data: stored.data }
  } catch {
    return null
  }
}

export function TemplateEditor({
  templateSlug,
  config,
  locale,
  messages,
}: TemplateEditorProps) {
  const exportRef = useRef<HTMLDivElement>(null)
  const [content, setContent] = useState(() =>
    getDefaultContent(config, locale),
  )
  const [hydrated, setHydrated] = useState(false)
  const contentLocale = content.locale
  const contentConfig = localizeTemplateConfig(config, contentLocale)
  const data = content.data
  const [exporting, setExporting] = useState(false)
  const Template = templateRegistry[templateSlug]

  useEffect(() => {
    const storedContent = getStoredContent(config, templateSlug)
    let cancelled = false

    queueMicrotask(() => {
      if (cancelled) return
      if (storedContent) setContent(storedContent)
      setHydrated(true)
    })

    return () => {
      cancelled = true
    }
  }, [config, templateSlug])

  useEffect(() => {
    if (!hydrated) return

    window.sessionStorage.setItem(
      `image-studio:${templateSlug}`,
      JSON.stringify(content),
    )
  }, [content, hydrated, templateSlug])

  function updateField(key: string, value: string) {
    setContent((current) => ({
      ...current,
      data: { ...current.data, [key]: value },
    }))
  }

  function changeContentLocale(nextLocale: string) {
    setContent({
      locale: nextLocale,
      data: { ...localizeTemplateConfig(config, nextLocale).content },
    })
  }

  async function exportPng() {
    const element = exportRef.current
    if (!element || exporting) return

    try {
      setExporting(true)
      await document.fonts.ready

      const { domToPng } = await import('modern-screenshot')
      const image = await domToPng(element, {
        width: contentConfig.width,
        height: contentConfig.height,
        scale: 1,
      })
      const link = document.createElement('a')

      link.href = image
      link.download = `${
        contentConfig.fileName ?? templateSlug.replaceAll('/', '-')
      }.png`
      link.click()
    } catch (error) {
      console.error(messages.exportError, error)
      window.alert(messages.exportAlert)
    } finally {
      setExporting(false)
    }
  }

  if (!Template) {
    return (
      <div className="p-8 text-sm">
        {messages.missingComponent}{' '}
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
            {messages.templateEditor}
          </p>
          <h1 className="mt-1 text-xl font-black tracking-[-0.025em]">
            {contentConfig.title}
          </h1>
          {contentConfig.description && (
            <p className="mt-1 max-w-2xl text-sm text-[#6c756f]">
              {contentConfig.description}
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() =>
              setContent((current) => ({
                ...current,
                data: { ...contentConfig.content },
              }))
            }
            className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9]"
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

      <div className="grid min-h-0 flex-1 gap-5 p-4 sm:p-5 xl:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border border-black/8 bg-[#faf9f5] p-5 shadow-[0_6px_24px_rgba(45,53,48,0.05)] xl:max-h-[calc(100vh-132px)] xl:overflow-y-auto">
          <div className="flex items-baseline justify-between border-b border-black/8 pb-4">
            <h2 className="font-black tracking-tight">{messages.content}</h2>
            <span className="text-xs text-[#5f6963]">
              {contentConfig.width} × {contentConfig.height}
            </span>
          </div>
          <div className="mt-5 space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#59665f]">
                {messages.contentLanguageLabel}
              </span>
              <select
                value={contentLocale}
                onChange={(event) => changeContentLocale(event.target.value)}
                className="studio-select w-full rounded-xl border border-[#d6d5ce] bg-[#fbfaf6] px-3.5 py-2.5 text-sm font-bold text-[#17221d] outline-none transition focus:border-[#39775f] focus:ring-3 focus:ring-[#39775f]/10"
              >
                {Object.entries(config.languages).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
            {contentConfig.fields.map((field) => (
              <EditorField
                key={field.key}
                field={field}
                value={data[field.key] ?? ''}
                onChange={(value) => updateField(field.key, value)}
              />
            ))}
          </div>
        </aside>

        <TemplatePreview
          width={contentConfig.width}
          height={contentConfig.height}
          label={messages.preview}
        >
          <div
            ref={exportRef}
            style={{ width: contentConfig.width, height: contentConfig.height }}
          >
            <Template
              data={data}
              width={contentConfig.width}
              height={contentConfig.height}
              locale={contentLocale}
            />
          </div>
        </TemplatePreview>
      </div>
    </div>
  )
}
