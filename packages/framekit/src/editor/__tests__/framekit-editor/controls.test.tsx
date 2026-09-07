// @vitest-environment jsdom

import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { TemplateDefinition } from '@/types'

import { createDefinition, renderDefinition, renderEditor } from './fixtures'
import { messages } from './messages'
import { setupFrameKitEditorTests } from './setup'

setupFrameKitEditorTests()

describe('FrameKitEditor controls', () => {
  it('shows the localized data error when template data cannot be resolved', () => {
    const definition = createDefinition()
    const brokenDefinition = { ...definition, variants: { ...definition.variants, default: 'missing' } } as TemplateDefinition

    renderDefinition(brokenDefinition)

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
      ['fr', 'fr']
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

  it('renders choice fields as ordered native selects without required behavior', async () => {
    renderEditor()

    const alignment = screen.getByRole('combobox', { name: 'Alignment' })
    expect(alignment.tagName).toBe('SELECT')
    expect(Array.from((alignment as HTMLSelectElement).options).map((option) => [option.value, option.textContent])).toEqual([
      ['left', 'Left'],
      ['center', 'Center'],
      ['right', 'Right']
    ])
    expect((alignment as HTMLSelectElement).value).toBe('center')
    expect(alignment.getAttribute('required')).toBeNull()

    fireEvent.change(alignment, { target: { value: 'right' } })
    expect((alignment as HTMLSelectElement).value).toBe('right')
    await waitFor(() => expect(JSON.parse(localStorage.getItem('framekit:social/campaign:v2')!).dataByVariant.en.alignment).toBe('right'))
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

    renderDefinition(definition)

    expect(renderer).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ title: 'Ready', showLogo: false, alignment: 'center' })
    }))
  })
})
