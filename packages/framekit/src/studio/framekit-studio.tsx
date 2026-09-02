'use client'

import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand, IconMoon, IconPhoto, IconSettings, IconStack2, IconSun, IconTag } from '@tabler/icons-react'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'

import { validateTemplateDefinition } from '../core/validation'
import { FrameKitEditor } from '../editor/framekit-editor'
import { FrameKitNavigationTree } from '../editor/framekit-navigation'
import { manifestToNavigation } from '../editor/navigation'
import type { TemplateDefinition, TemplateRegistryEntry } from '../types'
import { FrameKitBrandCatalog } from './brand-catalog'
import { useFrameKitLocale } from './locale-provider'

const emptyTemplates: readonly TemplateRegistryEntry[] = []
const emptyBrands: readonly FrameKitStudioBrand[] = []

export interface FrameKitStudioBrand {
  slug: string
  title: string
  segments: string[]
  description: string
  load: () => Promise<{ default: unknown }>
}

type FrameKitStudioProps =
  | { templates: readonly TemplateRegistryEntry[], brands?: readonly FrameKitStudioBrand[] }
  | { templates?: readonly TemplateRegistryEntry[], brands: readonly FrameKitStudioBrand[] }

type LoadState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error', kind: 'template' | 'brand' }
  | { status: 'invalid' }
  | { status: 'ready', kind: 'template', entry: TemplateRegistryEntry, definition: TemplateDefinition }
  | { status: 'ready', kind: 'brand', preview: ComponentType, component: FrameKitStudioBrand }

export function FrameKitStudio({ templates = emptyTemplates, brands = emptyBrands }: FrameKitStudioProps) {
  const { slug: segments } = useParams<{ slug?: string[] }>()
  const pathname = usePathname()
  const slug = segments?.join('/')
  const isBrand = pathname === '/brand' || pathname.startsWith('/brand/')
  const { locale, setLocale, messages } = useFrameKitLocale()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const navigation = manifestToNavigation(isBrand ? brands : templates, isBrand ? '/brand' : '/editor')

  useEffect(() => {
    if (!slug) return

    let cancelled = false
    if (isBrand) {
      const entry = brands.find((candidate) => candidate.slug === slug)
      if (!entry) return setLoadState({ status: 'not-found' })

      setLoadState({ status: 'loading' })
      entry.load().then((module) => {
        if (!cancelled) setLoadState({ status: 'ready', kind: 'brand', preview: module.default as ComponentType, component: entry })
      }).catch(() => {
        if (!cancelled) setLoadState({ status: 'error', kind: 'brand' })
      })
    } else {
      const entry = templates.find((candidate) => candidate.slug === slug)
      if (!entry) return setLoadState({ status: 'not-found' })

      setLoadState({ status: 'loading' })
      entry.load().then((module) => {
        if (cancelled) return
        const result = validateTemplateDefinition(module.default as TemplateDefinition)
        if (!result.success || result.definition.width !== entry.width || result.definition.height !== entry.height) {
          setLoadState({ status: 'invalid' })
          return
        }
        setLoadState({ status: 'ready', kind: 'template', entry, definition: result.definition })
      }).catch(() => {
        if (!cancelled) setLoadState({ status: 'error', kind: 'template' })
      })
    }

    return () => { cancelled = true }
  }, [slug, isBrand, templates, brands])

  function toggleTheme() {
    const dark = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', dark)
    document.cookie = `theme=${dark ? 'dark' : 'light'}; path=/; max-age=31536000; samesite=lax`
  }

  function toggleSidebar() {
    setSidebarCollapsed((collapsed) => !collapsed)
    setSettingsOpen(false)
  }

  let content: React.ReactNode
  if (!slug) content = <EmptyState isBrand={isBrand} />
  else if (loadState.status === 'loading') content = <LoadingState label={isBrand ? messages.brand.loadingLabel : messages.editor.loadingLabel} />
  else if (loadState.status === 'ready' && loadState.kind === 'template') content = <FrameKitEditor key={slug} template={loadState.entry} definition={loadState.definition} messages={messages.editor} sidebarCollapsed={sidebarCollapsed} />
  else if (loadState.status === 'ready' && loadState.kind === 'brand') content = <FrameKitBrandCatalog title={loadState.component.title} description={loadState.component.description} preview={loadState.preview} messages={messages.brand} />
  else if (loadState.status === 'invalid') content = <MessageState>{messages.editor.invalidDefinition}</MessageState>
  else if (loadState.status === 'error') content = <MessageState>{loadState.kind === 'brand' ? messages.brand.loadError : messages.editor.loadError}</MessageState>
  else content = <NotFoundState isBrand={isBrand} />

  return (
    <div className={`min-h-screen bg-[#f0eee7] lg:grid ${sidebarCollapsed ? 'lg:grid-cols-[56px_1fr]' : 'lg:grid-cols-[296px_1fr]'} xl:h-dvh xl:min-h-0 xl:overflow-hidden dark:bg-[#17221d]`}>
      <aside className={`flex flex-col border-b border-white/10 bg-[#10271f] text-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 ${sidebarCollapsed ? 'h-20.5 lg:h-screen' : ''}`}>
        {sidebarCollapsed ? (
          <>
            <button type="button" onClick={toggleSidebar} aria-label={messages.sidebar.expandLabel} title={messages.sidebar.expandLabel} className="inline-flex h-20.5 w-full shrink-0 items-center justify-center border-b border-white/10 text-[#c8f7d9] transition hover:bg-white/8 focus:ring-2 focus:ring-inset focus:ring-[#c8f7d9] focus:outline-none"><span className="flex size-11 items-center justify-center rounded-xl border border-white/20 bg-white/10"><IconLayoutSidebarLeftExpand size={18} /></span></button>
            <div className="hidden min-h-0 flex-1 items-center justify-center overflow-hidden lg:flex">
              <span aria-hidden="true" className="-rotate-90 whitespace-nowrap text-[10px] font-black tracking-[0.28em] text-[#91ae9f] select-none">F R A M E K I T</span>
            </div>
          </>
        ) : (
          <>
            <header className="flex h-20.5 shrink-0 items-center gap-3 border-b border-white/10 px-5">
              <div className="flex min-w-0 items-center gap-3">
                <img src="/assets/logos/framekit-small-dark.svg" alt="" aria-hidden="true" className="size-10 rounded-lg" />
                <div><p className="font-black tracking-[-0.02em]">FrameKit</p><p className="mt-0.5 text-[11px] tracking-[0.16em] text-[#91ae9f] uppercase">{messages.sidebar.workshop}</p></div>
              </div>
              <button type="button" onClick={toggleSidebar} aria-label={messages.sidebar.collapseLabel} title={messages.sidebar.collapseLabel} className="ml-auto inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-[#c8f7d9] transition hover:bg-white/10 focus:ring-2 focus:ring-[#c8f7d9] focus:outline-none"><IconLayoutSidebarLeftCollapse size={18} /></button>
            </header>
            <div className="grid grid-cols-2 gap-1 border-b border-white/10 p-3">
              <Link href="/editor" aria-current={!isBrand ? 'page' : undefined} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-bold transition ${!isBrand ? 'bg-[#c8f7d9] text-[#10271f]' : 'text-[#bed0c6] hover:bg-white/8 hover:text-white'}`}><IconStack2 size={16} aria-hidden="true" />{messages.sidebar.templatesLabel}</Link>
              <Link href="/brand" aria-current={isBrand ? 'page' : undefined} className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-bold transition ${isBrand ? 'bg-[#c8f7d9] text-[#10271f]' : 'text-[#bed0c6] hover:bg-white/8 hover:text-white'}`}><IconTag size={16} aria-hidden="true" />{messages.sidebar.brandsLabel}</Link>
            </div>
            <nav aria-label={messages.sidebar.navigationLabel} className="max-h-[38vh] overflow-y-auto p-3 lg:max-h-none lg:min-h-0 lg:flex-1">
              {navigation.length === 0 ? <p className="px-3 py-4 text-sm text-[#91ae9f]">{isBrand ? messages.sidebar.noBrands : messages.sidebar.noTemplates}</p> : <FrameKitNavigationTree nodes={navigation} />}
            </nav>
            <div className="relative mt-auto shrink-0 border-t border-white/10 px-5 py-4">
              <p className="text-center text-[10px] text-[#91ae9f]">{messages.sidebar.developedBy} <a href="https://mauriciodmo.com" className="font-bold text-[#c8f7d9] hover:underline" target="_blank">MauricioDMO</a></p>
              <div className="relative mt-3">
                {settingsOpen && (
                  <div id="sidebar-settings" className="absolute inset-x-0 bottom-[calc(100%+0.75rem)] z-20 rounded-xl border border-white/15 bg-[#173d31] p-3 shadow-xl">
                    <label className="flex flex-col gap-1 text-[10px] font-bold tracking-[0.12em] text-[#91ae9f] uppercase"><span>{messages.sidebar.languageLabel}</span><select aria-label={messages.sidebar.languageLabel} value={locale} onChange={(event) => setLocale(event.target.value as typeof locale)} className="studio-select studio-select--dark rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-xs font-bold tracking-normal text-white normal-case transition outline-none hover:bg-white/15 focus:ring-2 focus:ring-[#c8f7d9]">{Object.entries(messages.sidebar.languageNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                    <button type="button" onClick={toggleTheme} aria-label={messages.sidebar.themeToggleLabel} className="mt-3 inline-flex min-h-11 w-full items-center justify-between rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-bold text-[#c8f7d9] transition hover:bg-white/15 focus:ring-2 focus:ring-[#c8f7d9] focus:outline-none">{messages.sidebar.themeToggleLabel}<IconSun size={16} className="dark:hidden" /><IconMoon size={16} className="hidden dark:block" /></button>
                  </div>
                )}
                <button type="button" onClick={() => setSettingsOpen((open) => !open)} aria-label={messages.sidebar.settingsLabel} aria-controls="sidebar-settings" aria-expanded={settingsOpen} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-bold text-[#c8f7d9] transition hover:bg-white/15 focus:ring-2 focus:ring-[#c8f7d9] focus:outline-none"><IconSettings size={17} />{messages.sidebar.settingsLabel}</button>
              </div>
            </div>
          </>
        )}
      </aside>
      <main className="min-w-0 xl:min-h-0 xl:overflow-hidden">{content}</main>
    </div>
  )
}

function LoadingState({ label }: { label: string }) {
  return <div aria-busy="true" aria-label={label} className="flex min-h-screen flex-col text-[#17221d] xl:h-full xl:min-h-0 dark:text-[#e6eee9]"><header className="flex h-20.5 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-4 sm:px-7 dark:border-white/10 dark:bg-[#1d2923]"><div className="h-7 w-48 animate-pulse rounded-md bg-[#cbd5ce] dark:bg-[#40564a]" /><div className="h-10 w-32 animate-pulse rounded-xl bg-[#dce3de] dark:bg-[#2d4036]" /></header><div className="grid min-h-0 flex-1 gap-4 p-4 xl:grid-cols-[300px_1fr] xl:overflow-hidden"><aside className="rounded-2xl border border-black/8 bg-[#faf9f5] p-4 shadow-[0_6px_24px_rgba(45,53,48,0.05)] xl:min-h-0 xl:overflow-y-auto dark:border-white/10 dark:bg-[#1d2923]"><div className="h-full min-h-48 animate-pulse rounded-xl bg-[#e4e9e5] dark:bg-[#26382f]" /></aside><section className="relative flex min-h-130 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-black/5 bg-[#d9d7cf] p-6 shadow-inner dark:border-white/10 dark:bg-[#2a3931]"><div className="absolute inset-0 bg-[radial-gradient(#4f5e56_0.7px,transparent_0.7px)] bg-size-[16px_16px] opacity-30 dark:opacity-50" /><div className="relative aspect-square w-[min(70%,720px)] animate-pulse rounded-sm bg-[#cbd5ce] shadow-[0_24px_60px_rgba(25,35,30,0.24)] dark:bg-[#12382c]" /></section></div></div>
}

function EmptyState({ isBrand }: { isBrand: boolean }) {
  const { messages } = useFrameKitLocale()
  const title = isBrand ? messages.brand.emptyTitle : messages.emptyState.title
  const description = isBrand ? messages.brand.emptyDescription : messages.emptyState.description
  return <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen"><div className="max-w-md text-center"><div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-[#173d31] text-[#b9f8d2] shadow-[0_10px_30px_rgba(23,61,49,0.25)]"><IconPhoto size={28} stroke={1.7} /></div><p className="mt-7 text-xs font-bold tracking-[0.24em] text-[#577066] uppercase dark:text-[#a4b8ac]">{isBrand ? messages.brand.componentLabel : messages.emptyState.ready}</p><h1 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[#17221d] dark:text-[#e6eee9]">{title}</h1><p className="mt-3 leading-7 text-[#657168] dark:text-[#b8c8be]">{description}</p></div></div>
}

function NotFoundState({ isBrand }: { isBrand: boolean }) {
  const { messages } = useFrameKitLocale()
  return <div className="flex min-h-[60vh] items-center justify-center p-8 lg:min-h-screen"><div className="max-w-md text-center"><p className="text-xs font-bold tracking-[0.24em] text-[#748078] uppercase">{messages.notFound.statusLabel}</p><h1 className="mt-3 text-3xl font-black tracking-tight">{isBrand ? messages.brand.notFoundTitle : messages.notFound.title}</h1><p className="mt-3 leading-7 text-[#657168]">{isBrand ? messages.brand.notFoundDescription : messages.notFound.description}</p><Link href={isBrand ? '/brand' : '/editor'} className="mt-7 inline-block rounded-xl bg-[#173d31] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0f2c23]">{messages.notFound.backToEditor}</Link></div></div>
}

function MessageState({ children }: { children: React.ReactNode }) {
  return <div role="alert" className="flex min-h-[60vh] items-center justify-center p-8 text-[#17221d] dark:text-[#e6eee9]">{children}</div>
}
