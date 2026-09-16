'use client'

import { IconPhoto } from '@tabler/icons-react'
import Link from 'next/link'
import type { ReactNode } from 'react'

import type { FrameKitStudioMessages } from '../i18n/messages'
import type { FrameKitStudioSection } from '../types'

type CatalogSection = Exclude<FrameKitStudioSection, 'settings'>

export function LoadingState ({ label }: { label: string }) {
  return (
    <div
      aria-busy="true"
      aria-label={label}
      className="flex min-h-screen flex-col text-fk-forest-400 dark:text-fk-sage-100 xl:h-full xl:min-h-0"
    >
      <header className="flex h-20.5 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-fk-ivory-100 px-5 py-4 dark:border-white/10 dark:bg-fk-forest-200 sm:px-7">
        <div className="h-7 w-48 animate-pulse rounded-md bg-fk-ivory-400 dark:bg-fk-forest-200" />
        <div className="h-10 w-32 animate-pulse rounded-xl bg-fk-ivory-300 dark:bg-fk-forest-100" />
      </header>
      <div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[300px_1fr] xl:overflow-hidden">
        <aside className="rounded-2xl border border-black/8 bg-fk-ivory-100 p-4 shadow-md dark:border-white/10 dark:bg-fk-forest-200 xl:min-h-0 xl:overflow-y-auto">
          <div className="h-full min-h-48 animate-pulse rounded-xl bg-fk-ivory-400 dark:bg-fk-forest-100" />
        </aside>
        <section className="relative flex min-h-130 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-fk-ivory-300 p-6 shadow-inner dark:border-white/10 dark:bg-fk-forest-100">
          <div className="absolute inset-0 bg-[radial-gradient(#4f5e56_0.7px,transparent_0.7px)] bg-size-[16px_16px] opacity-30 dark:opacity-50" />
          <div className="relative aspect-square w-[min(70%,720px)] animate-pulse rounded-sm bg-fk-ivory-400 shadow-2xl dark:bg-fk-forest-200" />
        </section>
      </div>
    </div>
  )
}

export function EmptyState ({ section, messages }: { section: CatalogSection, messages: FrameKitStudioMessages }) {
  const isBrand = section === 'brand'
  const title = isBrand ? messages.brand.emptyTitle : messages.emptyState.title
  const description = isBrand ? messages.brand.emptyDescription : messages.emptyState.description

  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen">
      <div className="max-w-md text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-fk-forest-300 text-fk-mint-200 shadow-xl">
          <IconPhoto size={28} stroke={1.7} />
        </div>
        <p className="mt-7 text-xs font-bold tracking-[0.24em] text-fk-sage-400 uppercase dark:text-fk-sage-300">
          {isBrand ? messages.brand.componentLabel : messages.emptyState.ready}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-fk-forest-400 dark:text-fk-sage-100">
          {title}
        </h1>
        <p className="mt-3 leading-7 text-fk-sage-400 dark:text-fk-sage-200">
          {description}
        </p>
      </div>
    </div>
  )
}

export function NotFoundState ({ section, messages }: { section: CatalogSection, messages: FrameKitStudioMessages }) {
  const isBrand = section === 'brand'
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen">
      <div className="max-w-md text-center">
        <p className="text-xs font-bold tracking-[0.24em] text-fk-sage-400 uppercase">
          {messages.notFound.statusLabel}
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight">
          {isBrand ? messages.brand.notFoundTitle : messages.notFound.title}
        </h1>
        <p className="mt-3 leading-7 text-fk-sage-400">
          {isBrand ? messages.brand.notFoundDescription : messages.notFound.description}
        </p>
        <Link
          href={isBrand ? '/brand' : '/editor'}
          className="mt-7 inline-block rounded-xl bg-fk-forest-300 px-5 py-3 text-sm font-bold text-white transition hover:bg-fk-forest-400"
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
      className="flex min-h-[60vh] items-center justify-center p-8 text-fk-forest-400 dark:text-fk-sage-100"
    >
      {children}
    </div>
  )
}
