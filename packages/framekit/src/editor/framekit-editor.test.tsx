// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '../index'

import { FrameKitEditor } from './framekit-editor'
import { copyTemplate } from './export-template'
import { EditorField } from './fields/editor-field'
import { NumberField } from './fields/components/number-field'
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
  errorInvalidStep: 'Debe respetar el incremento {step}',
  errorTextTooShort: 'Debe tener al menos {minLength} caracteres',
  errorTextTooLong: 'Debe tener como maximo {maxLength} caracteres',
  errorInvalidColor: 'Color hexadecimal invalido',
  errorInvalidChoice: 'Seleccion invalida',
  errorInvalidBoolean: 'Booleano invalido',
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
      invalidNumber: field.number({ label: 'Invalid number', defaultValue: 1 }),
      tooSmall: field.number({ label: 'Too small', defaultValue: 10, min: 10 }),
      tooLarge: field.number({ label: 'Too large', defaultValue: 20, max: 20 }),
      steppedNumber: field.number({ label: 'Stepped number', defaultValue: 4, min: 0, max: 10, step: 2 }),
      sliderNumber: field.number({ label: 'Slider number', defaultValue: 50, min: 0, max: 100, step: 10, control: 'slider' }),
      alignment: field.choice({
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' },
        ],
        defaultValue: 'center',
      }),
      showLogo: field.boolean({ label: 'Show logo', defaultValue: true }),
      accentColor: field.color({ label: 'Accent color', defaultValue: '#123456' }),
      optionalColor: field.color({ label: 'Optional color', required: false }),
    },
    content: { en: { title: 'English title' }, fr: { title: 'French title' } },
    variants: { default: 'en', labels: { en: 'English', fr: 'French' } },
    render({ data }) {
      return <span>{data.showLogo ? 'logo-on' : 'logo-off'}:{data.invalidNumber}</span>
    },
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

  it('keeps malformed input drafts local while committing valid numbers', async () => {
    renderEditor()

    const input = screen.getByRole('spinbutton', { name: 'Invalid number' })
    expect((input as HTMLInputElement).value).toBe('1')
    fireEvent.change(input, { target: { value: '' } })

    expect((input as HTMLInputElement).value).toBe('')
    expect(screen.getByText(messages.errorInvalidNumber)).toBeTruthy()
    expect(screen.getByText('logo-on:1')).toBeTruthy()

    fireEvent.change(input, { target: { value: '2' } })
    expect((input as HTMLInputElement).value).toBe('2')
    expect(screen.queryByText(messages.errorInvalidNumber)).toBeNull()
    await waitFor(() => expect(JSON.parse(localStorage.getItem('framekit:social/campaign:v2')!).dataByVariant.en.invalidNumber).toBe(2))
  })

  it('preserves malformed number errors alongside export validation errors', async () => {
    renderEditor()

    const invalidNumber = screen.getByRole('spinbutton', { name: 'Invalid number' })
    fireEvent.change(invalidNumber, { target: { value: '' } })
    fireEvent.change(screen.getByRole('textbox', { name: 'Title' }), { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))

    expect(screen.getByText(messages.errorInvalidNumber)).toBeTruthy()
    expect(screen.getByText(messages.errorRequired)).toBeTruthy()
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

  it('renders slider numbers with native constraints and a visible value', () => {
    renderEditor()

    const slider = screen.getByRole('slider', { name: 'Slider number' })
    expect(slider.getAttribute('min')).toBe('0')
    expect(slider.getAttribute('max')).toBe('100')
    expect(slider.getAttribute('step')).toBe('10')
    expect(screen.getByText('50')).toBeTruthy()

    fireEvent.change(slider, { target: { value: '70' } })

    expect((slider as HTMLInputElement).value).toBe('70')
    expect(screen.getByText('70')).toBeTruthy()
  })

  it('shows the native normalized value for decimal sliders', () => {
    render(<NumberField field={{ key: 'decimal', type: 'number', required: true, label: 'Decimal slider', min: 0, max: 1, step: 0.1, control: 'slider' }} value={0.30000000000000004} onChange={vi.fn()} />)

    expect((screen.getByRole('slider', { name: 'Decimal slider' }) as HTMLInputElement).value).toBe('0.3')
    expect(screen.getByText('0.3')).toBeTruthy()
  })

  it('preserves finite slider values when the range width overflows', () => {
    const value = 5e307
    render(<NumberField field={{ key: 'extreme', type: 'number', required: true, label: 'Extreme slider', min: -Number.MAX_VALUE, max: Number.MAX_VALUE, step: 1, control: 'slider' }} value={value} onChange={vi.fn()} />)

    expect((screen.getByRole('slider', { name: 'Extreme slider' }) as HTMLInputElement).valueAsNumber).toBe(value)
    expect(screen.getByText(String(value))).toBeTruthy()
  })

  it('renders choice fields as ordered native selects without required behavior', () => {
    renderEditor()

    const alignment = screen.getByRole('combobox', { name: 'Alignment' })
    expect(alignment.tagName).toBe('SELECT')
    expect(Array.from((alignment as HTMLSelectElement).options).map((option) => [option.value, option.textContent])).toEqual([
      ['left', 'Left'],
      ['center', 'Center'],
      ['right', 'Right'],
    ])
    expect((alignment as HTMLSelectElement).value).toBe('center')
    expect(alignment.getAttribute('required')).toBeNull()

    fireEvent.change(alignment, { target: { value: 'right' } })
    expect((alignment as HTMLSelectElement).value).toBe('right')
  })

  it('renders boolean fields as switches and persists real booleans', async () => {
    renderEditor()

    const switchInput = screen.getByRole('switch', { name: 'Show logo' })
    expect(switchInput.tagName).toBe('INPUT')
    expect((switchInput as HTMLInputElement).type).toBe('checkbox')
    expect((switchInput as HTMLInputElement).checked).toBe(true)
    expect(switchInput.className).toContain('sr-only')
    expect(screen.getByText('logo-on:1')).toBeTruthy()

    switchInput.focus()
    expect(document.activeElement).toBe(switchInput)

    fireEvent.click(switchInput)

    expect((switchInput as HTMLInputElement).checked).toBe(false)
    expect(screen.getByText('logo-off:1')).toBeTruthy()
    await waitFor(() => expect(JSON.parse(localStorage.getItem('framekit:social/campaign:v2')!).dataByVariant.en.showLogo).toBe(false))
  })

  it('keeps boolean errors associated with the accessible switch', () => {
    const onChange = vi.fn()
    render(<EditorField field={{ key: 'showLogo', type: 'boolean', required: false, label: 'Show logo' }} value="true" onChange={onChange} error={messages.errorInvalidBoolean} />)

    const switchInput = screen.getByRole('switch', { name: 'Show logo' })
    expect((switchInput as HTMLInputElement).checked).toBe(false)
    expect(switchInput.getAttribute('aria-invalid')).toBe('true')
    expect(switchInput.getAttribute('aria-describedby')).toBe('showLogo-error')
    expect(screen.getByText(messages.errorInvalidBoolean)).toBeTruthy()

    fireEvent.click(switchInput)
    expect(onChange).toHaveBeenCalledWith(true)
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
    fireEvent.change(screen.getAllByRole('combobox')[0], { target: { value: 'fr' } })
    expect(screen.queryByText(messages.errorRequired)).toBeNull()
  })

  it('focuses the first control with a validation error', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: '' } } }))
    renderEditor()
    const titleInput = screen.getByRole('textbox', { name: 'Title' })
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    expect(document.activeElement).toBe(titleInput)
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

  it('renders accessible choice errors without selecting a recovery option', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Ready', invalidNumber: 1, tooSmall: 10, tooLarge: 20, steppedNumber: 4, sliderNumber: 50, alignment: 'unknown', accentColor: '#123456' } } }))
    renderEditor()

    const alignment = screen.getByRole('combobox', { name: 'Alignment' })
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))

    expect(screen.getByText(messages.errorInvalidChoice)).toBeTruthy()
    expect(alignment.getAttribute('aria-invalid')).toBe('true')
    expect(alignment.getAttribute('aria-describedby')).toBe('alignment-error')
    expect((alignment as HTMLSelectElement).value).toBe('unknown')
  })

  it('copies a valid template PNG', async () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Ready', invalidNumber: 1, tooSmall: 10, tooLarge: 20, steppedNumber: 4, sliderNumber: 50, accentColor: '#123456' } } }))
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
