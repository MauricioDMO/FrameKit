import { describe, expect, it } from 'vitest'

import { defineTemplate, fields, validateTemplateData } from '../index'

function createDefinition() {
  return defineTemplate({
    width: 100,
    height: 200,
    fields: {
      requiredText: fields.text({ label: 'Required text' }),
      optionalText: fields.text({ label: 'Optional text', required: false }),
      validNumber: fields.number({ label: 'Valid number' }),
      optionalNumber: fields.number({ label: 'Optional number', required: false }),
      tooSmall: fields.number({ label: 'Too small', min: 10 }),
      tooLarge: fields.number({ label: 'Too large', max: 20 }),
      invalidNumber: fields.number({ label: 'Invalid number' }),
      requiredImage: fields.image({ label: 'Required image' }),
      optionalImage: fields.image({ label: 'Optional image', required: false }),
      requiredColor: fields.color({ label: 'Required color' }),
      optionalColor: fields.color({ label: 'Optional color', required: false }),
    },
    content: {
      en: { language: 'English' },
    },
    render: () => null,
  })
}

describe('validateTemplateData', () => {
  it('rejects required empty values but accepts optional empty values', () => {
    const definition = createDefinition()

    expect(validateTemplateData(definition, {
      requiredText: '  ',
      optionalText: '  ',
      validNumber: '  ',
      optionalNumber: '  ',
      tooSmall: '10',
      tooLarge: '20',
      invalidNumber: '13',
      requiredImage: '  ',
      optionalImage: '  ',
      requiredColor: '  ',
      optionalColor: '  ',
    })).toEqual({
      requiredText: { code: 'required' },
      validNumber: { code: 'required' },
      requiredImage: { code: 'required' },
      requiredColor: { code: 'required' },
    })
  })

  it('returns numeric validation codes for valid, bounded, and non-numeric values', () => {
    const definition = createDefinition()

    expect(validateTemplateData(definition, {
      requiredText: 'Ready',
      validNumber: '12.5',
      tooSmall: '9',
      tooLarge: '21',
      invalidNumber: 'nope',
      requiredImage: '/assets/images/hero.webp',
      optionalImage: '',
      requiredColor: '#AABBCC',
      optionalColor: '',
    })).toEqual({
      tooSmall: { code: 'number_too_small', min: 10 },
      tooLarge: { code: 'number_too_large', max: 20 },
      invalidNumber: { code: 'invalid_number' },
    })
  })

  it('accepts public paths for image fields', () => {
    const definition = createDefinition()

    expect(validateTemplateData(definition, {
      requiredText: 'Ready',
      validNumber: '12',
      tooSmall: '10',
      tooLarge: '20',
      invalidNumber: '13',
      requiredImage: '/assets/images/hero.webp',
      optionalImage: '',
      requiredColor: '#AABBCC',
      optionalColor: '#112233',
    })).toEqual({})

    expect(validateTemplateData(definition, {
      requiredText: 'Ready',
      validNumber: '12',
      tooSmall: '10',
      tooLarge: '20',
      invalidNumber: '13',
      requiredImage: '',
      optionalImage: '',
      requiredColor: '#AABBCC',
      optionalColor: 'red',
    })).toEqual({
      requiredImage: { code: 'required' },
      optionalColor: { code: 'invalid_color' },
    })
  })
})
