import * as api from '../index'
import { describe, expect, it } from 'vitest'

describe('field factories', () => {
  it('exports only the singular field namespace and canonical kinds', () => {
    expect(api.field).toEqual({
      text: expect.any(Function),
      color: expect.any(Function),
      number: expect.any(Function),
      image: expect.any(Function),
    })
    expect(api).not.toHaveProperty('fields')
    expect(api.field).not.toHaveProperty('textarea')
  })

  it('creates text descriptors with length constraints', () => {
    expect(api.field.text({ label: 'Title', minLength: 1, maxLength: 80 })).toMatchObject({
      kind: 'text',
      minLength: 1,
      maxLength: 80,
    })
  })
})
