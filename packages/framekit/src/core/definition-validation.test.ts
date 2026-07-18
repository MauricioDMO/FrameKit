import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '../index'

function validDefinition() {
  return {
    width: 100,
    height: 200,
    fields: {
      title: { kind: 'text', label: 'Title' },
    },
    content: {
      en: { language: 'English', title: 'Hello' },
    },
    render: () => null,
  }
}

describe('validateTemplateDefinition', () => {
  it.each([
    ['non-object definition', null, 'definition must be a non-null object'],
    ['array definition', [], 'definition must be a non-null object'],
  ])('rejects a %s', (_name, definition, error) => {
    expect(validateTemplateDefinition(definition)).toEqual({ success: false, error })
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
    ['unknown content key', { content: { en: { language: 'English', missing: 'value' } } }, 'content.en contains unknown field key "missing"'],
  ])('rejects %s', (_name, change, error) => {
    expect(validateTemplateDefinition({ ...validDefinition(), ...change })).toEqual({
      success: false,
      error,
    })
  })
})
