import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { cookies, headers } from 'next/headers'

import { ThemeScript } from '@/components/theme-script'
import { LocaleProvider } from '@/i18n/locale-provider'
import { getPreferredLocale, hasLocale } from '@/i18n/locales'
import { getMessages } from '@/i18n/messages'
import './globals.css'

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await cookies()).get('locale')?.value
  const activeLocale = locale && hasLocale(locale)
    ? locale
    : getPreferredLocale((await headers()).get('accept-language'))
  return getMessages(activeLocale).metadata
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const cookieStore = await cookies()
  const requestedLocale = cookieStore.get('locale')?.value
  const locale = requestedLocale && hasLocale(requestedLocale)
    ? requestedLocale
    : getPreferredLocale((await headers()).get('accept-language'))
  const theme = cookieStore.get('theme')?.value

  return (
    <html
      lang={locale}
      className={`${theme === 'dark' ? 'dark' : ''} min-h-full scheme-light dark:scheme-dark`}
      suppressHydrationWarning
    >
      <head>
        <ThemeScript />
      </head>
      <body className="m-0 min-h-full bg-[#f0eee7] font-[Arial,Helvetica,sans-serif] text-[#17221d] dark:bg-[#17221d] dark:text-[#e6eee9]">
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  )
}
