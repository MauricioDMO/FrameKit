// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { NumberField } from './number-field'

const field = {
  key: 'opacity',
  type: 'number' as const,
  required: true,
  label: 'Opacity',
  min: 0,
  max: 100,
  step: 10,
  control: 'slider' as const,
}
const inputField = { ...field, control: 'input' as const }

afterEach(cleanup)

describe('NumberField slider', () => {
  it('keeps focus and reports controlled range changes', () => {
    const onChange = vi.fn()
    const { rerender } = render(<NumberField field={field} value={50} onChange={onChange} />)

    const slider = screen.getByRole('slider', { name: field.label }) as HTMLInputElement
    slider.focus()
    expect(document.activeElement).toBe(slider)
    expect(slider.className).toContain('focus-visible:ring-3')

    fireEvent.change(slider, { target: { value: '60' } })

    expect(onChange).toHaveBeenCalledExactlyOnceWith(60)

    rerender(<NumberField field={field} value={60} onChange={onChange} />)
    expect(slider.value).toBe('60')
  })

  it('reports validation errors and exposes the external error state', () => {
    const onChange = vi.fn()
    const onValidationError = vi.fn()
    render(<NumberField field={field} value={50} error="Invalid opacity" onChange={onChange} onValidationError={onValidationError} />)

    const slider = screen.getByRole('slider', { name: field.label })
    expect(slider.getAttribute('aria-invalid')).toBe('true')
    expect(slider.getAttribute('aria-describedby')).toBe('opacity-error')

    fireEvent.change(slider, { target: { value: '55' } })

    expect(onValidationError).toHaveBeenCalledExactlyOnceWith({ code: 'invalid_step', step: 10 })
    expect(onChange).not.toHaveBeenCalled()
  })
})

describe('NumberField input', () => {
  it('supports the input control through a controlled cycle', () => {
    const onChange = vi.fn()
    const { rerender } = render(<NumberField field={inputField} value={20} onChange={onChange} />)

    const input = screen.getByRole('spinbutton', { name: inputField.label }) as HTMLInputElement
    expect(input.type).toBe('number')
    expect(input.value).toBe('20')

    fireEvent.change(input, { target: { value: '30' } })

    expect(onChange).toHaveBeenCalledExactlyOnceWith(30)
    expect(input.value).toBe('30')

    rerender(<NumberField field={inputField} value={30} onChange={onChange} />)
    expect(input.value).toBe('30')
  })
})
