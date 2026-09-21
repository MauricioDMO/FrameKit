import type { FieldRecord } from '@/core/validation/fields/common'
import { validateStringField } from '@/core/validation/fields/common'

export function validateImageField (key: string, field: FieldRecord): string | undefined {
  const stringError = validateStringField(key, field)
  if (stringError !== undefined) return stringError

  if ('minLength' in field || 'maxLength' in field) {
    return `fields.${key} cannot define minLength or maxLength`
  }
  if (field.scope !== undefined && field.scope !== 'common' && field.scope !== 'variant') {
    return `fields.${key}.scope is invalid`
  }
  if ('min' in field || 'max' in field) {
    return `fields.${key} cannot define min or max`
  }
}
