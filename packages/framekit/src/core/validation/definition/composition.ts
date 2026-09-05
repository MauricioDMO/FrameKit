import type { NumberFieldDescriptor } from '../../../types'

import { validateNumberValue } from '../data'
import { isPlainObject } from '../utils'

export function validateComposition (
  content: unknown,
  fields: unknown,
  variants: unknown
): string | undefined {
  if (!isPlainObject(content)) {
    return 'content must be a plain object'
  }

  const contentKeys = Object.keys(content)
  if (contentKeys.length === 0) {
    return 'content must have at least one entry'
  }

  const validatedFields = fields as Record<string, Record<string, unknown>>
  const validatedVariants = variants as {
    default: string
    labels?: Record<string, string>
  }
  const fieldKeys = new Set(Object.keys(validatedFields))

  if (!contentKeys.includes(validatedVariants.default)) {
    return `variants.default "${validatedVariants.default}" is not defined in content`
  }

  if (validatedVariants.labels) {
    for (const key of Object.keys(validatedVariants.labels)) {
      if (!contentKeys.includes(key)) {
        return `variants.labels contains unknown variant key "${key}"`
      }
    }
  }

  for (const variant of contentKeys) {
    const entry = content[variant]
    if (!isPlainObject(entry)) {
      return `content.${variant} must be a plain object`
    }

    for (const key of Object.keys(entry)) {
      if (!fieldKeys.has(key)) {
        return `content.${variant} contains unknown field key "${key}"`
      }
      const field = validatedFields[key]
      const expectedType = field.kind === 'boolean'
        ? 'boolean'
        : field.kind === 'number'
          ? 'number'
          : 'string'
      const actualType = typeof entry[key]
      if (actualType !== expectedType || (expectedType === 'number' && !Number.isFinite(entry[key]))) {
        return `content.${variant}.${key} must be a ${expectedType}`
      }
      if (field.kind === 'number') {
        const numberField = field as unknown as Pick<NumberFieldDescriptor, 'min' | 'max' | 'step'>
        const error = validateNumberValue(entry[key], numberField)
        if (error?.code === 'number_too_small') {
          return `content.${variant}.${key} must be greater than or equal to min`
        }
        if (error?.code === 'number_too_large') {
          return `content.${variant}.${key} must be less than or equal to max`
        }
        if (error?.code === 'invalid_step') {
          return `content.${variant}.${key} must match step`
        }
      }
    }
  }

  return undefined
}
