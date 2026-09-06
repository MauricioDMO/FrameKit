'use client'

import { IconPhoto } from '@tabler/icons-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { FrameKitStudioMessages } from '../i18n/messages'

export function LoadingState ({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="flex min-h-screen flex-col text-[#17221d] xl:h-full xl:min-h-0 dark:text-[#e6eee9]"
    >
      <header className="flex h-20.5 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-4 sm:px-7 dark:border-white/10 dark:bg-[#1d2923]">
        <div className="h-7 w-48 animate-pulse rounded-md bg-[#cbd5ce] dark:bg-[#40564a]" />
        <div className="h-10 w-32 animate-pulse rounded-xl bg-[#dce3de] dark:bg-[#2d4036]" />
      </header>
      <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[300px_1fr] xl:overflow-hidden">
        <aside className="rounded-2xl border border-black/8 bg-[#faf9f5] p-4 shadow-[0_6px_24px_rgba(45,53,48,0.05)] xl:min-h-0 xl:overflow-y-auto dark:border-white/10 dark:bg-[#1d2923]">
          <div className="h-full min-h-48 animate-pulse rounded-xl bg-[#e4e9e5] dark:bg-[#26382f]" />
        </aside>
        <section className="relative flex min-h-130 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#d9d7cf] p-6 shadow-inner dark:border-white/10 dark:bg-[#2a3931]">
          <div className="absolute inset-0 bg-[radial-gradient(#4f5e56_0.7px,transparent_0.7px)] bg-size-[16px_16px] opacity-30 dark:opacity-50" />
          <div className="relative aspect-square w-[min(70%,720px)] animate-pulse rounded-sm bg-[#cbd5ce] shadow-[0_24px_60px_rgba(25,35,30,0.24)] dark:bg-[#12382c]" />
        </section>
      </div>
    </div>
  )
}

export function EmptyState ({ isBrand, messages }: { isBrand: boolean, messages: FrameKitStudioMessages }) {
  const title = isBrand ? messages.brand.emptyTitle : messages.emptyState.title
  const description = isBrand ? messages.brand.emptyDescription : messages.emptyState.description

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#173d31] text-[#b9f8d2] shadow-[0_10px_30px_rgba(23,61,49,0.25)]">
          <IconPhoto size={28} stroke={1.7} />
        </div>
        <p className="mt-7 text-xs font-bold tracking-[0.24em] text-[#577066] uppercase dark:text-[#a4b8ac]">
          {isBrand ? messages.brand.componentLabel : messages.emptyState.ready}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#17221d] dark:text-[#e6eee9]">
          {title}
        </h1>
        <p className="mt-3 leading-7 text-[#657168] dark:text-[#b8c8be]">
          {description}
        </p>
      </div>
    </div>
  )
}

export function NotFoundState ({ isBrand, messages }: { isBrand: boolean, messages: FrameKitStudioMessages }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold tracking-[0.24em] text-[#748078] uppercase">
          {messages.notFound.statusLabel}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          {isBrand ? messages.brand.notFoundTitle : messages.notFound.title}
        </h1>
        <p className="mt-3 leading-7 text-[#657168]">
          {isBrand ? messages.brand.notFoundDescription : messages.notFound.description}
        </p>
        <Link
          href={isBrand ? '/brand' : '/editor'}
          className="mt-7 inline-block rounded-xl bg-[#173d31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f2c23]"
        >
          {messages.notFound.backToEditor}
        </Link>
      </div>
    </div>
  )
}

export function MessageState ({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="flex min-h-[60vh] items-center justify-center p-8 text-[#17221d] dark:text-[#e6eee9]"
    >
      {children}
    </div>
  )
}
