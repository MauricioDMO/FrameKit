import type { TemplateDefinition } from '../../types'

export type TemplateDataValidationError =
  | { code: 'required' }
  | { code: 'invalid_number' }
  | { code: 'number_too_small'; min: number }
  | { code: 'number_too_large'; max: number }
  | { code: 'invalid_url' }

function isValidUrl(value: string): boolean {
  if (value.startsWith('/')) return true

  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateTemplateData(
  definition: TemplateDefinition,
  data: Record<string, string>,
): Record<string, TemplateDataValidationError> {
  const errors: Record<string, TemplateDataValidationError> = {}

  for (const [key, field] of Object.entries(definition.fields)) {
    const value = data[key] ?? ''
    const trimmed = value.trim()
    const isRequired = field.required !== false

    if (field.kind === 'number') {
      if (isRequired && trimmed === '') {
        errors[key] = { code: 'required' }
        continue
      }
      if (trimmed === '') {
        continue
      }
      const num = Number(trimmed)
      if (!Number.isFinite(num)) {
        errors[key] = { code: 'invalid_number' }
        continue
      }
      if (field.min !== undefined && num < field.min) {
        errors[key] = { code: 'number_too_small', min: field.min }
        continue
      }
      if (field.max !== undefined && num > field.max) {
        errors[key] = { code: 'number_too_large', max: field.max }
        continue
      }
      continue
    }

    if (field.kind === 'url') {
      if (isRequired && trimmed === '') {
        errors[key] = { code: 'required' }
        continue
      }
      if (trimmed === '') {
        continue
      }
      if (!isValidUrl(trimmed)) {
        errors[key] = { code: 'invalid_url' }
        continue
      }
      continue
    }

    if (isRequired && trimmed === '') {
      errors[key] = { code: 'required' }
    }
  }

  return errors
}
