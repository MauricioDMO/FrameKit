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
      validNumber: field.number({ label: 'Valid number', defaultValue: 12.5, step: 0.5 }),
      tooSmall: field.number({ label: 'Too small', defaultValue: 10, min: 10 }),
      tooLarge: field.number({ label: 'Too large', defaultValue: 20, max: 20 }),
      steppedNumber: field.number({ label: 'Stepped number', defaultValue: 4, min: 0, max: 10, step: 2 }),
      invalidNumber: field.number({ label: 'Invalid number', defaultValue: 13 }),
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

function createChoiceDefinition() {
  return defineTemplate({
    meta: { title: 'Choice validation' },
    width: 100,
    height: 100,
    fields: {
      alignment: field.choice({
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
        defaultValue: 'center',
      }),
    },
    content: { en: {} },
    variants: { default: 'en' },
    render: () => null,
  })
}

function createBooleanDefinition() {
  return defineTemplate({
    meta: { title: 'Boolean validation' },
    width: 100,
    height: 100,
    fields: {
      omittedDefault: field.boolean({ label: 'Omitted default' }),
      explicitTrue: field.boolean({ label: 'Explicit true', defaultValue: true }),
      explicitFalse: field.boolean({ label: 'Explicit false', defaultValue: false }),
    },
    content: { en: {} },
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
      validNumber: '',
      tooSmall: 10,
      tooLarge: 20,
      steppedNumber: 4,
      invalidNumber: 13,
      requiredImage: '  ',
      optionalImage: '  ',
      requiredColor: '  ',
      optionalColor: '  ',
    })).toEqual({
      requiredText: { code: 'required' },
      validNumber: { code: 'invalid_number' },
      requiredImage: { code: 'required' },
      requiredColor: { code: 'required' },
    })
  })

  it('returns numeric validation codes for valid, bounded, and non-numeric values', () => {
    const definition = createDefinition()

    expect(validateTemplateData(definition, {
      requiredText: 'Ready',
      limitedText: 'four',
      validNumber: 12.5,
      tooSmall: 9,
      tooLarge: 21,
      steppedNumber: 4,
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
      validNumber: 12,
      tooSmall: 10,
      tooLarge: 20,
      steppedNumber: 4,
      invalidNumber: 13,
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
      validNumber: { code: 'invalid_number' },
      tooSmall: { code: 'invalid_number' },
      tooLarge: { code: 'invalid_number' },
      steppedNumber: { code: 'invalid_number' },
      invalidNumber: { code: 'invalid_number' },
      requiredImage: { code: 'required' },
      optionalColor: { code: 'invalid_color' },
    })
  })

  it('measures text limits without trimming whitespace or newlines', () => {
    const definition = createDefinition()
    const baseData = {
      requiredText: 'Ready',
      optionalText: '',
      validNumber: 12,
      tooSmall: 10,
      tooLarge: 20,
      steppedNumber: 4,
      invalidNumber: 13,
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

  it('accepts only declared choice strings without coercion or recovery', () => {
    const definition = createChoiceDefinition()

    expect(validateTemplateData(definition, { alignment: 'left' })).toEqual({})
    expect(validateTemplateData(definition, { alignment: 'center' })).toEqual({})
    expect(validateTemplateData(definition, { alignment: 'right' })).toEqual({})
    expect(validateTemplateData(definition, { alignment: 'first' })).toEqual({ alignment: { code: 'invalid_choice' } })
    expect(validateTemplateData(definition, { alignment: ' center ' })).toEqual({ alignment: { code: 'invalid_choice' } })
    expect(validateTemplateData(definition, { alignment: 1 as unknown as string })).toEqual({ alignment: { code: 'invalid_choice' } })
    expect(validateTemplateData(definition, {})).toEqual({ alignment: { code: 'invalid_choice' } })
  })

  it('accepts real booleans and rejects string or numeric substitutes', () => {
    const definition = createBooleanDefinition()

    expect(validateTemplateData(definition, { omittedDefault: false, explicitTrue: true, explicitFalse: false })).toEqual({})
    expect(validateTemplateData(definition, { omittedDefault: 'false', explicitTrue: 'true', explicitFalse: 0 as unknown as boolean })).toEqual({
      omittedDefault: { code: 'invalid_boolean' },
      explicitTrue: { code: 'invalid_boolean' },
      explicitFalse: { code: 'invalid_boolean' },
    })
    expect(validateTemplateData(definition, {})).toEqual({
      omittedDefault: { code: 'invalid_boolean' },
      explicitTrue: { code: 'invalid_boolean' },
      explicitFalse: { code: 'invalid_boolean' },
    })
  })

  it('rejects numeric strings and values outside the declared step', () => {
    const definition = createDefinition()

    expect(validateTemplateData(definition, {
      validNumber: '12.5',
      tooSmall: 10,
      tooLarge: 20,
      steppedNumber: 3,
      invalidNumber: 13,
      requiredText: 'Ready',
      requiredImage: '/assets/images/hero.webp',
      requiredColor: '#AABBCC',
    })).toEqual({
      validNumber: { code: 'invalid_number' },
      steppedNumber: { code: 'invalid_step', step: 2 },
    })
  })

  it('does not grow step tolerance with the quotient magnitude', () => {
    const definition = defineTemplate({
      meta: { title: 'Large number validation' },
      width: 100,
      height: 100,
      fields: { value: field.number({ label: 'Value', defaultValue: 100000000000000.1, step: 0.1 }) },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(validateTemplateData(definition, { value: 100000000000000.12 })).toEqual({
      value: { code: 'invalid_step', step: 0.1 },
    })
  })

  it('rejects significant step mismatches at tiny and large magnitudes', () => {
    const definition = defineTemplate({
      meta: { title: 'Step precision validation' },
      width: 100,
      height: 100,
      fields: {
        tiny: field.number({ label: 'Tiny value', defaultValue: 1e-18, min: 0, max: 2e-18, step: 1e-18 }),
        large: field.number({ label: 'Large value', defaultValue: 1e15, step: 1 }),
        decimal: field.number({ label: 'Decimal value', defaultValue: 0.3, min: 0, step: 0.1 }),
        minimumStepAtZero: field.number({ label: 'Minimum step at zero', defaultValue: 0, step: Number.MIN_VALUE }),
        minimumStepValue: field.number({ label: 'Minimum step value', defaultValue: Number.MIN_VALUE, step: Number.MIN_VALUE }),
        minimumStepLargeValue: field.number({ label: 'Minimum step large value', defaultValue: Number.MAX_VALUE, step: Number.MIN_VALUE }),
      },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(validateTemplateData(definition, {
      tiny: 1.24e-18,
      large: 1_000_000_000_000_000.12,
      decimal: 0.1 + 0.2,
      minimumStepAtZero: 0,
      minimumStepValue: Number.MIN_VALUE,
      minimumStepLargeValue: Number.MAX_VALUE,
    })).toEqual({
      tiny: { code: 'invalid_step', step: 1e-18 },
      large: { code: 'invalid_step', step: 1 },
    })
  })

  it('rejects a large value when a decimal minimum changes the step offset', () => {
    const definition = defineTemplate({
      meta: { title: 'Large decimal step validation' },
      width: 100,
      height: 100,
      fields: {
        value: field.number({
          label: 'Value',
          defaultValue: 1_000_000_000_000_000.1,
          min: 0.1,
          step: 0.2,
        }),
      },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(validateTemplateData(definition, { value: 1e15 })).toEqual({
      value: { code: 'invalid_step', step: 0.2 },
    })
  })

  it('accepts small step imprecision without accepting a significant mismatch', () => {
    const definition = defineTemplate({
      meta: { title: 'Step tolerance validation' },
      width: 100,
      height: 100,
      fields: { value: field.number({ label: 'Value', defaultValue: 2, step: 1 }) },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(validateTemplateData(definition, { value: 2.00000001 })).toEqual({})
    expect(validateTemplateData(definition, { value: 2.0000001 })).toEqual({
      value: { code: 'invalid_step', step: 1 },
    })
  })

  it('uses native step tolerance when the step is larger than one', () => {
    const definition = defineTemplate({
      meta: { title: 'Scaled step tolerance' },
      width: 100,
      height: 100,
      fields: { value: field.number({ label: 'Value', defaultValue: 10, min: 0, step: 10 }) },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(validateTemplateData(definition, { value: 10.0000005 })).toEqual({})
    expect(validateTemplateData(definition, { value: 10.0000006 })).toEqual({
      value: { code: 'invalid_step', step: 10 },
    })
  })
})
