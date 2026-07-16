import { redirect } from 'next/navigation'

import { hasLocale } from '@/i18n/locales'

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  redirect(`/${hasLocale(locale) ? locale : 'es'}/editor`)
}
