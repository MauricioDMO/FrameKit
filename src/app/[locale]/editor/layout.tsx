import type { ReactNode } from 'react'

import { TemplateSidebar } from '@/components/navigation/template-sidebar'
import { hasLocale } from '@/i18n/locales'
import { getMessages } from '@/i18n/messages'
import { readTemplateCatalog } from '@/lib/templates/read-template-catalog'

export const runtime = 'nodejs'

export default async function EditorLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const activeLocale = hasLocale(locale) ? locale : 'es'
  const navigation = await readTemplateCatalog(activeLocale)

  return (
    <div className="min-h-screen bg-[#f0eee7] lg:grid lg:grid-cols-[296px_1fr]">
      <TemplateSidebar
        navigation={navigation}
        locale={activeLocale}
        messages={getMessages(activeLocale).sidebar}
      />
      <main className="min-w-0">{children}</main>
    </div>
  )
}
