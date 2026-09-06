'use client'

import { IconStack2, IconTag } from '@tabler/icons-react'
import Link from 'next/link'

import { FrameKitNavigationTree } from '../../editor/framekit-navigation'
import type { TemplateNavigationNode } from '../../editor/navigation'
import type { FrameKitStudioMessages } from '../i18n/messages'

type SidebarMessages = FrameKitStudioMessages['sidebar']

function NavigationTabs ({ isBrand, messages }: { isBrand: boolean, messages: SidebarMessages }) {
  const baseClasses = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-bold transition'
  const activeClasses = 'bg-[#c8f7d9] text-[#10271f]'
  const inactiveClasses = 'text-[#bed0c6] hover:bg-white/8 hover:text-white'

  return (
    <div className="grid grid-cols-2 gap-1 border-b border-white/10 p-3">
      <Link
        href="/editor"
        aria-current={!isBrand ? 'page' : undefined}
        className={`${baseClasses} ${!isBrand ? activeClasses : inactiveClasses}`}
      >
        <IconStack2 size={16} aria-hidden="true" />
        {messages.templatesLabel}
      </Link>
      <Link
        href="/brand"
        aria-current={isBrand ? 'page' : undefined}
        className={`${baseClasses} ${isBrand ? activeClasses : inactiveClasses}`}
      >
        <IconTag size={16} aria-hidden="true" />
        {messages.brandsLabel}
      </Link>
    </div>
  )
}

export function SidebarNavigation ({ isBrand, navigation, messages }: { isBrand: boolean, navigation: readonly TemplateNavigationNode[], messages: SidebarMessages }) {
  return (
    <>
      <NavigationTabs isBrand={isBrand} messages={messages} />
      <nav aria-label={messages.navigationLabel} className="max-h-[38vh] overflow-y-auto p-3 lg:max-h-none lg:min-h-0 lg:flex-1">
        {navigation.length === 0
          ? <p className="px-3 py-4 text-sm text-[#91ae9f]">{isBrand ? messages.noBrands : messages.noTemplates}</p>
          : <FrameKitNavigationTree nodes={navigation} />}
      </nav>
    </>
  )
}
