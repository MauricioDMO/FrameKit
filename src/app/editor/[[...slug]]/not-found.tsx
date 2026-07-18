'use client'

import Link from 'next/link'

import { useLocale } from '@/i18n/locale-provider'

export default function TemplateNotFound() {
  const { messages: allMessages } = useLocale()
  const messages = allMessages.notFound

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#748078]">
          Error 404
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          {messages.title}
        </h1>
        <p className="mt-3 leading-7 text-[#657168]">
          {messages.description}
        </p>
        <Link
          href="/editor"
          className="mt-7 inline-block rounded-xl bg-[#173d31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f2c23]"
        >
          {messages.backToEditor}
        </Link>
      </div>
    </div>
  )
}
