import { IconAdjustmentsHorizontal } from '@tabler/icons-react'

import type { FrameKitLocale, FrameKitStudioMessages } from '@/studio/i18n/messages'
import type { FrameKitStudioSection, StudioUser } from '@/studio/types'
import { FrameKitStudioSettings } from './sidebar-settings'

type SidebarMessages = FrameKitStudioMessages['sidebar']

type SidebarFooterProps = {
  user?: StudioUser
  section: FrameKitStudioSection
  messages: SidebarMessages
  locale: FrameKitLocale
  onLocaleChange: (locale: FrameKitLocale) => void
  settingsOpen: boolean
  onToggleSettings: () => void
}

export function SidebarFooter ({ user, section, messages, locale, onLocaleChange, settingsOpen, onToggleSettings }: SidebarFooterProps) {
  return (
    <div className="relative mt-auto shrink-0 border-t border-white/10 px-5 py-4">
      <p className="text-center text-[10px] text-fk-sage-300">
        {messages.developedBy} <a href="https://mauriciodmo.com" className="font-bold text-fk-mint-200 hover:underline" target="_blank">MauricioDMO</a>
      </p>
      <div className="relative mt-3">
        <FrameKitStudioSettings
          user={user}
          open={settingsOpen}
          section={section}
          locale={locale}
          messages={messages}
          onLocaleChange={onLocaleChange}
        />
        <button
          type="button"
          onClick={onToggleSettings}
          aria-label={messages.appearanceLabel}
          aria-controls="sidebar-settings"
          aria-expanded={settingsOpen}
          className="mt-2 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 text-sm font-bold text-fk-mint-200 transition hover:bg-white/15 focus:ring-2 focus:ring-fk-mint-200 focus:outline-none"
        >
          <IconAdjustmentsHorizontal size={17} aria-hidden="true" />
          {messages.appearanceLabel}
        </button>
      </div>
    </div>
  )
}
