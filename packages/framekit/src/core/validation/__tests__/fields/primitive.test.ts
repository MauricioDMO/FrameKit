import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition primitive fields', () => {
  it.each([
    ['invalid boolean default', { kind: 'boolean', label: 'Show logo', defaultValue: 'true' }, 'fields.title.defaultValue must be a boolean'],
    ['null boolean default', { kind: 'boolean', label: 'Show logo', defaultValue: null }, 'fields.title.defaultValue must be a boolean'],
    ['placeholder on boolean', { kind: 'boolean', label: 'Show logo', placeholder: 'yes' }, 'fields.title cannot define placeholder'],
    ['required on boolean', { kind: 'boolean', label: 'Show logo', required: false }, 'fields.title cannot define required'],
    ['control on boolean', { kind: 'boolean', label: 'Show logo', control: 'checkbox' }, 'fields.title cannot define control'],
    ['step on boolean', { kind: 'boolean', label: 'Show logo', step: 1 }, 'fields.title cannot define step'],
    ['text lengths on non-text', { kind: 'color', label: 'Color', minLength: 1 }, 'fields.title cannot define minLength or maxLength']
  ])('rejects %s', (_name, field, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { title: field }
    })).toEqual({ success: false, error })
  })

  it('accepts boolean descriptors and content values', () => {
    const definition = {
      ...validDefinition(),
      fields: { showLogo: { kind: 'boolean', label: 'Show logo' } },
      content: { en: { showLogo: true } }
    }

    expect(validateTemplateDefinition(definition)).toEqual({ success: true, definition })
  })
})
