'use client'

import { IconSettings, IconStack2, IconTag } from '@tabler/icons-react'
import Link from 'next/link'

import { FrameKitNavigationTree } from '@/editor/navigation/framekit-navigation'
import type { TemplateNavigationNode } from '@/editor/navigation/navigation'
import type { FrameKitStudioMessages } from '../i18n/messages'
import type { FrameKitStudioSection } from '../types'

type SidebarMessages = FrameKitStudioMessages['sidebar']

function NavigationTabs ({ section, messages }: { section: FrameKitStudioSection, messages: SidebarMessages }) {
  const baseClasses = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-bold transition'
  const activeClasses = 'bg-fk-mint-200 text-fk-forest-400'
  const inactiveClasses = 'text-fk-sage-200 hover:bg-white/10 hover:text-white'

  return (
    <div className="grid grid-cols-3 gap-1 border-b border-white/10 p-3">
      <Link
        href="/editor"
        aria-current={section === 'editor' ? 'page' : undefined}
        className={`${baseClasses} ${section === 'editor' ? activeClasses : inactiveClasses}`}
      >
        <IconStack2 size={16} aria-hidden="true" />
        {messages.templatesLabel}
      </Link>
      <Link
        href="/brand"
        aria-current={section === 'brand' ? 'page' : undefined}
        className={`${baseClasses} ${section === 'brand' ? activeClasses : inactiveClasses}`}
      >
        <IconTag size={16} aria-hidden="true" />
        {messages.brandsLabel}
      </Link>
      <Link
        href="/settings"
        aria-current={section === 'settings' ? 'page' : undefined}
        className={`${baseClasses} ${section === 'settings' ? activeClasses : inactiveClasses}`}
      >
        <IconSettings size={16} aria-hidden="true" />
        {messages.settingsLabel}
      </Link>
    </div>
  )
}

export function SidebarNavigation ({ section, navigation, messages }: { section: FrameKitStudioSection, navigation: readonly TemplateNavigationNode[], messages: SidebarMessages }) {
  return (
    <>
      <NavigationTabs section={section} messages={messages} />
      {section !== 'settings' && <nav aria-label={messages.navigationLabel} className="max-h-[38vh] overflow-y-auto p-3 lg:max-h-none lg:min-h-0 lg:flex-1">
        {navigation.length === 0
          ? <p className="px-3 py-4 text-sm text-fk-sage-300">{section === 'brand' ? messages.noBrands : messages.noTemplates}</p>
          : <FrameKitNavigationTree nodes={navigation} />}
      </nav>}
    </>
  )
}
