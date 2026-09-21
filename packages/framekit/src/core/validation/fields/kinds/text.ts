import type { FieldRecord } from '@/core/validation/fields/common'
import { validateStringField } from '@/core/validation/fields/common'

export function validateTextField (key: string, field: FieldRecord): string | undefined {
  const stringError = validateStringField(key, field)
  if (stringError !== undefined) return stringError

  if (field.minLength !== undefined && (typeof field.minLength !== 'number' || !Number.isFinite(field.minLength) || !Number.isInteger(field.minLength) || field.minLength < 0)) {
    return `fields.${key}.minLength must be a finite non-negative integer`
  }
  if (field.maxLength !== undefined && (typeof field.maxLength !== 'number' || !Number.isFinite(field.maxLength) || !Number.isInteger(field.maxLength) || field.maxLength < 0)) {
    return `fields.${key}.maxLength must be a finite non-negative integer`
  }
  if (field.minLength !== undefined && field.maxLength !== undefined && field.minLength > field.maxLength) {
    return `fields.${key}.minLength must be less than or equal to maxLength`
  }

  if ('scope' in field) {
    return `fields.${key}.scope is only valid for image fields`
  }
  if ('min' in field || 'max' in field) {
    return `fields.${key} cannot define min or max`
  }
}
