// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { TemplateMetadataDialog } from '@/editor/components/template-metadata-dialog'
import type { EditorMessages } from '@/editor/types'
import type { TemplateMeta } from '@/types'

const messages = {
  metadataLabel: 'Metadata',
  closeLabel: 'Close',
  descriptionLabel: 'Description',
  marketingDescriptionLabel: 'Marketing description',
  tagsLabel: 'Tags'
} as EditorMessages
const meta = {
  title: 'Test template',
  description: 'Functional description',
  marketingDescription: 'Marketing description value',
  tags: ['first', 'second']
}

afterEach(cleanup)

function renderDialog (open: boolean, onClose = vi.fn(), currentMeta: TemplateMeta = meta) {
  return render(<TemplateMetadataDialog open={open} meta={currentMeta} messages={messages} onClose={onClose} />)
}

describe('TemplateMetadataDialog', () => {
  it('renders metadata in order with its accessible relationships', () => {
    renderDialog(true)

    const dialog = screen.getByRole('dialog', { name: meta.title })
    expect(dialog.getAttribute('aria-modal')).toBe('true')
    expect(dialog.getAttribute('aria-labelledby')).toBe('template-metadata-title')
    expect(within(dialog).getByRole('button', { name: messages.closeLabel }).getAttribute('title')).toBe(messages.closeLabel)
    expect(within(dialog).getByText(meta.description)).toBeTruthy()
    expect(within(dialog).getByText(meta.marketingDescription)).toBeTruthy()
    expect(within(dialog).getByRole('list', { name: messages.tagsLabel })).toBeTruthy()
    expect(Array.from(within(dialog).getAllByRole('listitem')).map((item) => item.textContent)).toEqual(meta.tags)
  })

  it('omits optional sections and renders nothing while closed', () => {
    const { rerender } = renderDialog(false, vi.fn(), { title: 'Minimal template' })

    expect(screen.queryByRole('dialog')).toBeNull()
    rerender(<TemplateMetadataDialog open meta={{ title: 'Minimal template' }} messages={messages} onClose={vi.fn()} />)

    const dialog = screen.getByRole('dialog', { name: 'Minimal template' })
    expect(within(dialog).queryByText(messages.descriptionLabel)).toBeNull()
    expect(within(dialog).queryByText(messages.marketingDescriptionLabel)).toBeNull()
    expect(within(dialog).queryByRole('list', { name: messages.tagsLabel })).toBeNull()
  })

  it('focuses the close button, closes through Escape and restores prior focus', () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    const onClose = vi.fn()
    const { rerender } = renderDialog(true, onClose)

    expect(document.activeElement).toBe(screen.getByRole('button', { name: messages.closeLabel }))
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledOnce()

    rerender(<TemplateMetadataDialog open={false} meta={meta} messages={messages} onClose={onClose} />)
    expect(document.activeElement).toBe(trigger)
    onClose.mockClear()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).not.toHaveBeenCalled()
    trigger.remove()
  })

  it('closes from the backdrop and close button but not from inner content', () => {
    const onClose = vi.fn()
    const { container } = renderDialog(true, onClose)
    const backdrop = container.firstElementChild
    const dialog = screen.getByRole('dialog', { name: meta.title })

    fireEvent.click(dialog)
    expect(onClose).not.toHaveBeenCalled()
    fireEvent.click(backdrop!)
    expect(onClose).toHaveBeenCalledOnce()
    fireEvent.click(within(dialog).getByRole('button', { name: messages.closeLabel }))
    expect(onClose).toHaveBeenCalledTimes(2)
  })
})
