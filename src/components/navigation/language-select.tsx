'use client'

import { usePathname, useRouter } from 'next/navigation'

import type { Locale } from '@/i18n/locales'
import type { getMessages } from '@/i18n/messages'

export function LanguageSelect({
  locale,
  messages,
}: {
  locale: Locale
  messages: ReturnType<typeof getMessages>['sidebar']
}) {
  const pathname = usePathname()
  const router = useRouter()

  function changeLocale(nextLocale: Locale) {
    router.push(pathname.replace(`/${locale}`, `/${nextLocale}`))
  }

  return (
    <label className="flex flex-col gap-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#91ae9f]">
      <span>{messages.languageLabel}</span>
      <select
        aria-label={messages.languageLabel}
        value={locale}
        onChange={(event) => changeLocale(event.target.value as Locale)}
        className="rounded-lg border border-white/20 bg-white/10 px-2 py-1.5 text-xs font-bold normal-case tracking-normal text-white outline-none transition hover:bg-white/15 focus:ring-2 focus:ring-[#c8f7d9]"
      >
        {Object.entries(messages.languageNames).map(([value, label]) => (
          <option key={value} value={value} className="text-[#10271f]">
            {label}
          </option>
        ))}
      </select>
    </label>
  )
}
