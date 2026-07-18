import type { TemplateDefinition } from '../types'
import { getDefaultValues } from './get-default-values'

export function resolveTemplateData(
  definition: TemplateDefinition,
  locale: string,
  edits: Record<string, string>,
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

  return result
}
