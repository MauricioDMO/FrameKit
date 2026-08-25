import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '../index'

function validDefinition() {
  return {
    meta: { title: 'Valid template' },
    width: 100,
    height: 200,
    fields: {
      title: { kind: 'text', label: 'Title' },
    },
    content: {
      en: { title: 'Hello' },
    },
    variants: { default: 'en', labels: { en: 'English' } },
    render: () => null,
  }
}

describe('validateTemplateDefinition', () => {
  it.each([
    ['non-object definition', null, 'definition must be a non-null object'],
    ['array definition', [], 'definition must be a non-null object'],
    ['missing metadata', { meta: undefined }, 'meta must be a plain object'],
    ['missing metadata title', { meta: {} }, 'meta.title must be a non-empty string'],
    ['empty metadata title', { meta: { title: '  ' } }, 'meta.title must be a non-empty string'],
    ['missing variants', { variants: undefined }, 'variants must be a plain object'],
    ['unknown top-level property', { version: 1 }, 'definition contains unknown property "version"'],
  ])('rejects a %s', (_name, definition, error) => {
    const candidate = definition === null || Array.isArray(definition) ? definition : { ...validDefinition(), ...definition }
    expect(validateTemplateDefinition(candidate)).toEqual({ success: false, error })
  })

  it('accepts optional metadata', () => {
    const result = validateTemplateDefinition({
      ...validDefinition(),
      meta: {
        title: 'Social card',
        description: 'A card for social posts',
        marketingDescription: 'Present an offer and motivate an action',
        tags: ['social', 'promotion'],
      },
    })

    expect(result.success).toBe(true)
  })

  it.each([
    ['description', { description: 1 }, 'meta.description must be a string'],
    ['marketingDescription', { marketingDescription: 1 }, 'meta.marketingDescription must be a string'],
    ['tags', { tags: 'social' }, 'meta.tags must be an array of strings'],
    ['tag value', { tags: ['social', 1] }, 'meta.tags must be an array of strings'],
  ])('rejects invalid metadata %s', (_name, change, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      meta: { ...validDefinition().meta, ...change },
    })).toEqual({ success: false, error })
  })

  it.each(['revision', 'status', 'keywords', 'order'])('rejects unsupported metadata property %s', (key) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      meta: { ...validDefinition().meta, [key]: 'unsupported' },
    })).toEqual({ success: false, error: `meta contains unknown property "${key}"` })
  })

  it.each([
    ['non-object descriptor', null, 'fields.title must be a plain object'],
    ['array descriptor', [], 'fields.title must be a plain object'],
    ['unknown kind', { kind: 'date', label: 'Title' }, 'fields.title.kind is invalid'],
    ['empty label', { kind: 'text', label: '  ' }, 'fields.title.label must be a non-empty string'],
    ['invalid placeholder', { kind: 'text', label: 'Title', placeholder: 1 }, 'fields.title.placeholder must be a string'],
    ['invalid required', { kind: 'text', label: 'Title', required: 1 }, 'fields.title.required must be a boolean'],
    ['invalid default', { kind: 'text', label: 'Title', defaultValue: 1 }, 'fields.title.defaultValue must be a string'],
    ['non-finite minimum', { kind: 'number', label: 'Count', min: Infinity }, 'fields.title.min must be a finite number'],
    ['non-finite maximum', { kind: 'number', label: 'Count', max: NaN }, 'fields.title.max must be a finite number'],
    ['reversed limits', { kind: 'number', label: 'Count', min: 5, max: 4 }, 'fields.title.min must be less than or equal to max'],
    ['limits on non-number', { kind: 'text', label: 'Title', min: 1 }, 'fields.title cannot define min or max'],
    ['invalid image scope', { kind: 'image', label: 'Image', scope: 'locale' }, 'fields.title.scope is invalid'],
    ['scope on non-image', { kind: 'text', label: 'Title', scope: 'common' }, 'fields.title.scope is only valid for image fields'],
  ])('rejects %s descriptors', (_name, field, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { title: field },
    })).toEqual({ success: false, error })
  })

  it.each(['width', 'height'] as const)('rejects decimal %s', (dimension) => {
    const definition = validDefinition()
    definition[dimension] = 100.5

    expect(validateTemplateDefinition(definition)).toEqual({
      success: false,
      error: `${dimension} must be a positive finite integer`,
    })
  })

  it('rejects a missing render function', () => {
    const definition: Record<string, unknown> = validDefinition()
    delete definition.render

    expect(validateTemplateDefinition(definition)).toEqual({
      success: false,
      error: 'render must be a function',
    })
  })

  it.each([
    ['empty content', { content: {} }, 'content must have at least one entry'],
    ['unknown content key', { content: { en: { missing: 'value' } } }, 'content.en contains unknown field key "missing"'],
    ['content metadata', { content: { en: { language: 'English' } } }, 'content.en contains unknown field key "language"'],
    ['unknown default variant', { variants: { default: 'fr' } }, 'variants.default "fr" is not defined in content'],
    ['unsupported variant property', { variants: { default: 'en', mode: 'language' } }, 'variants contains unknown property "mode"'],
    ['unknown variant label', { variants: { default: 'en', labels: { fr: 'French' } } }, 'variants.labels contains unknown variant key "fr"'],
  ])('rejects %s', (_name, change, error) => {
    expect(validateTemplateDefinition({ ...validDefinition(), ...change })).toEqual({
      success: false,
      error,
    })
  })

  it.each([
    ['non-object labels', [], 'variants.labels must be a plain object'],
    ['non-string label', { en: 1 }, 'variants.labels.en must be a non-empty string'],
  ])('rejects invalid variant labels: %s', (_name, labels, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      variants: { default: 'en', labels },
    })).toEqual({ success: false, error })
  })
})
