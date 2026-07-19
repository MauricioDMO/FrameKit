// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, fields } from '../index'

import { FrameKitEditor } from './framekit-editor'
import type { EditorMessages } from './types'

const messages: EditorMessages = {
  templateEditor: 'Editor de plantillas',
  reset: 'Restablecer',
  generating: 'Generando',
  downloadPng: 'Descargar PNG',
  content: 'Contenido',
  preview: 'Vista previa',
  actualSize: 'Tamano real',
  fitToView: 'Ajustar a vista',
  contentLanguageLabel: 'Idioma del contenido',
  exportError: 'Error de exportacion',
  exportAlert: 'No se pudo exportar',
  errorRequired: 'Campo obligatorio',
  errorInvalidNumber: 'Numero invalido',
  errorNumberTooSmall: 'Debe ser al menos {min}',
  errorNumberTooLarge: 'Debe ser como maximo {max}',
  errorInvalidUrl: 'URL invalida',
  errorInvalidColor: 'Color hexadecimal invalido',
}

function createDefinition() {
  return defineTemplate({
    width: 100,
    height: 100,
    fields: {
      title: fields.text({ label: 'Title' }),
      optionalText: fields.text({ label: 'Optional text', required: false }),
      invalidNumber: fields.number({ label: 'Invalid number' }),
      tooSmall: fields.number({ label: 'Too small', min: 10 }),
      tooLarge: fields.number({ label: 'Too large', max: 20 }),
      website: fields.url({ label: 'Website' }),
      accentColor: fields.color({ label: 'Accent color', defaultValue: '#123456' }),
      optionalColor: fields.color({ label: 'Optional color', required: false }),
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

  it('uses the descriptor required flag for HTML and ARIA controls', () => {
    renderEditor()

    expect(screen.getByRole('textbox', { name: 'Title' }).getAttribute('required')).toBe('')
    expect(screen.getByRole('textbox', { name: 'Title' }).getAttribute('aria-required')).toBe('true')
    expect(screen.getByRole('textbox', { name: 'Optional text' }).getAttribute('required')).toBeNull()
    expect(screen.getByRole('textbox', { name: 'Optional text' }).getAttribute('aria-required')).toBe('false')
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
    localStorage.setItem('framekit:social/campaign:v1', JSON.stringify({ selectedLocale: 'en', dataByLocale: { en: { title: 'Ready', invalidNumber: 'nope', tooSmall: '9', tooLarge: '21', website: 'ftp://example.test', accentColor: 'red' } } }))
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getByText(messages.errorInvalidNumber)).toBeTruthy()
    expect(screen.getByText(messages.errorNumberTooSmall.replace('{min}', '10'))).toBeTruthy()
    expect(screen.getByText(messages.errorNumberTooLarge.replace('{max}', '20'))).toBeTruthy()
    expect(screen.getByText(messages.errorInvalidUrl)).toBeTruthy()
    expect(screen.getByText(messages.errorInvalidColor)).toBeTruthy()
  })

  it('keeps editing when localStorage rejects writes', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    try {
      renderEditor()
      const title = screen.getByRole('textbox', { name: 'Title' })
      fireEvent.change(title, { target: { value: 'Updated' } })
      expect((title as HTMLInputElement).value).toBe('Updated')
    } finally {
      setItem.mockRestore()
    }
  })

  it('keeps editing when localStorage is inaccessible', () => {
    const storageGetter = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('localStorage unavailable', 'SecurityError')
    })

    try {
      renderEditor()
      const title = screen.getByRole('textbox', { name: 'Title' })
      expect((title as HTMLInputElement).value).toBe('English title')
      fireEvent.change(title, { target: { value: 'Updated' } })
      expect((title as HTMLInputElement).value).toBe('Updated')
    } finally {
      storageGetter.mockRestore()
    }
  })
})
