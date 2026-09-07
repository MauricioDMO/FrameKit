// @vitest-environment jsdom

import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { EditorField } from '@/editor/controls/fields/editor-field'
import { NumberField } from '@/editor/controls/fields/number-field'

import { messages } from './messages'
import { setupFrameKitEditorTests } from './setup'

setupFrameKitEditorTests()

describe('FrameKitEditor fields', () => {
  it('shows the native normalized value for decimal sliders', () => {
    render(<NumberField field={{ key: 'decimal', type: 'number', required: true, label: 'Decimal slider', min: 0, max: 1, step: 0.1, control: 'slider' }} value={0.30000000000000004} onChange={vi.fn()} />)

    expect((screen.getByRole('slider', { name: 'Decimal slider' }) as HTMLInputElement).value).toBe('0.3')
    expect(screen.getByText('0.3')).toBeTruthy()
  })

  it('preserves finite slider values when the range width overflows', () => {
    const value = 5e307
    render(<NumberField field={{ key: 'extreme', type: 'number', required: true, label: 'Extreme slider', min: -Number.MAX_VALUE, max: Number.MAX_VALUE, step: 1, control: 'slider' }} value={value} onChange={vi.fn()} />)

    expect((screen.getByRole('slider', { name: 'Extreme slider' }) as HTMLInputElement).valueAsNumber).toBe(value)
    expect(screen.getByText(String(value))).toBeTruthy()
  })

  it('keeps boolean errors associated with the accessible switch', () => {
    const onChange = vi.fn()
    render(<EditorField field={{ key: 'showLogo', type: 'boolean', required: false, label: 'Show logo' }} value="true" onChange={onChange} error={messages.errorInvalidBoolean} />)

    const switchInput = screen.getByRole('switch', { name: 'Show logo' })
    expect((switchInput as HTMLInputElement).checked).toBe(false)
    expect(switchInput.getAttribute('aria-invalid')).toBe('true')
    expect(switchInput.getAttribute('aria-describedby')).toBe('showLogo-error')
    expect(screen.getByText(messages.errorInvalidBoolean)).toBeTruthy()

    fireEvent.click(switchInput)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('associates text, color, and image errors with their controls', () => {
    render(
      <>
        <EditorField field={{ key: 'title', type: 'text', required: true, label: 'Title' }} value="" onChange={vi.fn()} error={messages.errorRequired} />
        <EditorField field={{ key: 'color', type: 'color', required: true, label: 'Color' }} value="#123456" onChange={vi.fn()} error={messages.errorInvalidColor} colorPickerLabel={messages.colorPickerLabel} />
        <EditorField field={{ key: 'logo', type: 'image', required: true, label: 'Logo' }} value="" onChange={vi.fn()} error={messages.errorRequired} imageLabels={{ select: messages.imageSelect, uploading: messages.imageUploading, loadError: messages.imageLoadError }} onImageUpload={async () => undefined} />
      </>
    )

    expect(screen.getByRole('textbox', { name: 'Title' }).getAttribute('aria-describedby')).toBe('title-error')
    expect(screen.getByRole('textbox', { name: 'Color' }).getAttribute('aria-describedby')).toBe('color-error')
    expect(document.getElementById('color-picker')?.getAttribute('aria-describedby')).toBe('color-error')
    expect(screen.getByLabelText('Logo').getAttribute('aria-describedby')).toBe('logo-error')
    expect(screen.getAllByText(messages.errorRequired)).toHaveLength(2)
  })
})
