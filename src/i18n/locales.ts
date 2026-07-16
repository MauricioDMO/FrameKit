export const locales = ['es', 'en'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'es'

export function hasLocale(value: string): value is Locale {
  return locales.includes(value as Locale)
}

export function getPreferredLocale(acceptLanguage: string | null): Locale {
  const languages = (acceptLanguage ?? '')
    .split(',')
    .map((value) => {
      const [tag, ...parameters] = value.trim().split(';')
      const quality = parameters.find((parameter) => parameter.startsWith('q='))
      const weight = quality ? Number(quality.slice(2)) : 1

      return { locale: tag.toLowerCase().split('-')[0], weight }
    })
    .filter(({ locale, weight }) => hasLocale(locale) && Number.isFinite(weight))
    .sort((first, second) => second.weight - first.weight)

  const locale = languages[0]?.locale
  return locale && hasLocale(locale) ? locale : defaultLocale
}
