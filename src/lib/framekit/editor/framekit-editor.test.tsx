import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { getMessages } from '@/i18n/messages'
import { defineTemplate, fields } from '@/lib/framekit'

import { FrameKitEditor } from './framekit-editor'

const messages = getMessages('en').editor

function createDefinition() {
  return defineTemplate({
    width: 100,
    height: 100,
    fields: {
      title: fields.text({ label: 'Title' }),
      invalidNumber: fields.number({ label: 'Invalid number' }),
      tooSmall: fields.number({ label: 'Too small', min: 10 }),
      tooLarge: fields.number({ label: 'Too large', max: 20 }),
      website: fields.url({ label: 'Website' }),
    },
    content: { en: { language: 'English', title: 'English title' }, fr: { language: 'French', title: 'French title' } },
    render: () => null,
  })
}

function renderEditor() {
  return render(<FrameKitEditor slug="social/campaign" definition={createDefinition()} messages={messages} />)
}

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('FrameKitEditor controls', () => {
  it('passes numeric descriptor limits to the input', () => {
    renderEditor()
    expect(screen.getByRole('spinbutton', { name: 'Too small' }).getAttribute('min')).toBe('10')
    expect(screen.getByRole('spinbutton', { name: 'Too large' }).getAttribute('max')).toBe('20')
  })

  it('resets only the selected locale without mutating other locale data or errors', async () => {
    localStorage.setItem('framekit:social/campaign:v1', JSON.stringify({ selectedLocale: 'en', dataByLocale: { en: { title: '' }, fr: { title: 'Saved French title' } } }))
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getAllByText(messages.errorRequired)).not.toHaveLength(0)
    fireEvent.click(screen.getByRole('button', { name: messages.reset }))
    expect(screen.queryByText(messages.errorRequired)).toBeNull()
    await waitFor(() => expect(JSON.parse(localStorage.getItem('framekit:social/campaign:v1')!).dataByLocale).toEqual({ fr: { title: 'Saved French title' } }))
  })

  it('clears validation errors when changing locale', () => {
    localStorage.setItem('framekit:social/campaign:v1', JSON.stringify({ selectedLocale: 'en', dataByLocale: { en: { title: '' } } }))
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getAllByText(messages.errorRequired)).not.toHaveLength(0)
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fr' } })
    expect(screen.queryByText(messages.errorRequired)).toBeNull()
  })

  it('focuses the first control with a validation error', () => {
    localStorage.setItem('framekit:social/campaign:v1', JSON.stringify({ selectedLocale: 'en', dataByLocale: { en: { title: '' } } }))
    renderEditor()
    const titleInput = screen.getByRole('textbox', { name: 'Title' })
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(document.activeElement).toBe(titleInput)
  })

  it('translates structured validation errors before displaying them', () => {
    localStorage.setItem('framekit:social/campaign:v1', JSON.stringify({ selectedLocale: 'en', dataByLocale: { en: { title: 'Ready', invalidNumber: 'nope', tooSmall: '9', tooLarge: '21', website: 'ftp://example.test' } } }))
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getByText(messages.errorInvalidNumber)).toBeTruthy()
    expect(screen.getByText(messages.errorNumberTooSmall.replace('{min}', '10'))).toBeTruthy()
    expect(screen.getByText(messages.errorNumberTooLarge.replace('{max}', '20'))).toBeTruthy()
    expect(screen.getByText(messages.errorInvalidUrl)).toBeTruthy()
  })
})
