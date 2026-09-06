'use client'

import { IconLayoutSidebarLeftCollapse, IconLayoutSidebarLeftExpand } from '@tabler/icons-react'

import type { TemplateNavigationNode } from '../../editor/navigation'
import type { FrameKitLocale, FrameKitStudioMessages } from '../i18n/messages'
import { FrameKitLogo } from './framekit-logo'
import { SidebarFooter } from './sidebar-footer'
import { SidebarNavigation } from './sidebar-navigation'

type SidebarMessages = FrameKitStudioMessages['sidebar']

type StudioSidebarProps = {
  isBrand: boolean
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
        className="inline-flex h-20.5 w-full shrink-0 items-center justify-center border-b border-white/10 text-[#c8f7d9] transition hover:bg-white/8 focus:ring-2 focus:ring-inset focus:ring-[#c8f7d9] focus:outline-none"
      >
        <span className="flex size-11 items-center justify-center rounded-xl border border-white/20 bg-white/10">
          <IconLayoutSidebarLeftExpand size={18} />
        </span>
      </button>
      <div className="hidden min-h-0 flex-1 items-center justify-center overflow-hidden lg:flex">
        <span aria-hidden="true" className="-rotate-90 whitespace-nowrap text-[10px] font-black tracking-[0.28em] text-[#91ae9f] select-none">
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
        <FrameKitLogo aria-hidden="true" className="size-10" />
        <div>
          <p className="font-black tracking-[-0.02em]">FrameKit</p>
          <p className="mt-0.5 text-[11px] tracking-[0.16em] text-[#91ae9f] uppercase">
            {messages.workshop}
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggleSidebar}
        aria-label={messages.collapseLabel}
        title={messages.collapseLabel}
        className="ml-auto inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-[#c8f7d9] transition hover:bg-white/10 focus:ring-2 focus:ring-[#c8f7d9] focus:outline-none"
      >
        <IconLayoutSidebarLeftCollapse size={18} />
      </button>
    </header>
  )
}

export function StudioSidebar ({
  isBrand,
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
      <SidebarNavigation isBrand={isBrand} navigation={navigation} messages={sidebarMessages} />
      <SidebarFooter messages={sidebarMessages} locale={locale} onLocaleChange={onLocaleChange} settingsOpen={settingsOpen} onToggleSettings={onToggleSettings} />
    </>
  )
}
