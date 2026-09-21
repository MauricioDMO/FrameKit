'use client'

import { IconMoon, IconSettings, IconSun } from '@tabler/icons-react'
import Link from 'next/link'

import type { FrameKitLocale, FrameKitStudioMessages } from '../i18n/messages'
import type { FrameKitStudioSection, StudioUser } from '../types'

type SidebarMessages = FrameKitStudioMessages['sidebar']

type FrameKitStudioSettingsProps = {
  user?: StudioUser
  open: boolean
  section: FrameKitStudioSection
  locale: FrameKitLocale
  messages: SidebarMessages
  onLocaleChange: (locale: FrameKitLocale) => void
}

export function FrameKitStudioSettings ({ user, open, section, locale, messages, onLocaleChange }: FrameKitStudioSettingsProps) {
  function toggleTheme () {
    const dark = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', dark)
    document.cookie = `theme=${dark ? 'dark' : 'light'}; path=/; max-age=31536000; samesite=lax`
  }

  if (!open) return null

  return (
    <div id="sidebar-settings" className="absolute inset-x-0 bottom-[calc(100%+0.75rem)] z-20 rounded-xl border border-white/15 bg-fk-forest-300 p-3 shadow-xl flex flex-col gap-3 text-fk-sage-200">
      <label className="flex flex-col gap-1 text-[10px] font-bold tracking-[0.12em] text-fk-sage-300 uppercase">
        <span>{messages.languageLabel}</span>
        <select aria-label={messages.languageLabel} value={locale} onChange={(event) => onLocaleChange(event.target.value as FrameKitLocale)} className="studio-select studio-select--dark rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-xs font-bold tracking-normal text-white normal-case transition outline-none hover:bg-white/15 focus:ring-2 focus:ring-fk-mint-200">
          {Object.entries(messages.languageNames).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <button type="button" onClick={toggleTheme} aria-label={messages.themeToggleLabel} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 px-3 text-sm font-bold text-fk-mint-200 transition hover:bg-white/15 focus:ring-2 focus:ring-fk-mint-200 focus:outline-none">
        <IconSun size={16} className="dark:hidden" />
        <IconMoon size={16} className="hidden dark:block" />
        {messages.themeToggleLabel}
      </button>
      {user && <Link
        href="/settings"
        aria-current={section === 'settings' ? 'page' : undefined}
        className={`inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-3 text-sm font-bold transition focus:ring-2 focus:ring-fk-mint-200 focus:outline-none ${section === 'settings' ? 'bg-fk-mint-200 text-fk-forest-400' : 'bg-white/10 text-fk-mint-200 hover:bg-white/15'}`}
      >
        <IconSettings size={16} aria-hidden="true" />
        {messages.settingsLabel}
      </Link>}
    </div>
  )
}
