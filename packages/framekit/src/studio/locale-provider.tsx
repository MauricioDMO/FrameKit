'use client'

import { createContext, useContext, useState } from 'react'
import { frameKitMessages, type FrameKitLocale } from './messages'

const LocaleContext = createContext<{ locale: FrameKitLocale, setLocale: (locale: FrameKitLocale) => void } | null>(null)

export function FrameKitLocaleProvider({ children, initialLocale }: { children: React.ReactNode, initialLocale: FrameKitLocale }) {
  const [locale, setLocaleState] = useState(initialLocale)
  function setLocale(nextLocale: FrameKitLocale) {
    setLocaleState(nextLocale)
    document.documentElement.lang = nextLocale
    document.cookie = `locale=${nextLocale}; path=/; max-age=31536000; samesite=lax`
  }
  return <LocaleContext.Provider value={{ locale, setLocale }}>{children}</LocaleContext.Provider>
}

export function useFrameKitLocale() {
  const context = useContext(LocaleContext)
  if (!context) throw new Error('useFrameKitLocale must be used within FrameKitLocaleProvider')
  return { ...context, messages: frameKitMessages[context.locale] }
}
