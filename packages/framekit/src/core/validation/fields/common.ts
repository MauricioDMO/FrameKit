import { isPlainObject } from '../utils'

export type FieldRecord = Record<string, unknown>

const FIELD_KINDS = new Set(['text', 'number', 'color', 'image', 'choice', 'boolean'])

export function validateCommonField (key: string, value: unknown): FieldRecord | string {
  if (!isPlainObject(value)) {
    return `fields.${key} must be a plain object`
  }

  const field = value
  if (typeof field.kind !== 'string' || !FIELD_KINDS.has(field.kind)) {
    return `fields.${key}.kind is invalid`
  }
  if (typeof field.label !== 'string' || field.label.trim() === '') {
    return `fields.${key}.label must be a non-empty string`
  }
  if (field.placeholder !== undefined && typeof field.placeholder !== 'string') {
    return `fields.${key}.placeholder must be a string`
  }

  return field
}

export function validateStringField (key: string, field: FieldRecord): string | undefined {
  if (field.required !== undefined && typeof field.required !== 'boolean') {
    return `fields.${key}.required must be a boolean`
  }
  if (field.defaultValue !== undefined && typeof field.defaultValue !== 'string') {
    return `fields.${key}.defaultValue must be a string`
  }
  if ('control' in field) {
    return `fields.${key} cannot define control`
  }
  if ('step' in field) {
    return `fields.${key} cannot define step`
  }
}
