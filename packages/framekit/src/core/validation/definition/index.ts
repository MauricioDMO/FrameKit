import type { TemplateBase, TemplateDefinition } from '../../../types'

import { validateComposition } from './composition'
import { validateDimensions } from './dimensions'
import { validateFields } from '../fields'
import { validateMetadata } from './metadata'
import { validateVariants } from './variants'
import { isPlainObject } from '../utils'

const DEFINITION_KEYS = new Set(['meta', 'width', 'height', 'fields', 'variants', 'content', 'render'])

type ValidationResult<Definition> = {
  success: true
  definition: Definition
} | {
  success: false
  error: string
}

export function validateTemplateBase (definition: unknown): ValidationResult<TemplateBase> {
  if (!isPlainObject(definition)) {
    return { success: false, error: 'definition must be a non-null object' }
  }

  const def = definition

  for (const key of Object.keys(def)) {
    if (!DEFINITION_KEYS.has(key)) {
      return { success: false, error: `definition contains unknown property "${key}"` }
    }
  }

  const metadataError = validateMetadata(def.meta)
  if (metadataError !== undefined) {
    return { success: false, error: metadataError }
  }

  const dimensionsError = validateDimensions(def.width, def.height)
  if (dimensionsError !== undefined) {
    return { success: false, error: dimensionsError }
  }

  const fieldsError = validateFields(def.fields)
  if (fieldsError !== undefined) {
    return { success: false, error: fieldsError }
  }

  const variantsError = validateVariants(def.variants)
  if (variantsError !== undefined) {
    return { success: false, error: variantsError }
  }

  const compositionError = validateComposition(def.content, def.fields, def.variants)
  if (compositionError !== undefined) {
    return { success: false, error: compositionError }
  }

  return { success: true, definition: definition as unknown as TemplateBase }
}

export function validateTemplateDefinition (definition: unknown): ValidationResult<TemplateDefinition> {
  const validation = validateTemplateBase(definition)
  if (!validation.success) return validation

  if (typeof (definition as Record<string, unknown>).render !== 'function') {
    return { success: false, error: 'render must be a function' }
  }

  return { success: true, definition: definition as TemplateDefinition }
}
