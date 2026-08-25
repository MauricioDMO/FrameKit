import * as api from '../index'
import { describe, expect, it } from 'vitest'

describe('field factories', () => {
  it('exports only the singular field namespace and canonical kinds', () => {
    expect(api.field).toEqual({
      text: expect.any(Function),
      color: expect.any(Function),
      number: expect.any(Function),
      image: expect.any(Function),
      choice: expect.any(Function),
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

  it('freezes choice descriptors while preserving option order', () => {
    const sourceOptions = [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ]
    const descriptor = api.field.choice({ label: 'Alignment', options: sourceOptions, defaultValue: 'center' })

    expect(descriptor).toEqual({ kind: 'choice', label: 'Alignment', options: sourceOptions, defaultValue: 'center' })
    expect(descriptor.options.map((option) => option.value)).toEqual(['left', 'center', 'right'])
    expect(Object.isFrozen(descriptor)).toBe(true)
    expect(Object.isFrozen(descriptor.options)).toBe(true)
    expect(Object.isFrozen(descriptor.options[0])).toBe(true)
  })
})
