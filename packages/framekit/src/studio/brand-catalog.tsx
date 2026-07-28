'use client'

import type { ComponentType } from 'react'

export function FrameKitBrandCatalog({
  title,
  description,
  preview: Preview,
  messages,
}: {
  title: string
  description: string
  preview: ComponentType
  messages: {
    componentLabel: string
    previewLabel: string
    descriptionLabel: string
    editHint: string
  }
}) {
  return (
    <div className="flex min-h-screen flex-col overflow-y-auto text-[#17221d] xl:h-full xl:min-h-0 dark:text-[#e6eee9]">
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-5 sm:px-7 dark:border-white/10 dark:bg-[#1d2923]">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-[#4d675a] uppercase dark:text-[#a4b8ac]">{messages.componentLabel}</p>
          <h1 className="mt-1 text-xl font-black tracking-tight">{title}</h1>
        </div>
        <span className="rounded-full border border-[#d6d5ce] px-3 py-1.5 text-[11px] font-bold tracking-[0.12em] text-[#537568] uppercase dark:border-white/15 dark:text-[#b8c8be]">Brand</span>
      </header>
      <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[minmax(0,1fr)_300px] xl:p-6">
        <section aria-label={messages.previewLabel} className="relative flex min-h-[28rem] items-center justify-center overflow-auto rounded-2xl border border-black/5 bg-[#d9d7cf] p-6 shadow-inner dark:border-white/10 dark:bg-[#2a3931]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#4f5e56_0.7px,transparent_0.7px)] bg-size-[16px_16px] opacity-30 dark:opacity-50" />
          <div className="relative flex min-h-80 min-w-80 max-w-full items-center justify-center overflow-auto rounded-2xl bg-[#faf9f5] p-8 shadow-[0_24px_60px_rgba(25,35,30,0.18)] dark:bg-[#1d2923] [&>*]:max-w-full">
            <Preview />
          </div>
        </section>
        <aside className="rounded-2xl border border-black/8 bg-[#faf9f5] p-5 shadow-[0_6px_24px_rgba(45,53,48,0.05)] dark:border-white/10 dark:bg-[#1d2923]">
          <p className="text-[11px] font-bold tracking-[0.16em] text-[#537568] uppercase dark:text-[#91ae9f]">{messages.descriptionLabel}</p>
          <p className="mt-3 text-[15px] leading-7 text-[#59665f] dark:text-[#b8c8be]">{description}</p>
          <div className="mt-8 border-t border-black/8 pt-5 dark:border-white/10">
            <p className="text-[11px] font-bold tracking-[0.16em] text-[#537568] uppercase dark:text-[#91ae9f]">component.tsx</p>
            <p className="mt-2 text-sm leading-6 text-[#657168] dark:text-[#a4b8ac]">{messages.editHint}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
