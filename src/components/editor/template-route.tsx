'use client'

import { useEffect, useState } from 'react'

import { useLocale } from '@/i18n/locale-provider'
import type { TemplateDefinition } from '@/lib/framekit'
import { validateTemplateDefinition } from '@/lib/framekit'
import { templateRegistry } from '@/.framekit/registry'

import { FrameKitEditor } from './framekit-editor'

interface TemplateRouteProps {
  slug: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message?: string }
  | { status: 'invalid'; message: string }
  | { status: 'ready'; definition: TemplateDefinition }

export function TemplateRoute({ slug }: TemplateRouteProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const { messages: allMessages } = useLocale()
  const messages = allMessages.editor

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const loader = templateRegistry[slug]
        if (!loader) {
          if (!cancelled) setLoadState({ status: 'error' })
          return
        }

        const loaded = await loader()
        const validation = validateTemplateDefinition(loaded.default)

        if (!validation.success) {
          if (!cancelled) setLoadState({ status: 'invalid', message: validation.error })
          return
        }

        if (!cancelled) setLoadState({ status: 'ready', definition: validation.definition })
      } catch (err) {
        if (!cancelled) setLoadState({ status: 'error', message: String(err) })
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loadState.status === 'loading') {
    return (
      <div
        aria-busy="true"
        aria-label={messages.loadingLabel}
        className="flex min-h-screen flex-col text-[#17221d] xl:h-full xl:min-h-0 dark:text-[#e6eee9]"
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-4 sm:px-7 dark:border-white/10 dark:bg-[#1d2923]">
          <div className="h-7 w-48 animate-pulse rounded-md bg-[#cbd5ce] dark:bg-[#40564a]" />
          <div className="h-10 w-32 animate-pulse rounded-xl bg-[#dce3de] dark:bg-[#2d4036]" />
        </header>

        <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[300px_1fr] xl:overflow-hidden">
          <aside className="rounded-2xl border border-black/8 bg-[#faf9f5] p-4 shadow-[0_6px_24px_rgba(45,53,48,0.05)] xl:min-h-0 xl:overflow-y-auto dark:border-white/10 dark:bg-[#1d2923]">
            <div className="h-full min-h-48 animate-pulse rounded-xl bg-[#e4e9e5] dark:bg-[#26382f]" />
          </aside>

          <section className="relative flex min-h-130 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#d9d7cf] p-6 shadow-inner dark:border-white/10 dark:bg-[#2a3931]">
            <div className="absolute inset-0 [background-image:radial-gradient(#4f5e56_0.7px,transparent_0.7px)] [background-size:16px_16px] opacity-30 dark:opacity-50" />
            <div className="relative aspect-square w-[min(70%,720px)] animate-pulse rounded-sm bg-[#cbd5ce] shadow-[0_24px_60px_rgba(25,35,30,0.24)] dark:bg-[#12382c]" />
          </section>
        </div>
      </div>
    )
  }

  if (loadState.status === 'error') {
    return <div>{loadState.message ?? messages.loadError}</div>
  }

  if (loadState.status === 'invalid') {
    return <div>{messages.invalidDefinition}</div>
  }

  return <FrameKitEditor slug={slug} definition={loadState.definition} messages={messages} />
}
