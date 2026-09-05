import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition metadata', () => {
  it('accepts optional metadata', () => {
    const definition = {
      ...validDefinition(),
      meta: {
        title: 'Social card',
        description: 'A card for social posts',
        marketingDescription: 'Present an offer and motivate an action',
        tags: ['social', 'promotion']
      }
    }

    expect(validateTemplateDefinition(definition)).toEqual({ success: true, definition })
  })

  it.each([
    ['description', { description: 1 }, 'meta.description must be a string'],
    ['marketingDescription', { marketingDescription: 1 }, 'meta.marketingDescription must be a string'],
    ['tags', { tags: 'social' }, 'meta.tags must be an array of strings'],
    ['tag value', { tags: ['social', 1] }, 'meta.tags must be an array of strings']
  ])('rejects invalid metadata %s', (_name, change, error) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      meta: { ...validDefinition().meta, ...change }
    })).toEqual({ success: false, error })
  })

  it.each(['revision', 'status', 'keywords', 'order'])('rejects unsupported metadata property %s', (key) => {
    expect(validateTemplateDefinition({
      ...validDefinition(),
      meta: { ...validDefinition().meta, [key]: 'unsupported' }
    })).toEqual({ success: false, error: `meta contains unknown property "${key}"` })
  })
})
