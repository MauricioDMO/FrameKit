// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '../index'

import { FrameKitEditor } from './framekit-editor'
import { copyTemplate } from './export-template'
import type { EditorMessages } from './types'

vi.mock('./export-template', () => ({
  copyTemplate: vi.fn(),
  exportTemplate: vi.fn(),
}))

const messages: EditorMessages = {
  templateEditor: 'Editor de plantillas',
  reset: 'Restablecer',
  generating: 'Generando',
  downloadPng: 'Descargar PNG',
  copyPng: 'Copiar PNG',
  content: 'Contenido',
  preview: 'Vista previa',
  actualSize: 'Tamano real',
  fitToView: 'Ajustar a vista',
  contentVariantLabel: 'Variante del contenido',
  exportError: 'Error de exportacion',
  exportAlert: 'No se pudo exportar',
  errorRequired: 'Campo obligatorio',
  errorInvalidNumber: 'Numero invalido',
  errorNumberTooSmall: 'Debe ser al menos {min}',
  errorNumberTooLarge: 'Debe ser como maximo {max}',
  errorTextTooShort: 'Debe tener al menos {minLength} caracteres',
  errorTextTooLong: 'Debe tener como maximo {maxLength} caracteres',
  errorInvalidColor: 'Color hexadecimal invalido',
  imageSelect: 'Subir imagen',
  imageUploading: 'Subiendo',
  imageLoadError: 'No se pudo cargar el asset',
  imageUploadError: 'No se pudo subir el asset',
}

function createDefinition() {
  return defineTemplate({
    meta: { title: 'Editor test' },
    width: 100,
    height: 100,
    fields: {
      title: field.text({ label: 'Title', minLength: 2, maxLength: 20 }),
      optionalText: field.text({ label: 'Optional text', required: false }),
      invalidNumber: field.number({ label: 'Invalid number' }),
      tooSmall: field.number({ label: 'Too small', min: 10 }),
      tooLarge: field.number({ label: 'Too large', max: 20 }),
      accentColor: field.color({ label: 'Accent color', defaultValue: '#123456' }),
      optionalColor: field.color({ label: 'Optional color', required: false }),
    },
    content: { en: { title: 'English title' }, fr: { title: 'French title' } },
    variants: { default: 'en', labels: { en: 'English', fr: 'French' } },
    render: () => null,
  })
}

function renderEditor(sidebarCollapsed = false) {
  return render(<FrameKitEditor slug="social/campaign" definition={createDefinition()} messages={messages} sidebarCollapsed={sidebarCollapsed} />)
}

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

describe('FrameKitEditor controls', () => {
  it('expands the fields column when the studio sidebar is collapsed', () => {
    renderEditor(true)

    const controls = screen.getByRole('heading', { name: messages.content }).closest('aside')
    expect(controls?.parentElement?.className).toContain('xl:grid-cols-[400px_1fr]')
  })

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

  it('renders text fields as textareas with length constraints and literal newlines', () => {
    renderEditor()

    const title = screen.getByRole('textbox', { name: 'Title' })
    expect(title.tagName).toBe('TEXTAREA')
    expect(title.getAttribute('minlength')).toBe('2')
    expect(title.getAttribute('maxlength')).toBe('20')

    fireEvent.change(title, { target: { value: 'First line\nSecond line' } })
    expect((title as HTMLTextAreaElement).value).toBe('First line\nSecond line')
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
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'fr' } })
    expect(screen.queryByText(messages.errorRequired)).toBeNull()
  })

  it('focuses the first control with a validation error', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: '' } } }))
    renderEditor()
    const titleInput = screen.getByRole('textbox', { name: 'Title' })
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(document.activeElement).toBe(titleInput)
  })

  it('translates structured validation errors before displaying them', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Ready', invalidNumber: 'nope', tooSmall: '9', tooLarge: '21', accentColor: 'red' } } }))
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getByText(messages.errorInvalidNumber)).toBeTruthy()
    expect(screen.getByText(messages.errorNumberTooSmall.replace('{min}', '10'))).toBeTruthy()
    expect(screen.getByText(messages.errorNumberTooLarge.replace('{max}', '20'))).toBeTruthy()
    expect(screen.getByText(messages.errorInvalidColor)).toBeTruthy()
  })

  it('translates text length validation errors', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'x' } } }))
    renderEditor()
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(screen.getByText(messages.errorTextTooShort.replace('{minLength}', '2'))).toBeTruthy()
  })

  it('copies a valid template PNG', async () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Ready', invalidNumber: '1', tooSmall: '10', tooLarge: '20', accentColor: '#123456' } } }))
    renderEditor()

    fireEvent.click(screen.getByRole('button', { name: messages.copyPng }))

    await waitFor(() => expect(copyTemplate).toHaveBeenCalledWith(expect.any(HTMLDivElement), 100, 100))
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
