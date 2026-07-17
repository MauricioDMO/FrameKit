import type { TemplateDefinition } from '../types'

export function validateTemplateDefinition(definition: unknown): {
  success: true
  definition: TemplateDefinition
} | {
  success: false
  error: string
} {
  if (definition === null || typeof definition !== 'object') {
    return { success: false, error: 'definition must be a non-null object' }
  }

  const def = definition as Record<string, unknown>

  if (
    typeof def.width !== 'number' ||
    !Number.isFinite(def.width) ||
    !Number.isInteger(def.width) ||
    def.width <= 0
  ) {
    return { success: false, error: 'width must be a positive finite integer' }
  }

  if (
    typeof def.height !== 'number' ||
    !Number.isFinite(def.height) ||
    !Number.isInteger(def.height) ||
    def.height <= 0
  ) {
    return { success: false, error: 'height must be a positive finite integer' }
  }

  if (def.fields === undefined || def.fields === null || typeof def.fields !== 'object' || Array.isArray(def.fields)) {
    return { success: false, error: 'fields must be a plain object' }
  }

  if ('language' in (def.fields as object)) {
    return { success: false, error: 'fields.language is reserved' }
  }

  if (def.content === undefined || def.content === null || typeof def.content !== 'object' || Array.isArray(def.content)) {
    return { success: false, error: 'content must be a plain object' }
  }

  const content = def.content as Record<string, Record<string, unknown>>
  const contentKeys = Object.keys(content)
  if (contentKeys.length === 0) {
    return { success: false, error: 'content must have at least one entry' }
  }

  const fieldKeys = new Set(Object.keys(def.fields as object))

  for (const locale of contentKeys) {
    const entry = content[locale]
    if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
      return { success: false, error: `content.${locale} must be a plain object` }
    }

    if (typeof entry.language !== 'string') {
      return { success: false, error: `content.${locale}.language must be a string` }
    }

    for (const key of Object.keys(entry)) {
      if (key !== 'language' && !fieldKeys.has(key)) {
        return { success: false, error: `content.${locale} contains unknown field key "${key}"` }
      }
      if (key !== 'language' && typeof entry[key] !== 'string') {
        return { success: false, error: `content.${locale}.${key} must be a string` }
      }
    }
  }

  return { success: true, definition: definition as TemplateDefinition }
}

// ponytail: self-check
if (import.meta.url === `file://${process.argv[1]}`) {
  // basic sanity
}
