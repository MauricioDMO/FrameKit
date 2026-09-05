import { describe, expect, it } from 'vitest'

import { field, validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition number fields', () => {
  it.each([
    ['missing number default', { kind: 'number', label: 'Count' }, 'fields.title.defaultValue is required'],
    ['string number default', { kind: 'number', label: 'Count', defaultValue: '10' }, 'fields.title.defaultValue must be a finite number'],
    ['non-finite number default', { kind: 'number', label: 'Count', defaultValue: Infinity }, 'fields.title.defaultValue must be a finite number'],
    ['required on number', { kind: 'number', label: 'Count', defaultValue: 1, required: false }, 'fields.title cannot define required'],
    ['invalid number control', { kind: 'number', label: 'Count', defaultValue: 1, control: 'select' }, 'fields.title.control must be "input" or "slider"'],
    ['non-finite minimum', { kind: 'number', label: 'Count', defaultValue: 0, min: Infinity }, 'fields.title.min must be a finite number'],
    ['non-finite maximum', { kind: 'number', label: 'Count', defaultValue: 0, max: NaN }, 'fields.title.max must be a finite number'],
    ['reversed limits', { kind: 'number', label: 'Count', defaultValue: 5, min: 5, max: 4 }, 'fields.title.min must be less than or equal to max'],
    ['non-finite step', { kind: 'number', label: 'Count', defaultValue: 1, step: Infinity }, 'fields.title.step must be a finite positive number'],
    ['non-positive step', { kind: 'number', label: 'Count', defaultValue: 1, step: 0 }, 'fields.title.step must be a finite positive number'],
    ['slider without minimum', { kind: 'number', label: 'Count', defaultValue: 1, max: 10, control: 'slider' }, 'fields.title.slider requires explicit min and max'],
    ['slider without maximum', { kind: 'number', label: 'Count', defaultValue: 1, min: 0, control: 'slider' }, 'fields.title.slider requires explicit min and max'],
    ['default below minimum', { kind: 'number', label: 'Count', defaultValue: 1, min: 2 }, 'fields.title.defaultValue must be greater than or equal to min'],
    ['default above maximum', { kind: 'number', label: 'Count', defaultValue: 11, max: 10 }, 'fields.title.defaultValue must be less than or equal to max'],
    ['default outside step', { kind: 'number', label: 'Count', defaultValue: 3, step: 2 }, 'fields.title.defaultValue must match step']
  ])('rejects %s', (_name, field, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { title: field }
    })).toEqual({ success: false, error })
  })

  it.each([
    ['required', { required: false }, 'fields.count cannot define required'],
    ['null step', { step: null }, 'fields.count.step must be a finite positive number'],
    ['null control', { control: null }, 'fields.count.control must be "input" or "slider"']
  ])('rejects number factory parameters with %s', (_name, invalid, error) => {
    const descriptor = field.number({ label: 'Count', defaultValue: 1, ...invalid } as never)

    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { count: descriptor },
      content: { en: { count: 1 } }
    })).toEqual({ success: false, error })
  })

  it('accepts numeric content values', () => {
    const definition = {
      ...validDefinition(),
      fields: { opacity: { kind: 'number', label: 'Opacity', defaultValue: 100, min: 0, max: 100, step: 5, control: 'slider' } },
      content: { en: { opacity: 50 } }
    }

    expect(validateTemplateDefinition(definition)).toEqual({ success: true, definition })
  })
})
