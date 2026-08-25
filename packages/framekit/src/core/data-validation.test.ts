import { describe, expect, it } from 'vitest'

import { defineTemplate, field, validateTemplateData } from '../index'

function createDefinition() {
  return defineTemplate({
    meta: { title: 'Data validation' },
    width: 100,
    height: 200,
    fields: {
      requiredText: field.text({ label: 'Required text' }),
      optionalText: field.text({ label: 'Optional text', required: false }),
      limitedText: field.text({ label: 'Limited text', required: false, minLength: 2, maxLength: 4 }),
      validNumber: field.number({ label: 'Valid number' }),
      optionalNumber: field.number({ label: 'Optional number', required: false }),
      tooSmall: field.number({ label: 'Too small', min: 10 }),
      tooLarge: field.number({ label: 'Too large', max: 20 }),
      invalidNumber: field.number({ label: 'Invalid number' }),
      requiredImage: field.image({ label: 'Required image' }),
      optionalImage: field.image({ label: 'Optional image', required: false }),
      requiredColor: field.color({ label: 'Required color' }),
      optionalColor: field.color({ label: 'Optional color', required: false }),
    },
    content: {
      en: {},
    },
    variants: { default: 'en' },
    render: () => null,
  })
}

describe('validateTemplateData', () => {
  it('rejects required empty values but accepts optional empty values', () => {
    const definition = createDefinition()

    expect(validateTemplateData(definition, {
      requiredText: '  ',
      optionalText: '  ',
      limitedText: 'okay',
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
      limitedText: 'four',
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
      limitedText: 'four',
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
      limitedText: 'four',
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

  it('measures text limits without trimming whitespace or newlines', () => {
    const definition = createDefinition()
    const baseData = {
      requiredText: 'Ready',
      optionalText: '',
      validNumber: '12',
      optionalNumber: '',
      tooSmall: '10',
      tooLarge: '20',
      invalidNumber: '13',
      requiredImage: '/assets/images/hero.webp',
      optionalImage: '',
      requiredColor: '#AABBCC',
      optionalColor: '',
    }

    expect(validateTemplateData(definition, { ...baseData, limitedText: 'a\n' })).toEqual({})
    expect(validateTemplateData(definition, { ...baseData, limitedText: 'a' })).toEqual({ limitedText: { code: 'text_too_short', minLength: 2 } })
    expect(validateTemplateData(definition, { ...baseData, limitedText: 'abcd\n' })).toEqual({ limitedText: { code: 'text_too_long', maxLength: 4 } })
    expect(validateTemplateData(definition, { ...baseData, limitedText: ' ' })).toEqual({ limitedText: { code: 'text_too_short', minLength: 2 } })
    expect(validateTemplateData(definition, { ...baseData, limitedText: '     ' })).toEqual({ limitedText: { code: 'text_too_long', maxLength: 4 } })
  })
})
