// @vitest-environment jsdom

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '@/index'

import { copyTemplateMock, ExportValidationErrorMock, exportTemplateMock } from './mocks'
import { renderDefinition, renderEditor } from './fixtures'
import { messages } from './messages'
import { setupFrameKitEditorTests } from './setup'

setupFrameKitEditorTests()

describe('FrameKitEditor export', () => {
  it('does not pass a bare hash when clearing an optional color', async () => {
    const definition = defineTemplate({
      meta: { title: 'Optional color editor test' },
      width: 100,
      height: 100,
      fields: { accentColor: field.color({ label: 'Accent color', required: false }) },
      content: { en: { accentColor: '#abcdef' } },
      variants: { default: 'en' },
      render: () => null
    })
    const renderer = vi.spyOn(definition, 'render')

    renderDefinition(definition)
    const input = screen.getByRole('textbox', { name: 'Accent color' })
    expect((input as HTMLInputElement).value).toBe('abcdef')

    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => expect(renderer).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({ accentColor: '' })
    })))
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    await waitFor(() => {
      expect(exportTemplateMock).toHaveBeenCalledWith('social/campaign', 'en', { accentColor: '' })
      expect(screen.getByText(messages.exportSuccess, { exact: true })).toBeTruthy()
    })
  })

  it('copies a valid template PNG', async () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Ready', invalidNumber: 1, tooSmall: 10, tooLarge: 20, steppedNumber: 4, sliderNumber: 50, accentColor: '#123456' } } }))
    renderEditor()

    fireEvent.click(screen.getByRole('button', { name: messages.copyPng }))

    await waitFor(() => {
      expect(copyTemplateMock).toHaveBeenCalledWith('social/campaign', 'en', expect.objectContaining({ title: 'Ready', accentColor: '#123456' }))
      expect(screen.getByText(messages.copySuccess, { exact: true })).toBeTruthy()
    })
  })

  it('shows generating and ignores a second export click while export is pending', async () => {
    let resolvePending!: () => void
    const pending = new Promise<void>((resolve) => {
      resolvePending = resolve
    })
    exportTemplateMock.mockImplementationOnce(() => pending)
    renderEditor()

    const button = screen.getByRole('button', { name: messages.downloadPng }) as HTMLButtonElement
    fireEvent.click(button)

    expect(button.disabled).toBe(true)
    expect(button.textContent).toContain(messages.generating)
    expect(screen.queryByRole('button', { name: messages.copyPng })).toBeNull()
    expect(exportTemplateMock).toHaveBeenCalledWith('social/campaign', 'en', {})

    fireEvent.click(button)
    expect(exportTemplateMock).toHaveBeenCalledTimes(1)

    resolvePending()
    await waitFor(() => {
      expect(button.disabled).toBe(false)
      expect(button.textContent).toContain(messages.downloadPng)
    })
  })

  it('merges structured server validation errors and focuses the first field', async () => {
    copyTemplateMock.mockRejectedValueOnce(new ExportValidationErrorMock({ title: { code: 'required' } }))
    renderEditor()

    fireEvent.click(screen.getByRole('button', { name: messages.copyPng }))

    await waitFor(() => {
      expect(screen.getByText(messages.errorRequired, { exact: true })).toBeTruthy()
      expect(document.activeElement).toBe(screen.getByRole('textbox', { name: 'Title' }))
    })
  })

  it.each([
    ['download', messages.downloadPng, 'export'],
    ['copy', messages.copyPng, 'copy']
  ] as const)('shows the localized error toast when %s fails', async (_action, buttonName, actionName) => {
    const failure = new Error('private export failure')
    if (actionName === 'export') {
      exportTemplateMock.mockRejectedValueOnce(failure)
    } else {
      copyTemplateMock.mockRejectedValueOnce(failure)
    }

    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      renderEditor()
      fireEvent.click(screen.getByRole('button', { name: buttonName }))

      await waitFor(() => expect(screen.getByText(messages.exportAlert, { exact: true })).toBeTruthy())
      expect(alert).not.toHaveBeenCalled()
      expect(consoleError).toHaveBeenCalledWith(messages.exportError, failure)
    } finally {
      alert.mockRestore()
      consoleError.mockRestore()
    }
  })
})
