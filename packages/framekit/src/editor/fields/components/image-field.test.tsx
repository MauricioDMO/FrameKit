// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
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
    const { rerender } = render(<ImageField field={field} value="broken-image.png" onChange={vi.fn()} imageLabels={imageLabels} onImageUpload={vi.fn()} />)

    const input = screen.getByLabelText(field.label)
    expect(input.getAttribute('accept')).toBe('image/png,image/jpeg,image/webp,image/gif')
    expect(input.getAttribute('aria-required')).toBe('true')
    expect(input.closest('label')?.className).toContain('has-focus-visible:ring-3')
    input.focus()
    expect(document.activeElement).toBe(input)

    const preview = screen.getByRole('presentation')
    expect(preview.getAttribute('src')).toBe('broken-image.png')
    fireEvent.error(preview)

    expect(document.querySelector('img')).toBeNull()
    expect(screen.getByText(imageLabels.loadError)).toBeTruthy()
    expect(screen.getByRole('alert').id).toBe('logo-image-error')
    expect(input.getAttribute('aria-describedby')).toBe('logo-image-error')

    rerender(<ImageField field={field} value="recovered-image.png" onChange={vi.fn()} imageLabels={imageLabels} onImageUpload={vi.fn()} />)

    expect(screen.getByRole('presentation').getAttribute('src')).toBe('recovered-image.png')
    expect(screen.queryByRole('alert')).toBeNull()
    expect(input.getAttribute('aria-describedby')).toBeNull()
  })

  it('uploads a real file, resets the input, and exposes the pending and resolved states', async () => {
    let resolveUpload!: () => void
    const onImageUpload = vi.fn(() => new Promise<void>((resolve) => {
      resolveUpload = resolve
    }))
    render(<ImageField field={field} value="" onChange={vi.fn()} imageLabels={imageLabels} onImageUpload={onImageUpload} />)

    const input = screen.getByLabelText(field.label) as HTMLInputElement
    const file = new File(['image'], 'logo.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(onImageUpload).toHaveBeenCalledExactlyOnceWith(file)
    expect(input.value).toBe('')
    expect(input.disabled).toBe(true)
    expect(screen.getByText(imageLabels.uploading)).toBeTruthy()

    resolveUpload()
    await waitFor(() => expect(input.disabled).toBe(false))
    expect(screen.getByText(imageLabels.select)).toBeTruthy()
  })

  it('recovers after a rejected upload', async () => {
    const onImageUpload = vi.fn().mockRejectedValue(new Error('upload failed'))
    render(<ImageField field={field} value="" onChange={vi.fn()} imageLabels={imageLabels} onImageUpload={onImageUpload} />)

    const input = screen.getByLabelText(field.label) as HTMLInputElement
    const file = new File(['image'], 'logo.png', { type: 'image/png' })

    fireEvent.change(input, { target: { files: [file] } })

    expect(input.disabled).toBe(true)
    await waitFor(() => expect(input.disabled).toBe(false))
    expect(onImageUpload).toHaveBeenCalledExactlyOnceWith(file)
    expect(input.value).toBe('')
    expect(screen.getByText(imageLabels.select)).toBeTruthy()
  })
})
