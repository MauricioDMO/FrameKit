'use client'

import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react'

import type { TemplateNavigationNode } from '@/editor/navigation/navigation'
import type { FrameKitLocale, FrameKitStudioMessages } from '@/studio/i18n/messages'
import type { FrameKitStudioSection, StudioUser } from '@/studio/types'
import { FrameKitLogo } from './framekit-logo'
import { SidebarFooter } from './sidebar-footer'
import { SidebarNavigation } from './sidebar-navigation'

type SidebarMessages = FrameKitStudioMessages['sidebar']

type StudioSidebarProps = {
  user?: StudioUser
  section: FrameKitStudioSection
  navigation: readonly TemplateNavigationNode[]
  messages: FrameKitStudioMessages
  locale: FrameKitLocale
  onLocaleChange: (locale: FrameKitLocale) => void
  collapsed: boolean
  onToggle: () => void
  settingsOpen: boolean
  onToggleSettings: () => void
}

function SidebarCollapsed ({ messages, onToggleSidebar }: { messages: SidebarMessages, onToggleSidebar: () => void }) {
  return (
    <>
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={messages.expandLabel}
        title={messages.expandLabel}
        className="inline-flex h-20.5 w-full shrink-0 items-center justify-center border-b border-white/10 text-fk-mint-200 transition hover:bg-white/10 focus:ring-2 focus:ring-inset focus:ring-fk-mint-200 focus:outline-none"
      >
        <span className="flex size-10 items-center justify-center rounded-lg border border-white/20 bg-white/10">
          <IconLayoutSidebarLeftExpand size={18} />
        </span>
      </button>
      <div className="hidden min-h-0 flex-1 items-center justify-center overflow-hidden lg:flex">
        <span aria-hidden="true" className="-rotate-90 whitespace-nowrap text-[10px] font-black tracking-[0.28em] text-fk-sage-300 select-none">
          F R A M E K I T
        </span>
      </div>
    </>
  )
}

function SidebarHeader ({ messages, onToggleSidebar }: { messages: SidebarMessages, onToggleSidebar: () => void }) {
  return (
    <header className="flex h-20.5 shrink-0 items-center gap-3 border-b border-white/10 px-5">
      <div className="flex min-w-0 items-center gap-3">
        <FrameKitLogo aria-hidden="true" className="size-10 text-white" />
        <div>
          <p className="font-black tracking-[-0.02em]">FrameKit</p>
          <p className="mt-0.5 text-[11px] tracking-[0.16em] text-fk-sage-300 uppercase">
            {messages.workshop}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={messages.collapseLabel}
        title={messages.collapseLabel}
        className="ml-auto inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-fk-mint-200 transition hover:bg-white/10 focus:ring-2 focus:ring-fk-mint-200 focus:outline-none"
      >
        <IconLayoutSidebarLeftCollapse size={18} />
      </button>
    </header>
  )
}

export function StudioSidebar ({
  user,
  section,
  navigation,
  messages,
  locale,
  onLocaleChange,
  collapsed,
  onToggle,
  settingsOpen,
  onToggleSettings
}: StudioSidebarProps) {
  const sidebarMessages = messages.sidebar

  if (collapsed) return <SidebarCollapsed messages={sidebarMessages} onToggleSidebar={onToggle} />

  return (
    <>
      <SidebarHeader messages={sidebarMessages} onToggleSidebar={onToggle} />
      <SidebarNavigation user={user} section={section} navigation={navigation} messages={sidebarMessages} settingsMessages={messages.settings} />
      <SidebarFooter user={user} messages={sidebarMessages} locale={locale} onLocaleChange={onLocaleChange} settingsOpen={settingsOpen} onToggleSettings={onToggleSettings} />
    </>
  )
}
