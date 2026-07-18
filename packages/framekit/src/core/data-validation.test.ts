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
      requiredUrl: fields.url({ label: 'Required URL' }),
      optionalUrl: fields.url({ label: 'Optional URL', required: false }),
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
      requiredUrl: '  ',
      optionalUrl: '  ',
    })).toEqual({
      requiredText: { code: 'required' },
      validNumber: { code: 'required' },
      requiredUrl: { code: 'required' },
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
      requiredUrl: 'https://example.test',
    })).toEqual({
      tooSmall: { code: 'number_too_small', min: 10 },
      tooLarge: { code: 'number_too_large', max: 20 },
      invalidNumber: { code: 'invalid_number' },
    })
  })

  it('accepts absolute HTTP(S) URLs and root-relative paths only', () => {
    const definition = createDefinition()

    expect(validateTemplateData(definition, {
      requiredText: 'Ready',
      validNumber: '12',
      tooSmall: '10',
      tooLarge: '20',
      invalidNumber: '13',
      requiredUrl: 'HTTPS://example.test/image.svg',
      optionalUrl: '/images/image.svg',
    })).toEqual({})

    expect(validateTemplateData(definition, {
      requiredText: 'Ready',
      validNumber: '12',
      tooSmall: '10',
      tooLarge: '20',
      invalidNumber: '13',
      requiredUrl: 'ftp://example.test/image.svg',
      optionalUrl: 'javascript:alert(1)',
    })).toEqual({
      requiredUrl: { code: 'invalid_url' },
      optionalUrl: { code: 'invalid_url' },
    })
  })
})
