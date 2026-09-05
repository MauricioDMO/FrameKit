import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition choice fields', () => {
  it.each([
    ['empty choice options', { kind: 'choice', label: 'Alignment', options: [], defaultValue: 'center' }, 'fields.title.options must be a non-empty array'],
    ['non-array choice options', { kind: 'choice', label: 'Alignment', options: {}, defaultValue: 'center' }, 'fields.title.options must be a non-empty array'],
    ['non-object choice option', { kind: 'choice', label: 'Alignment', options: [null], defaultValue: 'center' }, 'fields.title.options[0] must be a plain object'],
    ['empty choice option value', { kind: 'choice', label: 'Alignment', options: [{ value: ' ', label: 'Blank' }], defaultValue: ' ' }, 'fields.title.options[0].value must be a non-empty string'],
    ['empty choice option label', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: ' ' }], defaultValue: 'left' }, 'fields.title.options[0].label must be a non-empty string'],
    ['duplicate choice option values', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }, { value: 'left', label: 'Also left' }], defaultValue: 'left' }, 'fields.title.options contains duplicate value "left"'],
    ['missing choice default', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }] }, 'fields.title.defaultValue is required'],
    ['unknown choice default', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }], defaultValue: 'right' }, 'fields.title.defaultValue must match an option value'],
    ['required on choice', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }], defaultValue: 'left', required: false }, 'fields.title cannot define required'],
    ['control on choice', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }], defaultValue: 'left', control: 'select' }, 'fields.title cannot define control'],
    ['step on choice', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }], defaultValue: 'left', step: 1 }, 'fields.title cannot define step']
  ])('rejects %s', (_name, field, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { title: field }
    })).toEqual({ success: false, error })
  })
})
