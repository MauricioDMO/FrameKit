import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition image fields', () => {
  it.each([
    ['invalid image scope', { kind: 'image', label: 'Image', scope: 'locale' }, 'fields.title.scope is invalid'],
    ['limits on image', { kind: 'image', label: 'Image', min: 0 }, 'fields.title cannot define min or max'],
    ['max on image', { kind: 'image', label: 'Image', max: 100 }, 'fields.title cannot define min or max'],
    ['scope on non-image', { kind: 'text', label: 'Title', scope: 'common' }, 'fields.title.scope is only valid for image fields']
  ])('rejects %s', (_name, field, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      fields: { title: field }
    })).toEqual({ success: false, error })
  })
})
