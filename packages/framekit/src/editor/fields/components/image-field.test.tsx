// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ImageField } from './image-field'

const field = { key: 'logo', type: 'image' as const, required: true, label: 'Logo' }
const imageLabels = {
  select: 'Subir imagen',
  uploading: 'Subiendo',
  loadError: 'No se pudo cargar el asset',
}

afterEach(cleanup)

describe('ImageField', () => {
  it('shows an accessible message when the image fails to render', () => {
    render(<ImageField field={field} value="broken-image.png" onChange={vi.fn()} imageLabels={imageLabels} onImageUpload={vi.fn()} />)

    const input = screen.getByLabelText(field.label)
    expect(input.closest('label')?.className).toContain('has-focus-visible:ring-3')
    input.focus()
    expect(document.activeElement).toBe(input)

    fireEvent.error(screen.getByRole('presentation'))

    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByText(imageLabels.loadError)).toBeTruthy()
    expect(screen.getByRole('alert').id).toBe('logo-image-error')
    expect(input.getAttribute('aria-describedby')).toBe('logo-image-error')
  })
})
