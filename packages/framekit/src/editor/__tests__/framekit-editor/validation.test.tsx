// @vitest-environment jsdom

import { fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { exportTemplateMock } from './mocks'
import { messages } from './messages'
import { renderEditor } from './fixtures'
import { setupFrameKitEditorTests } from './setup'

setupFrameKitEditorTests()

describe('FrameKitEditor validation', () => {
  it('preserves malformed number errors alongside export validation errors', async () => {
    renderEditor()

    const invalidNumber = screen.getByRole('spinbutton', { name: 'Invalid number' })
    fireEvent.change(invalidNumber, { target: { value: '' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))

    expect(screen.getByText(messages.errorInvalidNumber)).toBeTruthy()
    expect(screen.getByText(messages.errorRequired)).toBeTruthy()
    expect(exportTemplateMock).not.toHaveBeenCalled()
    expect((invalidNumber as HTMLInputElement).value).toBe('')
    expect(screen.getByText('logo-on:1')).toBeTruthy()
    await waitFor(() => expect(JSON.parse(localStorage.getItem('framekit:social/campaign:v2')!).dataByVariant.en).toEqual({ title: '' }))
  })

  it('clears a malformed number draft when resetting the active variant', () => {
    renderEditor()

    const input = screen.getByRole('spinbutton', { name: 'Invalid number' })
    fireEvent.change(input, { target: { value: '' } })
    expect((input as HTMLInputElement).value).toBe('')

    fireEvent.click(screen.getByRole('button', { name: messages.reset }))

    expect((screen.getByRole('spinbutton', { name: 'Invalid number' }) as HTMLInputElement).value).toBe('1')
    expect(screen.queryByText(messages.errorInvalidNumber)).toBeNull()
  })

  it('resets only the selected variant without mutating other variant data or errors', async () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: '' }, fr: { title: 'Saved French title' } } }))
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getAllByText(messages.errorRequired)).not.toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: messages.reset }))
    expect(screen.queryByText(messages.errorRequired)).toBeNull()
    await waitFor(() => expect(JSON.parse(localStorage.getItem('framekit:social/campaign:v2')!).dataByVariant).toEqual({ fr: { title: 'Saved French title' } }))
  })

  it('clears validation errors when changing variant', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: '' } } }))
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getAllByText(messages.errorRequired)).not.toHaveLength(0)
    fireEvent.change(screen.getByRole('combobox', { name: messages.variantLabel }), { target: { value: 'fr' } })
    expect(screen.queryByText(messages.errorRequired)).toBeNull()
  })

  it('focuses the first control with a validation error', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: '' } } }))
    renderEditor()
    const titleInput = screen.getByRole('textbox', { name: 'Title' })
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(document.activeElement).toBe(titleInput)
  })

  it('focuses the visible color control instead of its hidden picker', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Ready', accentColor: 'invalid' } } }))
    renderEditor()

    const colorInput = screen.getByRole('textbox', { name: 'Accent color' })
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))

    expect(document.activeElement).toBe(colorInput)
  })

  it('translates number draft validation errors without replacing committed data', () => {
    renderEditor()

    fireEvent.change(screen.getByRole('spinbutton', { name: 'Invalid number' }), { target: { value: 'nope' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Too small' }), { target: { value: '9' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Too large' }), { target: { value: '21' } })
    fireEvent.change(screen.getByRole('spinbutton', { name: 'Stepped number' }), { target: { value: '3' } })

    expect(screen.getByText(messages.errorInvalidNumber)).toBeTruthy()
    expect(screen.getByText(messages.errorNumberTooSmall.replace('{min}', '10'))).toBeTruthy()
    expect(screen.getByText(messages.errorNumberTooLarge.replace('{max}', '20'))).toBeTruthy()
    expect(screen.getByText(messages.errorInvalidStep.replace('{step}', '2'))).toBeTruthy()
    expect(screen.getByText('logo-on:1')).toBeTruthy()
  })

  it('translates text length validation errors', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'x' } } }))
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getByText(messages.errorTextTooShort.replace('{minLength}', '2'))).toBeTruthy()
  })
})
