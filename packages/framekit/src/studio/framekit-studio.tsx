'use client'

import { useParams, usePathname } from 'next/navigation'
import { useState } from 'react'
import type { ReactNode } from 'react'

import { FrameKitEditor } from '../editor/framekit-editor'
import { manifestToNavigation } from '@/editor/navigation/navigation'
import type { TemplateRegistryEntry } from '../types'
import { FrameKitBrandCatalog } from './brand/brand-catalog'
import { useFrameKitLocale } from './i18n/locale-provider'
import { FrameKitStudioShell } from './shell/framekit-studio-shell'
import { EmptyState, LoadingState, MessageState, NotFoundState } from './states/studio-states'
import type { FrameKitStudioBrand, FrameKitStudioProps } from './types'
import { useStudioResource } from './resource/use-studio-resource'

const emptyTemplates: readonly TemplateRegistryEntry[] = []
const emptyBrands: readonly FrameKitStudioBrand[] = []

export function FrameKitStudio ({ templates = emptyTemplates, brands = emptyBrands }: FrameKitStudioProps) {
  const { slug: segments } = useParams<{ slug?: string[] }>()
  const pathname = usePathname()
  const slug = segments?.join('/')
  const isBrand = pathname === '/brand' || pathname.startsWith('/brand/')
  const { locale, setLocale, messages } = useFrameKitLocale()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigation = manifestToNavigation(isBrand ? brands : templates, isBrand ? '/brand' : '/editor')
  const loadState = useStudioResource({ slug, isBrand, templates, brands })

  function toggleSidebar () {
    setSidebarCollapsed((collapsed) => !collapsed)
  }

  let content: ReactNode
  if (!slug) content = <EmptyState isBrand={isBrand} messages={messages} />
  else if (loadState.status === 'loading') content = <LoadingState label={isBrand ? messages.brand.loadingLabel : messages.editor.loadingLabel} />
  else if (loadState.status === 'ready' && loadState.kind === 'template') content = <FrameKitEditor key={slug} template={loadState.entry} definition={loadState.definition} messages={messages.editor} sidebarCollapsed={sidebarCollapsed} />
  else if (loadState.status === 'ready' && loadState.kind === 'brand') content = <FrameKitBrandCatalog title={loadState.component.title} description={loadState.component.description} preview={loadState.preview} messages={messages.brand} />
  else if (loadState.status === 'invalid') content = <MessageState>{messages.editor.invalidDefinition}</MessageState>
  else if (loadState.status === 'error') content = <MessageState>{loadState.kind === 'brand' ? messages.brand.loadError : messages.editor.loadError}</MessageState>
  else content = <NotFoundState isBrand={isBrand} messages={messages} />

  return (
    <FrameKitStudioShell isBrand={isBrand} navigation={navigation} messages={messages} locale={locale} onLocaleChange={setLocale} sidebarCollapsed={sidebarCollapsed} onToggleSidebar={toggleSidebar}>
      {content}
    </FrameKitStudioShell>
  )
}
