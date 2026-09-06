'use client'

import { useState } from 'react'
import type { ReactNode } from 'react'

import type { TemplateNavigationNode } from '../../editor/navigation'
import type { FrameKitLocale, FrameKitStudioMessages } from '../i18n/messages'
import { StudioSidebar } from './studio-sidebar'

type FrameKitStudioShellProps = {
  isBrand: boolean
  navigation: readonly TemplateNavigationNode[]
  messages: FrameKitStudioMessages
  locale: FrameKitLocale
  onLocaleChange: (locale: FrameKitLocale) => void
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
  children: ReactNode
}

export function FrameKitStudioShell ({
  isBrand,
  navigation,
  messages,
  locale,
  onLocaleChange,
  sidebarCollapsed,
  onToggleSidebar,
  children
}: FrameKitStudioShellProps) {
  const [settingsOpen, setSettingsOpen] = useState(false)

  function handleToggleSidebar () {
    onToggleSidebar()
    setSettingsOpen(false)
  }

  function handleToggleSettings () {
    setSettingsOpen((open) => !open)
  }

  const sidebarCollapseClass = sidebarCollapsed ? 'lg:grid-cols-[56px_1fr]' : 'lg:grid-cols-[296px_1fr]'
  const sidebarHeightClass = sidebarCollapsed ? 'h-20.5 lg:h-screen' : ''

  return (
    <div className={`min-h-screen bg-[#f0eee7] lg:grid ${sidebarCollapseClass} xl:h-dvh xl:min-h-0 xl:overflow-hidden dark:bg-[#17221d]`}>
      <aside className={`flex flex-col border-b border-white/10 bg-[#10271f] text-white lg:sticky lg:top-0 lg:h-screen lg:border-r lg:border-b-0 ${sidebarHeightClass}`}>
        <StudioSidebar
          isBrand={isBrand}
          navigation={navigation}
          messages={messages}
          locale={locale}
          onLocaleChange={onLocaleChange}
          collapsed={sidebarCollapsed}
          onToggle={handleToggleSidebar}
          settingsOpen={settingsOpen}
          onToggleSettings={handleToggleSettings}
        />
      </aside>
      <main className="min-w-0 xl:min-h-0 xl:overflow-hidden">
        {children}
      </main>
    </div>
  )
}
