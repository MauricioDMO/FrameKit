import type { TemplateBase } from '../../types'

export type TemplateDataValidationError =
  | { code: 'required' }
  | { code: 'invalid_number' }
  | { code: 'number_too_small'; min: number }
  | { code: 'number_too_large'; max: number }
  | { code: 'text_too_short'; minLength: number }
  | { code: 'text_too_long'; maxLength: number }
  | { code: 'invalid_color' }
  | { code: 'invalid_choice' }
  | { code: 'invalid_boolean' }

export function isValidColor(value: string): boolean {
  return /^#[\da-f]{6}$/i.test(value)
}

export function validateTemplateData(
  definition: TemplateBase,
  data: Record<string, string | boolean>,
): Record<string, TemplateDataValidationError> {
  const errors: Record<string, TemplateDataValidationError> = {}

  for (const [key, field] of Object.entries(definition.fields)) {
    const value = data[key] ?? ''

    if (field.kind === 'boolean') {
      if (typeof value !== 'boolean') {
        errors[key] = { code: 'invalid_boolean' }
      }
      continue
    }

    if (field.kind === 'choice') {
      if (typeof value !== 'string' || !field.options.some((option) => option.value === value)) {
        errors[key] = { code: 'invalid_choice' }
      }
      continue
    }

    if (typeof value !== 'string') {
      errors[key] = field.kind === 'number'
        ? { code: 'invalid_number' }
        : field.kind === 'color'
          ? { code: 'invalid_color' }
          : { code: 'required' }
      continue
    }

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
