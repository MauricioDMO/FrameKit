// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ColorField } from './color-field'

const field = { key: 'accentColor', type: 'color' as const, required: true, label: 'Accent color' }
const optionalField = { ...field, required: false }

afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

function getPicker() {
  return document.getElementById('accentColor-picker') as HTMLInputElement
}

function getPickerLabel() {
  return getPicker().nextElementSibling as HTMLLabelElement
}

describe('ColorField', () => {
  it('renders valid colors and completes a controlled text update', () => {
    const onChange = vi.fn()
    const { rerender } = render(<ColorField field={field} value="#123abc" onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: field.label }) as HTMLInputElement
    expect(input.value).toBe('123abc')
    expect(getPicker().value).toBe('#123abc')
    expect(getPicker().className).toContain('peer')
    expect(getPickerLabel().className).toContain('peer-focus-visible:ring-3')
    expect(getPickerLabel().className).toContain('peer-focus-visible:outline-none')
    expect(input.checkValidity()).toBe(true)

    fireEvent.change(input, { target: { value: 'abcdef' } })

    expect(onChange).toHaveBeenCalledExactlyOnceWith('#abcdef')

    rerender(<ColorField field={field} value="#abcdef" onChange={onChange} />)
    expect(input.value).toBe('abcdef')
    expect(getPicker().value).toBe('#abcdef')
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

  it('keeps a required empty value invalid until it is provided', () => {
    const onChange = vi.fn()
    const { rerender } = render(<ColorField field={field} value="#123abc" onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: field.label }) as HTMLInputElement
    expect(input.required).toBe(true)
    expect(input.getAttribute('aria-required')).toBe('true')

    fireEvent.change(input, { target: { value: '' } })

    expect(onChange).toHaveBeenCalledExactlyOnceWith('')

    rerender(<ColorField field={field} value="" onChange={onChange} />)
    expect(input.value).toBe('')
    expect(input.checkValidity()).toBe(false)
    expect(getPicker().value).toBe('#000000')
  })

  it('preserves invalid values for browser validation and exposes errors', () => {
    const onChange = vi.fn()
    render(<ColorField field={field} value="#12xz" error="Invalid color" onChange={onChange} />)

    const input = screen.getByRole('textbox', { name: field.label }) as HTMLInputElement
    expect(input.value).toBe('12xz')
    expect(input.getAttribute('pattern')).toBe('[\\da-fA-F]{6}')
    expect(input.checkValidity()).toBe(false)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('accentColor-error')
    expect(getPicker().value).toBe('#000000')
    expect(onChange).not.toHaveBeenCalled()
  })

  it('exposes an accessible picker and keeps it focusable', () => {
    render(<ColorField field={field} value="#123abc" onChange={vi.fn()} colorPickerLabel="Choose color" />)

    expect(screen.getByLabelText('Choose color: Accent color')).toBe(getPickerLabel())
    const picker = getPicker()
    picker.focus()

    expect(document.activeElement).toBe(picker)
    expect(getPickerLabel().getAttribute('for')).toBe('accentColor-picker')
  })

  it('commits the latest picker value after its timer', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<ColorField field={field} value="#123abc" onChange={onChange} />)

    const picker = getPicker()
    fireEvent.change(picker, { target: { value: '#abcdef' } })
    fireEvent.change(picker, { target: { value: '#fedcba' } })

    expect(picker.value).toBe('#fedcba')
    expect(onChange).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(31))
    expect(onChange).not.toHaveBeenCalled()

    act(() => vi.advanceTimersByTime(1))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('#fedcba')
  })

  it('cancels a pending picker update when the text input changes', () => {
    vi.useFakeTimers()
    const onChange = vi.fn()
    render(<ColorField field={field} value="#123abc" onChange={onChange} />)

    fireEvent.change(getPicker(), { target: { value: '#abcdef' } })
    fireEvent.change(screen.getByRole('textbox', { name: field.label }), { target: { value: 'fedcba' } })

    expect(onChange).toHaveBeenCalledExactlyOnceWith('#fedcba')

    act(() => vi.advanceTimersByTime(32))
    expect(onChange).toHaveBeenCalledExactlyOnceWith('#fedcba')
  })
})
