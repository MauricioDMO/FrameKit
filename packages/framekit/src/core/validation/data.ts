import type { TemplateDefinition } from '../../types'

export type TemplateDataValidationError =
  | { code: 'required' }
  | { code: 'invalid_number' }
  | { code: 'number_too_small'; min: number }
  | { code: 'number_too_large'; max: number }
  | { code: 'text_too_short'; minLength: number }
  | { code: 'text_too_long'; maxLength: number }
  | { code: 'invalid_color' }

export function isValidColor(value: string): boolean {
  return /^#[\da-f]{6}$/i.test(value)
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

    if (field.kind === 'color') {
      if (isRequired && trimmed === '') {
        errors[key] = { code: 'required' }
        continue
      }
      if (trimmed !== '' && !isValidColor(trimmed)) {
        errors[key] = { code: 'invalid_color' }
      }
      continue
    }

    if (field.kind === 'text') {
      if (isRequired && trimmed === '') {
        errors[key] = { code: 'required' }
        continue
      }
      if (value === '') {
        continue
      }
      if (field.minLength !== undefined && value.length < field.minLength) {
        errors[key] = { code: 'text_too_short', minLength: field.minLength }
        continue
      }
      if (field.maxLength !== undefined && value.length > field.maxLength) {
        errors[key] = { code: 'text_too_long', maxLength: field.maxLength }
      }
      continue
    }

    if (isRequired && trimmed === '') {
      errors[key] = { code: 'required' }
    }
  }

  return errors
}
