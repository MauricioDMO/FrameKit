import { isPlainObject } from '../../utils'

import type { FieldRecord } from '../common'

export function validateChoiceField (key: string, field: FieldRecord): string | undefined {
  if ('required' in field) {
    return `fields.${key} cannot define required`
  }
  if ('control' in field) {
    return `fields.${key} cannot define control`
  }
  if ('step' in field) {
    return `fields.${key} cannot define step`
  }

  const options = field.options
  if (!Array.isArray(options) || options.length === 0) {
    return `fields.${key}.options must be a non-empty array`
  }

  const optionValues = new Set<string>()
  for (const [index, option] of options.entries()) {
    if (!isPlainObject(option)) {
      return `fields.${key}.options[${index}] must be a plain object`
    }
    if (typeof option.value !== 'string' || option.value.trim() === '') {
      return `fields.${key}.options[${index}].value must be a non-empty string`
    }
    if (typeof option.label !== 'string' || option.label.trim() === '') {
      return `fields.${key}.options[${index}].label must be a non-empty string`
    }
    if (optionValues.has(option.value)) {
      return `fields.${key}.options contains duplicate value "${option.value}"`
    }
    optionValues.add(option.value)
  }

  if (!('defaultValue' in field)) {
    return `fields.${key}.defaultValue is required`
  }
  if (typeof field.defaultValue !== 'string') {
    return `fields.${key}.defaultValue must be a string`
  }
  if (!optionValues.has(field.defaultValue)) {
    return `fields.${key}.defaultValue must match an option value`
  }
}
