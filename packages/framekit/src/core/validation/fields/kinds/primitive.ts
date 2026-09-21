import type { FieldRecord } from '@/core/validation/fields/common'
import { validateStringField } from '@/core/validation/fields/common'

export function validatePrimitiveField (key: string, field: FieldRecord): string | undefined {
  if (field.kind === 'boolean') {
    if ('placeholder' in field) {
      return `fields.${key} cannot define placeholder`
    }
    if ('required' in field) {
      return `fields.${key} cannot define required`
    }
    if ('control' in field) {
      return `fields.${key} cannot define control`
    }
    if ('step' in field) {
      return `fields.${key} cannot define step`
    }
    if (field.defaultValue !== undefined && typeof field.defaultValue !== 'boolean') {
      return `fields.${key}.defaultValue must be a boolean`
    }
  } else {
    const stringError = validateStringField(key, field)
    if (stringError !== undefined) return stringError
  }

  if ('minLength' in field || 'maxLength' in field) {
    return `fields.${key} cannot define minLength or maxLength`
  }
  if ('scope' in field) {
    return `fields.${key}.scope is only valid for image fields`
  }
  if ('min' in field || 'max' in field) {
    return `fields.${key} cannot define min or max`
  }
}
