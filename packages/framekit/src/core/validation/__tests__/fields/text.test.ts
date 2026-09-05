import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition text fields', () => {
  it.each([
    ['invalid required', { kind: 'text', label: 'Title', required: 1 }, 'fields.title.required must be a boolean'],
    ['invalid default', { kind: 'text', label: 'Title', defaultValue: 1 }, 'fields.title.defaultValue must be a string'],
    ['control on text', { kind: 'text', label: 'Title', control: 'slider' }, 'fields.title cannot define control'],
    ['step on text', { kind: 'text', label: 'Title', step: 2 }, 'fields.title cannot define step'],
    ['limits on non-number', { kind: 'text', label: 'Title', min: 1 }, 'fields.title cannot define min or max'],
    ['non-finite minimum length', { kind: 'text', label: 'Title', minLength: Infinity }, 'fields.title.minLength must be a finite non-negative integer'],
    ['negative minimum length', { kind: 'text', label: 'Title', minLength: -1 }, 'fields.title.minLength must be a finite non-negative integer'],
    ['fractional maximum length', { kind: 'text', label: 'Title', maxLength: 1.5 }, 'fields.title.maxLength must be a finite non-negative integer'],
    ['reversed text lengths', { kind: 'text', label: 'Title', minLength: 5, maxLength: 4 }, 'fields.title.minLength must be less than or equal to maxLength']
  ])('rejects %s', (_name, field, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { title: field }
    })).toEqual({ success: false, error })
  })
})
