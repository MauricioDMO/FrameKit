import { describe, expect, it } from 'vitest'

import { validateTemplateBase, validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition', () => {
  it.each([
    ['non-object definition', null, 'definition must be a non-null object'],
    ['array definition', [], 'definition must be a non-null object'],
    ['missing metadata', { meta: undefined }, 'meta must be a plain object'],
    ['missing metadata title', { meta: {} }, 'meta.title must be a non-empty string'],
    ['empty metadata title', { meta: { title: '  ' } }, 'meta.title must be a non-empty string'],
    ['missing variants', { variants: undefined }, 'variants must be a plain object'],
    ['unknown top-level property', { version: 1 }, 'definition contains unknown property "version"']
  ])('rejects a %s', (_name, definition, error) => {
    const candidate = definition === null || Array.isArray(definition) ? definition : { ...validDefinition(), ...definition }
    expect(validateTemplateDefinition(candidate)).toEqual({ success: false, error })
  })

  it.each([
    ['missing', undefined],
    ['non-function', 'not a function']
  ])('rejects a %s render', (_name, render) => {
    const definition: Record<string, unknown> = validDefinition()
    if (render === undefined) delete definition.render
    else definition.render = render

    expect(validateTemplateDefinition(definition)).toEqual({
      success: false,
      error: 'render must be a function'
    })
  })

  it('accepts a valid base without a render function and returns the same definition', () => {
    const definition: Record<string, unknown> = validDefinition()
    delete definition.render

    const result = validateTemplateBase(definition)

    expect(result).toEqual({ success: true, definition })
    if (result.success) expect(result.definition).toBe(definition)
  })

  it.each([
    ['missing', undefined],
    ['non-function', 'not a function']
  ])('reports a base error before a %s render', (_name, render) => {
    const definition: Record<string, unknown> = { ...validDefinition(), meta: undefined }
    if (render === undefined) delete definition.render
    else definition.render = render

    expect(validateTemplateDefinition(definition)).toEqual({
      success: false,
      error: 'meta must be a plain object'
    })
  })

  it.each([
    ['root', { version: 1, meta: {}, width: 0, fields: [], variants: {}, content: [] }, 'definition contains unknown property "version"'],
    ['metadata', { meta: {}, width: 0, fields: [], variants: {}, content: [] }, 'meta.title must be a non-empty string'],
    ['dimensions', { width: 0, fields: [], variants: {}, content: [] }, 'width must be a positive finite integer'],
    ['fields', { fields: [], variants: {}, content: [] }, 'fields must be a plain object'],
    ['variants', { variants: {}, content: [] }, 'variants.default must be a non-empty string'],
    ['composition', { content: [] }, 'content must be a plain object']
  ])('returns the first error in root-to-composition order at %s', (_name, changes, error) => {
    const definition: Record<string, unknown> = { ...validDefinition(), ...changes }
    delete definition.render

    expect(validateTemplateDefinition(definition)).toEqual({ success: false, error })
  })
})
