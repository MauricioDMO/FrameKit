import * as api from '../index'
import { describe, expect, it } from 'vitest'

describe('field factories', () => {
  it('exports only the singular field namespace and canonical kinds', () => {
    expect(Object.keys(api.field).sort()).toEqual(['boolean', 'choice', 'color', 'image', 'number', 'text'])
    expect(api.field.text).toEqual(expect.any(Function))
    expect(api.field.color).toEqual(expect.any(Function))
    expect(api.field.number).toEqual(expect.any(Function))
    expect(api.field.image).toEqual(expect.any(Function))
    expect(api.field.choice).toEqual(expect.any(Function))
    expect(api.field.boolean).toEqual(expect.any(Function))
    expect(api).not.toHaveProperty('fields')
    expect(api.field).not.toHaveProperty('textarea')
  })

  it('creates frozen text descriptors with every supported option', () => {
    const descriptor = api.field.text({
      label: 'Title',
      placeholder: 'Write a title',
      required: false,
      defaultValue: 'Default title',
      minLength: 1,
      maxLength: 80,
    })

    expect(descriptor).toEqual({
      kind: 'text',
      label: 'Title',
      placeholder: 'Write a title',
      required: false,
      defaultValue: 'Default title',
      minLength: 1,
      maxLength: 80,
    })
    expect(Object.isFrozen(descriptor)).toBe(true)
  })

  it('creates frozen color descriptors with every supported option', () => {
    const descriptor = api.field.color({
      label: 'Accent color',
      placeholder: '#000000',
      required: false,
      defaultValue: '#AABBCC',
    })

    expect(descriptor).toEqual({
      kind: 'color',
      label: 'Accent color',
      placeholder: '#000000',
      required: false,
      defaultValue: '#AABBCC',
    })
    expect(Object.isFrozen(descriptor)).toBe(true)
  })

  it('creates frozen image descriptors with every supported option', () => {
    const descriptor = api.field.image({
      label: 'Hero image',
      placeholder: 'Upload a hero image',
      required: false,
      defaultValue: '/assets/images/hero.webp',
      scope: 'variant',
    })

    expect(descriptor).toEqual({
      kind: 'image',
      label: 'Hero image',
      placeholder: 'Upload a hero image',
      required: false,
      defaultValue: '/assets/images/hero.webp',
      scope: 'variant',
    })
    expect(Object.isFrozen(descriptor)).toBe(true)
  })

  it('defaults numeric descriptors to an input with unit steps', () => {
    const input = api.field.number({ label: 'Opacity', defaultValue: 100 })

    expect(input).toEqual({ kind: 'number', label: 'Opacity', placeholder: undefined, defaultValue: 100, min: undefined, max: undefined, step: 1, control: 'input' })
    expect(Object.isFrozen(input)).toBe(true)
  })

  it('preserves numeric options and an explicit slider control', () => {
    const descriptor = api.field.number({
      label: 'Offset',
      placeholder: 'Enter an offset',
      defaultValue: -50,
      min: -100,
      max: 100,
      step: 5,
      control: 'slider',
    })

    expect(descriptor).toEqual({
      kind: 'number',
      label: 'Offset',
      placeholder: 'Enter an offset',
      defaultValue: -50,
      min: -100,
      max: 100,
      step: 5,
      control: 'slider',
    })
    expect(Object.isFrozen(descriptor)).toBe(true)
  })

  it('freezes choice descriptors without aliasing source options', () => {
    const sourceOptions = [
      { value: 'left', label: 'Left' },
      { value: 'center', label: 'Center' },
      { value: 'right', label: 'Right' },
    ]
    const descriptor = api.field.choice({ label: 'Alignment', options: sourceOptions, defaultValue: 'center' })

    expect(descriptor).toEqual({ kind: 'choice', label: 'Alignment', options: sourceOptions, defaultValue: 'center' })
    expect(descriptor.options.map((option) => option.value)).toEqual(['left', 'center', 'right'])
    expect(descriptor.options).not.toBe(sourceOptions)
    expect(descriptor.options[0]).not.toBe(sourceOptions[0])
    expect(Object.isFrozen(descriptor)).toBe(true)
    expect(Object.isFrozen(descriptor.options)).toBe(true)
    expect(descriptor.options.every((option) => Object.isFrozen(option))).toBe(true)

    sourceOptions[0].label = 'Changed'
    expect(descriptor.options[0].label).toBe('Left')
  })

  it('defaults boolean descriptors to false', () => {
    const descriptor = api.field.boolean({ label: 'Show logo' })

    expect(descriptor).toEqual({ kind: 'boolean', label: 'Show logo', defaultValue: false })
    expect(Object.isFrozen(descriptor)).toBe(true)
  })

  it('preserves an explicit true boolean default', () => {
    const descriptor = api.field.boolean({ label: 'Show logo', defaultValue: true })

    expect(descriptor).toEqual({ kind: 'boolean', label: 'Show logo', defaultValue: true })
    expect(Object.isFrozen(descriptor)).toBe(true)
  })

  it('preserves an explicit false boolean default', () => {
    const descriptor = api.field.boolean({ label: 'Show logo', defaultValue: false })

    expect(descriptor).toEqual({ kind: 'boolean', label: 'Show logo', defaultValue: false })
    expect(Object.isFrozen(descriptor)).toBe(true)
  })

  it('does not coerce an invalid runtime default', () => {
    const descriptor = api.field.boolean({ label: 'Show logo', defaultValue: null as unknown as boolean })

    expect(descriptor.defaultValue).toBeNull()
  })
})
