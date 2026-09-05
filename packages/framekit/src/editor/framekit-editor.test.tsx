// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '../index'

import { FrameKitEditor } from './framekit-editor'
import { copyTemplate, exportTemplate } from './export-template'
import { EditorField } from './fields/editor-field'
import { NumberField } from './fields/components/number-field'
import type { EditorMessages } from './types'
import type { TemplateDefinition, TemplateRegistryEntry } from '../types'

vi.mock('./export-template', () => ({
  copyTemplate: vi.fn().mockResolvedValue(undefined),
  exportTemplate: vi.fn().mockResolvedValue(undefined),
}))

const messages: EditorMessages = {
  templateEditor: 'Editor de plantillas',
  reset: 'Restablecer',
  metadataLabel: 'Metadata',
  closeLabel: 'Cerrar',
  generating: 'Generando',
  downloadPng: 'Descargar PNG',
  copyPng: 'Copiar PNG',
  content: 'Contenido',
  preview: 'Vista previa',
  actualSize: 'Tamano real',
  fitToView: 'Ajustar a vista',
  variantLabel: 'Variante',
  descriptionLabel: 'Descripción funcional',
  marketingDescriptionLabel: 'Objetivo de marketing',
  tagsLabel: 'Tags',
  colorPickerLabel: 'Seleccionar color',
  exportError: 'Error de exportacion',
  exportAlert: 'No se pudo exportar',
  dataError: 'Error de datos de plantilla',
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
     meta: {
       title: 'Editor test',
       tags: ['framekit', 'introducción', 'react'],
       description: 'Una introducción visual a FrameKit y su flujo de trabajo.',
       marketingDescription: 'Explicar cómo FrameKit convierte plantillas React en contenido visual reutilizable.',
     },
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
    variants: { default: 'en', labels: { en: 'English' } },
    render({ data }) {
      return <span>{data.showLogo ? 'logo-on' : 'logo-off'}:{data.invalidNumber}</span>
    },
  })
}

function createTemplate(definition: TemplateDefinition, meta = definition.meta): TemplateRegistryEntry {
  return {
    slug: 'social/campaign',
    segments: ['social', 'campaign'],
    meta,
    width: definition.width,
    height: definition.height,
    variants: definition.variants,
    variantKeys: Object.keys(definition.content),
    assets: { common: {}, variants: {} },
    load: async () => ({ default: definition }),
  }
}

function renderEditor(sidebarCollapsed = false) {
  const definition = createDefinition()
  return render(<FrameKitEditor template={createTemplate(definition)} definition={definition} messages={messages} sidebarCollapsed={sidebarCollapsed} />)
}

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.clearAllMocks()
})

describe('FrameKitEditor controls', () => {
  it('shows the localized data error when template data cannot be resolved', () => {
    const definition = createDefinition()
    const brokenDefinition = { ...definition, variants: { ...definition.variants, default: 'missing' } } as TemplateDefinition

    render(<FrameKitEditor template={createTemplate(brokenDefinition)} definition={brokenDefinition} messages={messages} />)

    expect(screen.getByRole('alert').textContent).toBe(messages.dataError)
  })

  it('shows template metadata in a modal and closes it', () => {
    renderEditor()

    expect(screen.queryByRole('dialog')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: messages.metadataLabel }))

    const dialog = screen.getByRole('dialog', { name: 'Editor test' })
    expect(within(dialog).getByText('framekit')).toBeTruthy()
    expect(within(dialog).getByText('introducción')).toBeTruthy()
    expect(within(dialog).getByText('react')).toBeTruthy()
    expect(within(dialog).getByText('Una introducción visual a FrameKit y su flujo de trabajo.')).toBeTruthy()
    expect(within(dialog).getByText('Explicar cómo FrameKit convierte plantillas React en contenido visual reutilizable.')).toBeTruthy()

    fireEvent.click(within(dialog).getByRole('button', { name: messages.closeLabel }))
    expect(screen.queryByRole('dialog')).toBeNull()
  })

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

  it('uses generic variant wording and falls back to the variant key', () => {
    renderEditor()

    const selector = screen.getByRole('combobox', { name: messages.variantLabel })
    expect(screen.getByText(messages.variantLabel)).toBeTruthy()
    expect(Array.from((selector as HTMLSelectElement).options).map((option) => [option.value, option.textContent])).toEqual([
      ['en', 'English'],
      ['fr', 'fr'],
    ])
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
    expect(exportTemplate).not.toHaveBeenCalled()
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

  it('renders slider numbers with native constraints and a visible value', async () => {
    renderEditor()

    const slider = screen.getByRole('slider', { name: 'Slider number' })
    expect(slider.getAttribute('min')).toBe('0')
    expect(slider.getAttribute('max')).toBe('100')
    expect(slider.getAttribute('step')).toBe('10')
    expect(screen.getByText('50')).toBeTruthy()

    fireEvent.change(slider, { target: { value: '70' } })

    expect((slider as HTMLInputElement).value).toBe('70')
    expect(screen.getByText('70')).toBeTruthy()
    await waitFor(() => expect(JSON.parse(localStorage.getItem('framekit:social/campaign:v2')!).dataByVariant.en.sliderNumber).toBe(70))
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

  it('renders choice fields as ordered native selects without required behavior', async () => {
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
    await waitFor(() => expect(JSON.parse(localStorage.getItem('framekit:social/campaign:v2')!).dataByVariant.en.alignment).toBe('right'))
  })

  it('does not pass a bare hash when clearing an optional color', async () => {
    const definition = defineTemplate({
      meta: { title: 'Optional color editor test' },
      width: 100,
      height: 100,
      fields: { accentColor: field.color({ label: 'Accent color', required: false }) },
      content: { en: { accentColor: '#abcdef' } },
      variants: { default: 'en' },
      render: () => null,
    })
    const renderer = vi.spyOn(definition, 'render')

    render(<FrameKitEditor template={createTemplate(definition)} definition={definition} messages={messages} />)
    const input = screen.getByRole('textbox', { name: 'Accent color' })
    expect((input as HTMLInputElement).value).toBe('abcdef')

    fireEvent.change(input, { target: { value: '' } })

    await waitFor(() => expect(renderer).toHaveBeenLastCalledWith(expect.objectContaining({
      data: expect.objectContaining({ accentColor: '' }),
    })))
    fireEvent.click(screen.getByRole('button', { name: messages.downloadPng }))
    await waitFor(() => expect(exportTemplate).toHaveBeenCalledWith(expect.any(HTMLDivElement), 'social/campaign', 100, 100))
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

  it('associates text, color, and image errors with their controls', () => {
    render(
      <>
        <EditorField field={{ key: 'title', type: 'text', required: true, label: 'Title' }} value="" onChange={vi.fn()} error={messages.errorRequired} />
        <EditorField field={{ key: 'color', type: 'color', required: true, label: 'Color' }} value="#123456" onChange={vi.fn()} error={messages.errorInvalidColor} colorPickerLabel={messages.colorPickerLabel} />
        <EditorField field={{ key: 'logo', type: 'image', required: true, label: 'Logo' }} value="" onChange={vi.fn()} error={messages.errorRequired} imageLabels={{ select: messages.imageSelect, uploading: messages.imageUploading, loadError: messages.imageLoadError }} onImageUpload={async () => undefined} />
      </>,
    )

    expect(screen.getByRole('textbox', { name: 'Title' }).getAttribute('aria-describedby')).toBe('title-error')
    expect(screen.getByRole('textbox', { name: 'Color' }).getAttribute('aria-describedby')).toBe('color-error')
    expect(document.getElementById('color-picker')?.getAttribute('aria-describedby')).toBe('color-error')
    expect(screen.getByLabelText('Logo').getAttribute('aria-describedby')).toBe('logo-error')
    expect(screen.getAllByText(messages.errorRequired)).toHaveLength(2)
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

  it('discards stale persisted choices without losing sibling edits', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Ready', invalidNumber: 1, tooSmall: 10, tooLarge: 20, steppedNumber: 4, sliderNumber: 50, alignment: 'unknown', accentColor: '#123456' } } }))
    renderEditor()

    const alignment = screen.getByRole('combobox', { name: 'Alignment' })

    expect(screen.queryByText(messages.errorInvalidChoice)).toBeNull()
    expect(alignment.getAttribute('aria-invalid')).toBe('false')
    expect((alignment as HTMLSelectElement).value).toBe('center')
    expect(screen.getByText('logo-on:1')).toBeTruthy()
  })

  it('passes the current resolved choice to the renderer without losing sibling edits', () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Ready', showLogo: false, alignment: 'obsolete' } } }))
    const definition = createDefinition()
    const renderer = vi.spyOn(definition, 'render')

    render(<FrameKitEditor template={createTemplate(definition)} definition={definition} messages={messages} />)

    expect(renderer).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ title: 'Ready', showLogo: false, alignment: 'center' }),
    }))
  })

  it('copies a valid template PNG', async () => {
    localStorage.setItem('framekit:social/campaign:v2', JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Ready', invalidNumber: 1, tooSmall: 10, tooLarge: 20, steppedNumber: 4, sliderNumber: 50, accentColor: '#123456' } } }))
    renderEditor()

    fireEvent.click(screen.getByRole('button', { name: messages.copyPng }))

    await waitFor(() => expect(copyTemplate).toHaveBeenCalledWith(expect.any(HTMLDivElement), 100, 100))
  })

  it('shows generating and ignores a second export click while export is pending', async () => {
    let resolvePending!: () => void
    const pending = new Promise<void>((resolve) => {
      resolvePending = resolve
    })
    vi.mocked(exportTemplate).mockImplementationOnce(() => pending)
    renderEditor()

    const button = screen.getByRole('button', { name: messages.downloadPng }) as HTMLButtonElement
    fireEvent.click(button)

    expect(button.disabled).toBe(true)
    expect(button.textContent).toContain(messages.generating)
    expect(exportTemplate).toHaveBeenCalledWith(expect.any(HTMLDivElement), 'social/campaign', 100, 100)

    fireEvent.click(button)
    expect(exportTemplate).toHaveBeenCalledTimes(1)

    resolvePending()
    await waitFor(() => {
      expect(button.disabled).toBe(false)
      expect(button.textContent).toContain(messages.downloadPng)
    })
  })

  it.each([
    ['download', messages.downloadPng, 'export'],
    ['copy', messages.copyPng, 'copy'],
  ] as const)('shows the localized alert when %s fails', async (_action, buttonName, actionName) => {
    const failure = new Error('private export failure')
    if (actionName === 'export') {
      vi.mocked(exportTemplate).mockRejectedValueOnce(failure)
    } else {
      vi.mocked(copyTemplate).mockRejectedValueOnce(failure)
    }

    const alert = vi.spyOn(window, 'alert').mockImplementation(() => undefined)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    try {
      renderEditor()
      fireEvent.click(screen.getByRole('button', { name: buttonName }))

      await waitFor(() => expect(alert).toHaveBeenCalledWith(messages.exportAlert))
      expect(consoleError).toHaveBeenCalledWith(messages.exportError, failure)
    } finally {
      alert.mockRestore()
      consoleError.mockRestore()
    }
  })

  it('shows a localized accessible error when image upload response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 413 })
    vi.stubGlobal('fetch', fetchMock)

    try {
      const definition = defineTemplate({
        meta: { title: 'Image editor test' },
        width: 100,
        height: 100,
        fields: { logo: field.image({ label: 'Logo', scope: 'variant' }) },
        content: { en: {} },
        variants: { default: 'en' },
        render: ({ data }) => <span>{data.logo}</span>,
      })
      render(<FrameKitEditor template={createTemplate(definition)} definition={definition} messages={messages} />)
      const input = screen.getByLabelText('Logo')
      const file = new File(['image'], 'logo.png', { type: 'image/png' })
      fireEvent.change(input, { target: { files: [file] } })

      await waitFor(() => expect(screen.getByText(messages.imageUploadError)).toBeTruthy())
      expect(input.getAttribute('aria-invalid')).toBe('true')
      expect(input.getAttribute('aria-describedby')).toBe('logo-error')
      expect(screen.getByText(messages.imageUploadError).id).toBe('logo-error')
      expect((input as HTMLInputElement).value).toBe('')
      expect(fetchMock).toHaveBeenCalledWith('/__framekit/assets', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          templateSlug: 'social/campaign',
          variant: 'en',
          fieldKey: 'logo',
          filename: 'logo.png',
          mimeType: 'image/png',
          data: 'aW1hZ2U=',
        }),
      })
    } finally {
      vi.unstubAllGlobals()
    }
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
