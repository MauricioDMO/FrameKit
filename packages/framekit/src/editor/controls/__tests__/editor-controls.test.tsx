// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '@/index'
import type { EditorMessages } from '@/editor/types'
import { EditorControls } from '../editor-controls'

const messages = {
  content: 'Content',
  variantLabel: 'Variant',
  reset: 'Restore variant',
  imageSelect: 'Select image',
  imageUploading: 'Uploading',
  imageLoadError: 'Image load error',
  colorPickerLabel: 'Choose color'
} as EditorMessages

const definition = defineTemplate({
  meta: { title: 'Controls test' },
  width: 320,
  height: 180,
  fields: { title: field.text({ label: 'Title' }) },
  content: { first: { title: 'First' }, second: { title: 'Second' } },
  variants: { default: 'first', labels: { first: 'First', second: 'Second' } },
  render: () => null
})

afterEach(cleanup)

describe('EditorControls', () => {
  it('places the icon-only restore action beside the variant selector', () => {
    const onReset = vi.fn()
    render(<EditorControls definition={definition} messages={messages} selectedVariant="first" data={{ title: 'Title' }} errors={{}} onVariantChange={vi.fn()} onReset={onReset} onFieldChange={vi.fn()} />)

    const select = screen.getByRole('combobox', { name: messages.variantLabel })
    const reset = screen.getByRole('button', { name: messages.reset })

    expect(select.nextElementSibling).toBe(reset)
    expect(reset.textContent).toBe('')
    expect(reset.getAttribute('title')).toBe(messages.reset)
    fireEvent.click(reset)
    expect(onReset).toHaveBeenCalledOnce()
  })
})
