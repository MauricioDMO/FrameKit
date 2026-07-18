'use client'

import { ImageIcon } from 'lucide-react'

import { useLocale } from '@/i18n/locale-provider'

export function EditorEmptyState() {
  const { messages } = useLocale()

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#173d31] text-[#b9f8d2] shadow-[0_10px_30px_rgba(23,61,49,0.25)]">
          <ImageIcon size={28} strokeWidth={1.7} />
        </div>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.24em] text-[#577066] dark:text-[#a4b8ac]">
          {messages.emptyState.ready}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#17221d] dark:text-[#e6eee9]">
          {messages.emptyState.title}
        </h1>
        <p className="mt-3 leading-7 text-[#657168] dark:text-[#b8c8be]">
          {messages.emptyState.description}
        </p>
      </div>
    </div>
  )
}
