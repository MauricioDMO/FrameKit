import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition fields', () => {
  it.each([
    ['non-plain fields', [], 'fields must be a plain object'],
    ['null fields', null, 'fields must be a plain object']
  ])('rejects %s', (_name, fields, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields
    })).toEqual({ success: false, error })
  })

  it('accepts empty fields', () => {
    const definition = {
      ...validDefinition(),
      fields: {},
      content: { en: {} }
    }

    expect(validateTemplateDefinition(definition)).toEqual({ success: true, definition })
  })

  it('accepts a language text field with matching content', () => {
    const definition = {
      ...validDefinition(),
      fields: { language: { kind: 'text', label: 'Language' } },
      content: { en: { language: 'English' } }
    }

    expect(validateTemplateDefinition(definition)).toEqual({ success: true, definition })
  })

  it.each([
    ['non-object descriptor', null, 'fields.title must be a plain object'],
    ['array descriptor', [], 'fields.title must be a plain object'],
    ['unknown kind', { kind: 'date', label: 'Title' }, 'fields.title.kind is invalid'],
    ['removed textarea kind', { kind: 'textarea', label: 'Title' }, 'fields.title.kind is invalid'],
    ['empty label', { kind: 'text', label: '  ' }, 'fields.title.label must be a non-empty string'],
    ['invalid placeholder', { kind: 'text', label: 'Title', placeholder: 1 }, 'fields.title.placeholder must be a string']
  ])('rejects %s descriptors', (_name, field, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { title: field }
    })).toEqual({ success: false, error })
  })

  it('accepts string content values', () => {
    const definition = {
      ...validDefinition(),
      fields: {
        title: { kind: 'text', label: 'Title' },
        color: { kind: 'color', label: 'Color' },
        image: { kind: 'image', label: 'Image', scope: 'variant' },
        alignment: {
          kind: 'choice',
          label: 'Alignment',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' }
          ],
          defaultValue: 'center'
        }
      },
      content: { en: { title: 'Hello', color: '#ffffff', image: 'logo.png', alignment: 'center' } }
    }

    expect(validateTemplateDefinition(definition)).toEqual({ success: true, definition })
  })
})
