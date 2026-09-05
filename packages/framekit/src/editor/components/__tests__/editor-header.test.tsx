// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EditorHeader } from '../editor-header'
import type { EditorMessages } from '../../types'

const messages = {
  templateEditor: 'Template editor',
  reset: 'Reset',
  metadataLabel: 'Metadata',
  generating: 'Generating',
  downloadPng: 'Download PNG',
  copyPng: 'Copy PNG'
} as EditorMessages

afterEach(cleanup)

function renderHeader (overrides: Partial<ComponentProps<typeof EditorHeader>> = {}) {
  return render(<EditorHeader title="Test template" messages={messages} hasMetadata exporting={false} onOpenMetadata={vi.fn()} onReset={vi.fn()} onExport={vi.fn()} onCopy={vi.fn()} {...overrides} />)
}

describe('EditorHeader', () => {
  it('renders the title and localized actions', () => {
    renderHeader()

    expect(screen.getByRole('heading', { name: 'Test template' })).toBeTruthy()
    expect(screen.getByRole('button', { name: messages.metadataLabel })).toBeTruthy()
    expect(screen.getByRole('button', { name: messages.reset })).toBeTruthy()
    expect(screen.getByRole('button', { name: messages.downloadPng })).toBeTruthy()
    expect(screen.getByRole('button', { name: messages.copyPng })).toBeTruthy()
    expect(screen.getByRole('button', { name: messages.metadataLabel }).getAttribute('aria-haspopup')).toBe('dialog')
    expect(screen.getByRole('button', { name: messages.metadataLabel }).getAttribute('aria-controls')).toBe('template-metadata-dialog')
    expect(screen.getAllByRole('button').every((button) => button.getAttribute('type') === 'button')).toBe(true)
  })

  it('forwards the metadata callback', () => {
    const onOpenMetadata = vi.fn()
    renderHeader({ onOpenMetadata })

    fireEvent.click(screen.getByRole('button', { name: messages.metadataLabel }))

    expect(onOpenMetadata).toHaveBeenCalledOnce()
  })

  it('hides metadata when no metadata exists and forwards callbacks', () => {
    const onOpenMetadata = vi.fn()
    const onReset = vi.fn()
    const onExport = vi.fn()
    const onCopy = vi.fn()
    renderHeader({ hasMetadata: false, onOpenMetadata, onReset, onExport, onCopy })

    expect(screen.queryByRole('button', { name: messages.metadataLabel })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: messages.reset }))
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    fireEvent.click(screen.getByRole('button', { name: messages.copyPng }))

    expect(onOpenMetadata).not.toHaveBeenCalled()
    expect(onReset).toHaveBeenCalledOnce()
    expect(onExport).toHaveBeenCalledOnce()
    expect(onCopy).toHaveBeenCalledOnce()
  })

  it('disables only export actions while generating', () => {
    renderHeader({ exporting: true })

    expect(screen.getByRole('button', { name: messages.reset }).hasAttribute('disabled')).toBe(false)
    expect(screen.getByRole('button', { name: messages.metadataLabel }).hasAttribute('disabled')).toBe(false)
    const generatingButtons = screen.getAllByRole('button', { name: messages.generating })
    expect(generatingButtons).toHaveLength(2)
    expect(generatingButtons.every((button) => (button as HTMLButtonElement).disabled)).toBe(true)
  })
})
