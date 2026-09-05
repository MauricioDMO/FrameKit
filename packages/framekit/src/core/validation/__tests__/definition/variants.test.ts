import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition variants', () => {
  it.each([
    ['non-plain variants', [], 'variants must be a plain object'],
    ['empty variants', {}, 'variants.default must be a non-empty string']
  ])('rejects a %s', (_name, variants, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      variants
    })).toEqual({ success: false, error })
  })

  it.each([
    ['empty default variant', { default: '  ' }, 'variants.default must be a non-empty string'],
    ['non-string default variant', { default: 1 }, 'variants.default must be a non-empty string']
  ])('rejects %s', (_name, variants, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      variants
    })).toEqual({ success: false, error })
  })

  it.each([
    ['empty', '  '],
    ['non-string', 1]
  ])('rejects an invalid default before composition: %s', (_name, defaultValue) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      variants: { default: defaultValue },
      content: null
    })).toEqual({ success: false, error: 'variants.default must be a non-empty string' })
  })

  it('rejects unsupported variant property', () => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      variants: { default: 'en', mode: 'language' }
    })).toEqual({
      success: false,
      error: 'variants contains unknown property "mode"'
    })
  })

  it.each([
    ['non-object labels', [], 'variants.labels must be a plain object'],
    ['empty label', { en: '  ' }, 'variants.labels.en must be a non-empty string'],
    ['non-string label', { en: 1 }, 'variants.labels.en must be a non-empty string']
  ])('rejects invalid variant labels: %s', (_name, labels, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      variants: { default: 'en', labels }
    })).toEqual({ success: false, error })
  })
})
