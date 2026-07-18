import type { TemplateBase, TemplateDefinition } from '../../types'

const FIELD_KINDS = new Set(['text', 'textarea', 'number', 'color', 'url'])

function isPlainObject(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

type ValidationResult<Definition> = {
  success: true
  definition: Definition
} | {
  success: false
  error: string
}

export function validateTemplateBase(definition: unknown): ValidationResult<TemplateBase> {
  if (!isPlainObject(definition)) {
    return { success: false, error: 'definition must be a non-null object' }
  }

  const def = definition

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

  if (!isPlainObject(def.fields)) {
    return { success: false, error: 'fields must be a plain object' }
  }

  if ('language' in def.fields) {
    return { success: false, error: 'fields.language is reserved' }
  }

  for (const [key, value] of Object.entries(def.fields)) {
    if (!isPlainObject(value)) {
      return { success: false, error: `fields.${key} must be a plain object` }
    }

    const field = value
    if (typeof field.kind !== 'string' || !FIELD_KINDS.has(field.kind)) {
      return { success: false, error: `fields.${key}.kind is invalid` }
    }
    if (typeof field.label !== 'string' || field.label.trim() === '') {
      return { success: false, error: `fields.${key}.label must be a non-empty string` }
    }
    if (field.placeholder !== undefined && typeof field.placeholder !== 'string') {
      return { success: false, error: `fields.${key}.placeholder must be a string` }
    }
    if (field.required !== undefined && typeof field.required !== 'boolean') {
      return { success: false, error: `fields.${key}.required must be a boolean` }
    }
    if (field.defaultValue !== undefined && typeof field.defaultValue !== 'string') {
      return { success: false, error: `fields.${key}.defaultValue must be a string` }
    }

    if (field.kind !== 'number') {
      if ('min' in field || 'max' in field) {
        return { success: false, error: `fields.${key} cannot define min or max` }
      }
      continue
    }

    if (field.min !== undefined && (typeof field.min !== 'number' || !Number.isFinite(field.min))) {
      return { success: false, error: `fields.${key}.min must be a finite number` }
    }
    if (field.max !== undefined && (typeof field.max !== 'number' || !Number.isFinite(field.max))) {
      return { success: false, error: `fields.${key}.max must be a finite number` }
    }
    if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
      return { success: false, error: `fields.${key}.min must be less than or equal to max` }
    }
  }

  if (!isPlainObject(def.content)) {
    return { success: false, error: 'content must be a plain object' }
  }

  const content = def.content
  const contentKeys = Object.keys(content)
  if (contentKeys.length === 0) {
    return { success: false, error: 'content must have at least one entry' }
  }

  const fieldKeys = new Set(Object.keys(def.fields))

  for (const locale of contentKeys) {
    const entry = content[locale]
    if (!isPlainObject(entry)) {
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

  return { success: true, definition: definition as unknown as TemplateBase }
}

export function validateTemplateDefinition(definition: unknown): ValidationResult<TemplateDefinition> {
  const validation = validateTemplateBase(definition)
  if (!validation.success) return validation

  if (typeof (definition as Record<string, unknown>).render !== 'function') {
    return { success: false, error: 'render must be a function' }
  }

  return { success: true, definition: definition as TemplateDefinition }
}
