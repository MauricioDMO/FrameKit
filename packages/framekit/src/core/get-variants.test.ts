import { describe, expect, it } from 'vitest'

import { defineTemplate, field, getVariants } from '../index'

describe('getVariants', () => {
  it('returns the content variant keys', () => {
    const definition = defineTemplate({
      meta: { title: 'Variants' },
      width: 100,
      height: 100,
      fields: { title: field.text({ label: 'Title' }) },
      content: { campaign: { title: 'Campaign' }, mobile: { title: 'Mobile' } },
      variants: { default: 'campaign' },
      render: () => null,
    })

    expect(getVariants(definition)).toEqual(['campaign', 'mobile'])
  })
})
