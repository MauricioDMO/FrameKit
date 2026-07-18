'use client'

import { createContext, useContext, useState } from 'react'

import type { Locale } from './locales'
import { getMessages } from './messages'

const LocaleContext = createContext<{
  locale: Locale
  setLocale: (locale: Locale) => void
} | null>(null)

export function LocaleProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode
  initialLocale: Locale
}) {
  const [locale, setLocaleState] = useState(initialLocale)

  function setLocale(nextLocale: Locale) {
    setLocaleState(nextLocale)
    document.documentElement.lang = nextLocale
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`
  }

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  )
}

export function useLocale() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error('useLocale must be used within LocaleProvider')

  return { ...context, messages: getMessages(context.locale) }
}
