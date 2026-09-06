'use client'

import type { ComponentType } from 'react'

export function FrameKitBrandCatalog ({
  title,
  description,
  preview: Preview,
  messages
}: {
  title: string
  description: string
  preview: ComponentType
  messages: {
    componentLabel: string
    previewLabel: string
    descriptionLabel: string
    editHint: string
    badgeLabel: string
    sourceLabel: string
  }
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-y-auto text-fk-forest-400 dark:text-fk-sage-100 xl:h-full xl:min-h-0">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-fk-ivory-100 px-5 py-5 dark:border-white/10 dark:bg-fk-forest-200 sm:px-7">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.componentLabel}</p>
          <h1 className="mt-1 text-xl font-black tracking-tight">{title}</h1>
        </div>
        <span className="rounded-full border border-fk-ivory-400 px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-fk-sage-400 uppercase dark:border-white/15 dark:text-fk-sage-300">{messages.badgeLabel}</span>
      </header>
      <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:p-6">
        <section aria-label={messages.previewLabel} className="relative flex min-h-[28rem] items-center justify-center overflow-auto rounded-2xl border border-black/5 bg-fk-ivory-300 p-6 shadow-inner dark:border-white/10 dark:bg-fk-forest-100">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#4f5e56_0.7px,transparent_0.7px)] bg-size-[16px_16px] opacity-30 dark:opacity-50" />
          <div className="relative flex min-h-80 min-w-80 max-w-full items-center justify-center overflow-auto rounded-2xl bg-fk-ivory-100 p-8 shadow-2xl dark:bg-fk-forest-200 [&>*]:max-w-full">
            <Preview />
          </div>
        </section>
        <aside className="rounded-2xl border border-black/8 bg-fk-ivory-100 p-5 shadow-md dark:border-white/10 dark:bg-fk-forest-200">
          <p className="text-[11px] font-bold tracking-[0.16em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.descriptionLabel}</p>
          <p className="mt-3 text-[15px] leading-7 text-fk-sage-400 dark:text-fk-sage-200">{description}</p>
          <div className="mt-8 border-t border-black/8 pt-5 dark:border-white/10">
            <p className="text-[11px] font-bold tracking-[0.16em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.sourceLabel}</p>
            <p className="mt-2 text-sm leading-6 text-fk-sage-400 dark:text-fk-sage-200">{messages.editHint}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
