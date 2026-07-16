import type { Locale } from '@/i18n/locales'

export type TemplateData = Record<string, string>

export type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'color'
  | 'number'

interface TemplateFieldBase {
  key: string
  type: TemplateFieldType
  required?: boolean
  min?: number
  max?: number
}

export interface TemplateField extends TemplateFieldBase {
  label: string
  placeholder?: string
}

export interface TemplateMetadata {
  title: string
  description?: string
  fileName?: string
}

type TemplateLanguages = Record<string, string>
type LocalizedValue<Languages extends TemplateLanguages> = {
  [Language in keyof Languages]: string
}
type TemplateFieldConfig<Languages extends TemplateLanguages> =
  TemplateFieldBase & {
    label: LocalizedValue<Languages>
    placeholder?: LocalizedValue<Languages>
  }
type ExactKeys<Value, Keys extends PropertyKey> = Exclude<
  keyof Value,
  Keys
> extends never
  ? unknown
  : never

export interface TemplateConfig {
  order: number
  width: number
  height: number
  languages: Record<string, string>
  metadata: Record<string, TemplateMetadata>
  fields: Array<
    TemplateFieldBase & {
      label: Record<string, string>
      placeholder?: Record<string, string>
    }
  >
  content: Record<string, TemplateData>
}

export function defineTemplateConfig<
  const Languages extends TemplateLanguages,
  const Fields extends readonly TemplateFieldConfig<Languages>[],
  const Metadata extends Record<keyof Languages, TemplateMetadata>,
  const Content extends Record<keyof Languages, Record<Fields[number]['key'], string>>,
>(config: {
  order: number
  width: number
  height: number
  languages: Languages
  metadata: Metadata & ExactKeys<Metadata, keyof Languages>
  fields: Fields
  content: Content & ExactKeys<Content, keyof Languages>
}): TemplateConfig {
  return config as unknown as TemplateConfig
}

export interface LocalizedTemplateConfig {
  language: string
  languageName: string
  order: number
  width: number
  height: number
  title: string
  description?: string
  fileName?: string
  fields: TemplateField[]
  content: TemplateData
}

export function hasTemplateLanguage(
  config: TemplateConfig,
  language: string,
): boolean {
  return language in config.languages
}

export function getTemplateLanguage(
  config: TemplateConfig,
  requestedLanguage: string,
): string {
  if (hasTemplateLanguage(config, requestedLanguage)) return requestedLanguage

  const fallbackLanguage = Object.keys(config.languages)[0]
  if (!fallbackLanguage) throw new Error('La plantilla debe definir al menos un idioma.')

  return fallbackLanguage
}

export function localizeTemplateConfig(
  config: TemplateConfig,
  requestedLanguage: string,
): LocalizedTemplateConfig {
  const language = getTemplateLanguage(config, requestedLanguage)
  const metadata = config.metadata[language]

  return {
    language,
    languageName: config.languages[language],
    order: config.order,
    width: config.width,
    height: config.height,
    title: metadata.title,
    description: metadata.description,
    fileName: metadata.fileName,
    fields: config.fields.map(({ label, placeholder, ...field }) => ({
      ...field,
      label: label[language],
      placeholder: placeholder?.[language],
    })),
    content: config.content[language],
  }
}

export interface FolderConfig {
  order: number
  translations: Record<Locale, { title: string }>
}

export interface TemplateProps {
  data: TemplateData
  width: number
  height: number
  locale: string
}

export interface TemplateNavigationFolder {
  type: 'folder'
  id: string
  slug: string
  title: string
  order: number
  children: TemplateNavigationNode[]
}

export interface TemplateNavigationItem {
  type: 'template'
  id: string
  slug: string
  title: string
  description?: string
  order: number
  href: string
}

export type TemplateNavigationNode =
  | TemplateNavigationFolder
  | TemplateNavigationItem
