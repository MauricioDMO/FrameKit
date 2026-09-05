import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition composition', () => {
  it.each([
    ['non-plain content', [], 'content must be a plain object']
  ])('rejects a %s', (_name, content, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      content
    })).toEqual({ success: false, error })
  })

  it('rejects a non-object content container', () => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      content: null
    })).toEqual({ success: false, error: 'content must be a plain object' })
  })

  it('accepts numeric content at inclusive limits', () => {
    const definition = {
      ...validDefinition(),
      fields: { count: { kind: 'number', label: 'Count', defaultValue: 10, min: 10, max: 20 } },
      content: { en: { count: 10 }, max: { count: 20 } }
    }

    expect(validateTemplateDefinition(definition)).toEqual({ success: true, definition })
  })

  it.each([
    ['below minimum', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 10, min: 10, max: 20 } }, content: { en: { count: 9 } } }, 'content.en.count must be greater than or equal to min'],
    ['above maximum', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 10, min: 10, max: 20 } }, content: { en: { count: 21 } } }, 'content.en.count must be less than or equal to max'],
    ['outside step', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 10, min: 10, max: 20, step: 2 } }, content: { en: { count: 11 } } }, 'content.en.count must match step'],
    ['outside step at a large magnitude', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 100000000000000.1, step: 0.1 } }, content: { en: { count: Number('100000000000000.12') } } }, 'content.en.count must match step']
  ])('rejects numeric content %s', (_name, change, error) => {
    expect(validateTemplateDefinition({ ...validDefinition(), ...change })).toEqual({ success: false, error })
  })

  it.each([
    ['empty content', { content: {} }, 'content must have at least one entry'],
    ['unknown content key', { content: { en: { missing: 'value' } } }, 'content.en contains unknown field key "missing"'],
    ['content metadata', { content: { en: { language: 'English' } } }, 'content.en contains unknown field key "language"'],
    ['string boolean content', { fields: { showLogo: { kind: 'boolean', label: 'Show logo' } }, content: { en: { showLogo: 'true' } } }, 'content.en.showLogo must be a boolean'],
    ['numeric boolean content', { fields: { showLogo: { kind: 'boolean', label: 'Show logo' } }, content: { en: { showLogo: 1 } } }, 'content.en.showLogo must be a boolean'],
    ['string number content', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 1 } }, content: { en: { count: '1' } } }, 'content.en.count must be a number'],
    ['non-finite number content', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 1 } }, content: { en: { count: Infinity } } }, 'content.en.count must be a number'],
    ['unknown default variant', { variants: { default: 'fr' } }, 'variants.default "fr" is not defined in content'],
    ['unknown variant label', { variants: { default: 'en', labels: { fr: 'French' } } }, 'variants.labels contains unknown variant key "fr"']
  ])('rejects %s', (_name, change, error) => {
    expect(validateTemplateDefinition({ ...validDefinition(), ...change })).toEqual({
      success: false,
      error
    })
  })

  it('rejects a non-object content entry', () => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      content: { en: null }
    })).toEqual({ success: false, error: 'content.en must be a plain object' })
  })
})
