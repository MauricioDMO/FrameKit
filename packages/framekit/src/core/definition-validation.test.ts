import { describe, expect, it } from 'vitest'

import { field, validateTemplateDefinition } from '../index'

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
    ['removed textarea kind', { kind: 'textarea', label: 'Title' }, 'fields.title.kind is invalid'],
    ['empty label', { kind: 'text', label: '  ' }, 'fields.title.label must be a non-empty string'],
    ['invalid placeholder', { kind: 'text', label: 'Title', placeholder: 1 }, 'fields.title.placeholder must be a string'],
    ['invalid required', { kind: 'text', label: 'Title', required: 1 }, 'fields.title.required must be a boolean'],
    ['invalid default', { kind: 'text', label: 'Title', defaultValue: 1 }, 'fields.title.defaultValue must be a string'],
    ['empty choice options', { kind: 'choice', label: 'Alignment', options: [], defaultValue: 'center' }, 'fields.title.options must be a non-empty array'],
    ['non-object choice option', { kind: 'choice', label: 'Alignment', options: [null], defaultValue: 'center' }, 'fields.title.options[0] must be a plain object'],
    ['empty choice option value', { kind: 'choice', label: 'Alignment', options: [{ value: ' ', label: 'Blank' }], defaultValue: ' ' }, 'fields.title.options[0].value must be a non-empty string'],
    ['empty choice option label', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: ' ' }], defaultValue: 'left' }, 'fields.title.options[0].label must be a non-empty string'],
    ['duplicate choice option values', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }, { value: 'left', label: 'Also left' }], defaultValue: 'left' }, 'fields.title.options contains duplicate value "left"'],
    ['missing choice default', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }] }, 'fields.title.defaultValue is required'],
    ['unknown choice default', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }], defaultValue: 'right' }, 'fields.title.defaultValue must match an option value'],
    ['required on choice', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }], defaultValue: 'left', required: false }, 'fields.title cannot define required'],
    ['control on choice', { kind: 'choice', label: 'Alignment', options: [{ value: 'left', label: 'Left' }], defaultValue: 'left', control: 'select' }, 'fields.title cannot define control'],
    ['invalid boolean default', { kind: 'boolean', label: 'Show logo', defaultValue: 'true' }, 'fields.title.defaultValue must be a boolean'],
    ['null boolean default', { kind: 'boolean', label: 'Show logo', defaultValue: null }, 'fields.title.defaultValue must be a boolean'],
    ['placeholder on boolean', { kind: 'boolean', label: 'Show logo', placeholder: 'yes' }, 'fields.title cannot define placeholder'],
    ['required on boolean', { kind: 'boolean', label: 'Show logo', required: false }, 'fields.title cannot define required'],
    ['control on boolean', { kind: 'boolean', label: 'Show logo', control: 'checkbox' }, 'fields.title cannot define control'],
    ['control on text', { kind: 'text', label: 'Title', control: 'slider' }, 'fields.title cannot define control'],
    ['step on text', { kind: 'text', label: 'Title', step: 2 }, 'fields.title cannot define step'],
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
    ['default outside step', { kind: 'number', label: 'Count', defaultValue: 3, step: 2 }, 'fields.title.defaultValue must match step'],
    ['limits on non-number', { kind: 'text', label: 'Title', min: 1 }, 'fields.title cannot define min or max'],
    ['non-finite minimum length', { kind: 'text', label: 'Title', minLength: Infinity }, 'fields.title.minLength must be a finite non-negative integer'],
    ['negative minimum length', { kind: 'text', label: 'Title', minLength: -1 }, 'fields.title.minLength must be a finite non-negative integer'],
    ['fractional maximum length', { kind: 'text', label: 'Title', maxLength: 1.5 }, 'fields.title.maxLength must be a finite non-negative integer'],
    ['reversed text lengths', { kind: 'text', label: 'Title', minLength: 5, maxLength: 4 }, 'fields.title.minLength must be less than or equal to maxLength'],
    ['text lengths on non-text', { kind: 'color', label: 'Color', minLength: 1 }, 'fields.title cannot define minLength or maxLength'],
    ['invalid image scope', { kind: 'image', label: 'Image', scope: 'locale' }, 'fields.title.scope is invalid'],
    ['scope on non-image', { kind: 'text', label: 'Title', scope: 'common' }, 'fields.title.scope is only valid for image fields'],
  ])('rejects %s descriptors', (_name, field, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { title: field },
    })).toEqual({ success: false, error })
  })

  it.each([
    ['required', { required: false }, 'fields.count cannot define required'],
    ['null step', { step: null }, 'fields.count.step must be a finite positive number'],
    ['null control', { control: null }, 'fields.count.control must be "input" or "slider"'],
  ])('rejects number factory parameters with %s', (_name, invalid, error) => {
    const descriptor = field.number({ label: 'Count', defaultValue: 1, ...invalid } as never)

    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { count: descriptor },
      content: { en: { count: 1 } },
    })).toEqual({ success: false, error })
  })

  it('accepts a valid choice descriptor', () => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: {
        alignment: {
          kind: 'choice',
          label: 'Alignment',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
          ],
          defaultValue: 'center',
        },
      },
      content: { en: { alignment: 'center' } },
    }).success).toBe(true)
  })

  it('accepts boolean descriptors and content values', () => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { showLogo: { kind: 'boolean', label: 'Show logo', defaultValue: false } },
      content: { en: { showLogo: true } },
    }).success).toBe(true)
  })

  it('accepts numeric descriptors and content values', () => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { opacity: { kind: 'number', label: 'Opacity', defaultValue: 100, min: 0, max: 100, step: 5, control: 'slider' } },
      content: { en: { opacity: 50 } },
    }).success).toBe(true)
  })

  it.each([
    ['below minimum', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 10, min: 10, max: 20 } }, content: { en: { count: 9 } } }, 'content.en.count must be greater than or equal to min'],
    ['above maximum', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 10, min: 10, max: 20 } }, content: { en: { count: 21 } } }, 'content.en.count must be less than or equal to max'],
    ['outside step', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 10, min: 10, max: 20, step: 2 } }, content: { en: { count: 11 } } }, 'content.en.count must match step'],
    ['outside step at a large magnitude', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 100000000000000.1, step: 0.1 } }, content: { en: { count: 100000000000000.12 } } }, 'content.en.count must match step'],
  ])('rejects numeric content %s', (_name, change, error) => {
    expect(validateTemplateDefinition({ ...validDefinition(), ...change })).toEqual({ success: false, error })
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
    ['string boolean content', { fields: { showLogo: { kind: 'boolean', label: 'Show logo' } }, content: { en: { showLogo: 'true' } } }, 'content.en.showLogo must be a boolean'],
    ['numeric boolean content', { fields: { showLogo: { kind: 'boolean', label: 'Show logo' } }, content: { en: { showLogo: 1 } } }, 'content.en.showLogo must be a boolean'],
    ['string number content', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 1 } }, content: { en: { count: '1' } } }, 'content.en.count must be a number'],
    ['non-finite number content', { fields: { count: { kind: 'number', label: 'Count', defaultValue: 1 } }, content: { en: { count: Infinity } } }, 'content.en.count must be a number'],
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
