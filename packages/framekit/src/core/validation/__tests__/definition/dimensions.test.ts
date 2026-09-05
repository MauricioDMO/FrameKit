import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition } from '@/index'
import { validDefinition } from '@/core/validation/__tests__/fixtures'

describe('validateTemplateDefinition dimensions', () => {
  it.each(['width', 'height'] as const)('rejects decimal %s', (dimension) => {
    const definition = validDefinition()
    definition[dimension] = 100.5

    expect(validateTemplateDefinition(definition)).toEqual({
      success: false,
      error: `${dimension} must be a positive finite integer`
    })
  })
})
