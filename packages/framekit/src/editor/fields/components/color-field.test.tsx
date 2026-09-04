// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ColorField } from './color-field'

const field = { key: 'accentColor', type: 'color' as const, required: true, label: 'Accent color' }
const optionalField = { ...field, required: false }

afterEach(cleanup)

function getPicker() {
  return document.getElementById('accentColor-picker') as HTMLInputElement
}

function getPickerLabel() {
  return getPicker().nextElementSibling as HTMLLabelElement
}

describe('ColorField', () => {
  it('renders valid colors and prefixes non-empty hex input', () => {
    const onChange = vi.fn()
    render(<ColorField field={field} value="#123abc" onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: field.label }) as HTMLInputElement
    expect(input.value).toBe('123abc')
    expect(getPicker().value).toBe('#123abc')
    expect(getPicker().className).toContain('peer')
    expect(getPickerLabel().className).toContain('peer-focus-visible:ring-3')
    expect(getPickerLabel().className).toContain('peer-focus-visible:outline-none')
    expect(input.checkValidity()).toBe(true)

    fireEvent.change(input, { target: { value: 'abcdef' } })

    expect(onChange).toHaveBeenCalledWith('#abcdef')
  })

  it('clears an optional color with an empty string', () => {
    const onChange = vi.fn()
    render(<ColorField field={optionalField} value="#123abc" onChange={onChange} />)

    fireEvent.change(screen.getByRole('textbox', { name: field.label }), { target: { value: '' } })

    expect(onChange).toHaveBeenCalledExactlyOnceWith('')
  })

  it('keeps an empty value while showing the picker fallback visually', () => {
    const onChange = vi.fn()
    render(<ColorField field={optionalField} value="" onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: field.label }) as HTMLInputElement
    expect(input.value).toBe('')
    expect(input.checkValidity()).toBe(true)
    expect(getPicker().value).toBe('#000000')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('preserves invalid values for the existing native validation', () => {
    const onChange = vi.fn()
    render(<ColorField field={field} value="#12xz" onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: field.label }) as HTMLInputElement
    expect(input.value).toBe('12xz')
    expect(input.getAttribute('pattern')).toBe('[\\da-fA-F]{6}')
    expect(input.checkValidity()).toBe(false)
    expect(getPicker().value).toBe('#000000')
    expect(onChange).not.toHaveBeenCalled()
  })
})
