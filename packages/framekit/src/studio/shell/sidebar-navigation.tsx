'use client'

import { IconStack2, IconTag } from '@tabler/icons-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { FrameKitNavigationTree } from '@/editor/navigation/framekit-navigation'
import type { TemplateNavigationNode } from '@/editor/navigation/navigation'
import type { FrameKitStudioMessages } from '@/studio/i18n/messages'
import type { FrameKitStudioSection, StudioUser } from '@/studio/types'

type SidebarMessages = FrameKitStudioMessages['sidebar']
type SettingsMessages = FrameKitStudioMessages['settings']

function NavigationTabs ({ section, messages }: { section: FrameKitStudioSection, messages: SidebarMessages }) {
  const baseClasses = 'inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-center text-xs font-bold transition'
  const activeClasses = 'bg-fk-mint-200 text-fk-forest-400'
  const inactiveClasses = 'text-fk-sage-200 hover:bg-white/10 hover:text-white'

  return (
    <div className="grid grid-cols-2 gap-1 border-b border-white/10 p-3">
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
    </div>
  )
}

export function SidebarNavigation ({ user, section, navigation, messages, settingsMessages }: { user?: StudioUser, section: FrameKitStudioSection, navigation: readonly TemplateNavigationNode[], messages: SidebarMessages, settingsMessages: SettingsMessages }) {
  const pathname = usePathname()
  const settingsLinks = [
    { href: '/settings/account', label: settingsMessages.account.title },
    { href: '/settings/tokens', label: settingsMessages.tokens.title },
    ...(user?.role === 'admin' ? [{ href: '/settings/users', label: settingsMessages.users.title }] : [])
  ]
  const settingsLinkBaseClasses = 'flex min-h-10 items-center rounded-lg px-3 py-2 text-sm font-bold transition focus:ring-2 focus:ring-fk-mint-200 focus:outline-none'
  const activeSettingsLinkClasses = 'bg-fk-mint-200 text-fk-forest-400'
  const inactiveSettingsLinkClasses = 'text-fk-sage-200 hover:bg-white/10 hover:text-white'

  return (
    <>
      <NavigationTabs section={section} messages={messages} />
      {section === 'settings' && user && <nav aria-label={settingsMessages.navigationLabel} className="border-b border-white/10 p-2">
        <div className="flex flex-col gap-1">
          {settingsLinks.map(({ href, label }) => {
            const active = pathname === href || (href === '/settings/users' && pathname.startsWith(`${href}/`))
            return <Link key={href} href={href} aria-current={active ? 'page' : undefined} className={`${settingsLinkBaseClasses} ${active ? activeSettingsLinkClasses : inactiveSettingsLinkClasses}`}>{label}</Link>
          })}
        </div>
      </nav>}
      {section !== 'settings' && <nav aria-label={messages.navigationLabel} className="max-h-[38vh] overflow-y-auto p-3 lg:max-h-none lg:min-h-0 lg:flex-1">
        {navigation.length === 0
          ? <p className="px-3 py-4 text-sm text-fk-sage-300">{section === 'brand' ? messages.noBrands : messages.noTemplates}</p>
          : <FrameKitNavigationTree nodes={navigation} />}
      </nav>}
    </>
  )
}
