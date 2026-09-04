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

afterEach(cleanup)

describe('NumberField slider', () => {
  it('keeps focus and native keyboard handling on the range control', () => {
    const onChange = vi.fn()
    render(<NumberField field={field} value={50} onChange={onChange} />)

    const slider = screen.getByRole('slider', { name: field.label })
    const preventDefault = vi.spyOn(Event.prototype, 'preventDefault')
    try {
      slider.focus()
      expect(document.activeElement).toBe(slider)
      expect(slider.className).toContain('focus-visible:ring-3')

      fireEvent.keyDown(slider, { key: 'ArrowRight', code: 'ArrowRight' })

      expect(document.activeElement).toBe(slider)
      expect(preventDefault).not.toHaveBeenCalled()

      // jsdom does not move native ranges from keys; verify the change contract separately.
      fireEvent.change(slider, { target: { value: '60' } })
      expect(onChange).toHaveBeenCalledWith(60)
    } finally {
      preventDefault.mockRestore()
    }
  })
})
