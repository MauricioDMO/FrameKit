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
        className="flex min-h-screen flex-col text-[#17221d] dark:text-[#e6eee9] xl:h-full xl:min-h-0"
      >
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-4 sm:px-7 dark:border-white/10 dark:bg-[#1d2923]">
          <div className="space-y-2">
            <div className="h-2 w-24 animate-pulse rounded-full bg-[#b9c8be] dark:bg-[#587165]" />
            <div className="h-6 w-48 animate-pulse rounded-md bg-[#cbd5ce] dark:bg-[#40564a]" />
          </div>
          <div className="flex gap-2">
            <div className="inline-flex items-center gap-2 animate-pulse rounded-xl border border-[#cccec8] bg-[#dce3de] px-3.5 py-2.5 text-base font-normal dark:border-white/15 dark:bg-[#2d4036]">
              <span className="size-[15px] shrink-0" />
              <span className="invisible whitespace-nowrap">{messages.reset}</span>
            </div>
            <div className="inline-flex items-center gap-2 animate-pulse rounded-xl bg-[#b8e9ca] px-3.5 py-2.5 text-base font-normal dark:bg-[#315c49]">
              <span className="size-[15px] shrink-0" />
              <span className="invisible whitespace-nowrap">{messages.downloadPng}</span>
            </div>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[300px_1fr] xl:overflow-hidden">
          <aside className="rounded-2xl border border-black/8 bg-[#faf9f5] p-4 shadow-[0_6px_24px_rgba(45,53,48,0.05)] dark:border-white/10 dark:bg-[#1d2923] xl:min-h-0 xl:overflow-y-auto">
            <div className="flex items-baseline justify-between border-b border-black/8 pb-3 dark:border-white/10">
              <div className="h-5 w-20 animate-pulse rounded-md bg-[#cbd5ce] dark:bg-[#40564a]" />
              <div className="h-3 w-12 animate-pulse rounded-full bg-[#dce3de] dark:bg-[#344a3e]" />
            </div>
            <div className="mt-4 space-y-4">
              {[
                'w-28',
                'w-16',
                'w-20',
                'w-24',
                'w-28',
                'w-32',
              ].map((labelWidth, index) => (
                <div key={index} className="space-y-2">
                  <div className={`h-2.5 ${labelWidth} animate-pulse rounded-full bg-[#b9c8be] dark:bg-[#587165]`} />
                  <div className="h-11 w-full animate-pulse rounded-xl bg-[#e4e9e5] dark:bg-[#26382f]" />
                </div>
              ))}
            </div>
          </aside>

          <section className="relative flex min-h-[520px] flex-1 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#d9d7cf] p-6 shadow-inner dark:border-white/10 dark:bg-[#2a3931]">
            <div className="absolute inset-0 opacity-30 [background-image:radial-gradient(#4f5e56_0.7px,transparent_0.7px)] [background-size:16px_16px] dark:opacity-50" />
            <div className="relative aspect-square w-[min(70%,720px)] animate-pulse overflow-hidden rounded-sm bg-[#cbd5ce] shadow-[0_24px_60px_rgba(25,35,30,0.24)] dark:bg-[#12382c]">
              <div className="absolute inset-x-[8%] top-[8%] h-3 w-1/3 rounded-full bg-[#dce3de]/70 dark:bg-[#6d9f86]/40" />
              <div className="absolute inset-x-[8%] top-[35%] space-y-3">
                <div className="h-8 w-4/5 rounded-md bg-[#e4e9e5]/70 dark:bg-[#9bc9ad]/35" />
                <div className="h-8 w-3/5 rounded-md bg-[#e4e9e5]/70 dark:bg-[#9bc9ad]/35" />
                <div className="mt-8 h-3 w-2/5 rounded-full bg-[#dce3de]/60 dark:bg-[#6d9f86]/35" />
              </div>
              <div className="absolute inset-x-[8%] bottom-[8%] h-px bg-[#dce3de]/70 dark:bg-[#6d9f86]/35" />
            </div>
            <div className="absolute bottom-4 right-4 h-10 w-44 animate-pulse rounded-lg bg-white/70 dark:bg-[#24342c]" />
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
