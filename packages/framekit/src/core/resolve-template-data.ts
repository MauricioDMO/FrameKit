import type { TemplateAssetManifest, TemplateBase } from '../types'
import { getDefaultValues } from './get-default-values'

const emptyAssets: TemplateAssetManifest = { common: {}, variants: {} }

export function resolveTemplateData(
  definition: TemplateBase,
  locale: string,
  edits: Record<string, string>,
  assets: TemplateAssetManifest = emptyAssets,
): Record<string, string> {
  const result = getDefaultValues(definition.fields)

  const localeContent = definition.content[locale]
  if (localeContent) {
    for (const key in localeContent) {
      if (key !== 'language' && typeof localeContent[key] === 'string') {
        result[key] = localeContent[key]
      }
    }
  }

  for (const key in edits) {
    if (key !== 'language' && typeof edits[key] === 'string') {
      result[key] = edits[key]
    }
  }

  for (const [key, field] of Object.entries(definition.fields)) {
    if (field.kind !== 'image') continue

    const source = field.scope === 'common'
      ? assets.common[key]
      : assets.variants[locale]?.[key] ?? assets.common[key]

    if (source) result[key] = source
  }

  return result
}
