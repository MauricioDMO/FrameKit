// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import type { ComponentProps } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { EditorHeader } from '../editor-header'
import type { EditorMessages } from '@/editor/types'

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
  return render(<EditorHeader title="Test template" messages={messages} hasMetadata exporting={false} onOpenMetadata={vi.fn()} onExport={vi.fn()} onCopy={vi.fn()} {...overrides} />)
}

describe('EditorHeader', () => {
  it('renders the title and localized actions', () => {
    renderHeader()

    expect(screen.getByRole('heading', { name: 'Test template' })).toBeTruthy()
    const metadataButton = screen.getByRole('button', { name: messages.metadataLabel })
    expect(metadataButton).toBeTruthy()
    expect(metadataButton.textContent).toBe('')
    expect(metadataButton.getAttribute('title')).toBe(messages.metadataLabel)
    expect(metadataButton.className).not.toContain('border')
    expect(screen.queryByRole('button', { name: messages.reset })).toBeNull()
    expect(screen.getByRole('button', { name: messages.downloadPng })).toBeTruthy()
    const copyButton = screen.getByRole('button', { name: messages.copyPng })
    expect(copyButton).toBeTruthy()
    expect(copyButton.className).toContain('pointer-events-none')
    expect(copyButton.parentElement?.className).toContain('h-0')
    expect(copyButton.parentElement?.className).toContain('absolute')
    expect(copyButton.parentElement?.className).toContain('pointer-events-none')
    expect(copyButton.parentElement?.className).toContain('[interpolate-size:allow-keywords]')
    expect(metadataButton.getAttribute('aria-haspopup')).toBe('dialog')
    expect(metadataButton.getAttribute('aria-controls')).toBe('template-metadata-dialog')
    expect(screen.getAllByRole('button').every((button) => button.getAttribute('type') === 'button')).toBe(true)
  })

  it('forwards the metadata callback', () => {
    const onOpenMetadata = vi.fn()
    renderHeader({ onOpenMetadata })

    fireEvent.click(screen.getByRole('button', { name: messages.metadataLabel }))

    expect(onOpenMetadata).toHaveBeenCalledOnce()
  })

  it('reveals the copy action on the first touch without downloading', () => {
    const onExport = vi.fn()
    const onCopy = vi.fn()
    renderHeader({ hasMetadata: false, onExport, onCopy })

    const downloadButton = screen.getByRole('button', { name: messages.downloadPng })
    fireEvent.pointerDown(downloadButton, { pointerType: 'touch' })
    fireEvent.click(downloadButton)

    expect(onExport).not.toHaveBeenCalled()
    expect(screen.getByRole('button', { name: messages.copyPng }).className).toContain('opacity-100')

    fireEvent.click(screen.getByRole('button', { name: messages.copyPng }))
    expect(onCopy).toHaveBeenCalledOnce()
  })

  it('hides metadata when no metadata exists and forwards callbacks', () => {
    const onOpenMetadata = vi.fn()
    const onExport = vi.fn()
    const onCopy = vi.fn()
    renderHeader({ hasMetadata: false, onOpenMetadata, onExport, onCopy })

    expect(screen.queryByRole('button', { name: messages.metadataLabel })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    fireEvent.click(screen.getByRole('button', { name: messages.copyPng }))

    expect(onOpenMetadata).not.toHaveBeenCalled()
    expect(onExport).toHaveBeenCalledOnce()
    expect(onCopy).toHaveBeenCalledOnce()
  })

  it('disables only export actions while generating', () => {
    renderHeader({ exporting: true })

    expect(screen.getByRole('button', { name: messages.metadataLabel }).hasAttribute('disabled')).toBe(false)
    const generatingButtons = screen.getAllByRole('button', { name: messages.generating })
    expect(generatingButtons).toHaveLength(1)
    expect(generatingButtons.every((button) => (button as HTMLButtonElement).disabled)).toBe(true)
    expect(screen.queryByRole('button', { name: messages.copyPng })).toBeNull()
  })
})
