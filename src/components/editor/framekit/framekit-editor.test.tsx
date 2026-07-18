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
      amount: fields.number({ label: 'Amount', min: 10, max: 20 }),
    },
    content: {
      en: { language: 'English', title: 'English title' },
      fr: { language: 'French', title: 'French title' },
    },
    render: () => null,
  })
}

function renderEditor() {
  return render(
    <FrameKitEditor
      slug="social/campaign"
      definition={createDefinition()}
      messages={messages}
    />,
  )
}

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('FrameKitEditor controls', () => {
  it('passes numeric descriptor limits to the input', () => {
    renderEditor()

    const input = screen.getByRole('spinbutton', { name: 'Amount' })
    expect(input.getAttribute('min')).toBe('10')
    expect(input.getAttribute('max')).toBe('20')
  })

  it('resets only the selected locale without mutating other locale data or errors', async () => {
    localStorage.setItem('framekit:social/campaign:v1', JSON.stringify({
      selectedLocale: 'en',
      dataByLocale: {
        en: { title: '' },
        fr: { title: 'Saved French title' },
      },
    }))
    renderEditor()

    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getAllByText(messages.errorRequired)).not.toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: messages.reset }))

    expect(screen.queryByText(messages.errorRequired)).toBeNull()
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem('framekit:social/campaign:v1')!).dataByLocale).toEqual({
        fr: { title: 'Saved French title' },
      })
    })
  })

  it('clears validation errors when changing locale', () => {
    localStorage.setItem('framekit:social/campaign:v1', JSON.stringify({
      selectedLocale: 'en',
      dataByLocale: { en: { title: '' } },
    }))
    renderEditor()

    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getAllByText(messages.errorRequired)).not.toHaveLength(0)

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fr' } })

    expect(screen.queryByText(messages.errorRequired)).toBeNull()
  })

  it('focuses the first control with a validation error', () => {
    localStorage.setItem('framekit:social/campaign:v1', JSON.stringify({
      selectedLocale: 'en',
      dataByLocale: { en: { title: '' } },
    }))
    renderEditor()

    const titleInput = screen.getByRole('textbox', { name: 'Title' })
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))

    expect(document.activeElement).toBe(titleInput)
  })
})
