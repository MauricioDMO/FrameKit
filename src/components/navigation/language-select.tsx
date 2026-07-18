'use client'

import type { Locale } from '@/i18n/locales'
import { useLocale } from '@/i18n/locale-provider'

export function LanguageSelect() {
  const { locale, setLocale, messages } = useLocale()
  const sidebarMessages = messages.sidebar

  return (
    <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#91ae9f]">
      <span>{sidebarMessages.languageLabel}</span>
      <select
        aria-label={sidebarMessages.languageLabel}
        value={locale}
        onChange={(event) => setLocale(event.target.value as Locale)}
        className="studio-select studio-select--dark rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-xs font-bold normal-case tracking-normal text-white outline-none transition hover:bg-white/15 focus:ring-2 focus:ring-[#c8f7d9]"
      >
        {Object.entries(sidebarMessages.languageNames).map(([value, label]) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </label>
  )
}
