// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { frameKitMessages } from '@/studio/i18n/messages'
import { EmptyState, LoadingState, MessageState, NotFoundState } from '../studio-states'

afterEach(cleanup)

describe('Studio states', () => {
  it('exposes the loading label and busy state', () => {
    render(<LoadingState label="Loading template" />)

    const loading = screen.getByLabelText('Loading template')
    expect(loading.getAttribute('aria-busy')).toBe('true')
  })

  it('renders the correct empty copy for templates and brands', () => {
    const { rerender } = render(<EmptyState isBrand={false} messages={frameKitMessages.en} />)
    expect(screen.getByRole('heading', { name: 'Select a template' })).toBeTruthy()
    expect(screen.getByText('Canvas ready')).toBeTruthy()

    rerender(<EmptyState isBrand messages={frameKitMessages.en} />)
    expect(screen.getByRole('heading', { name: 'Select a component' })).toBeTruthy()
    expect(screen.getByText('Brand component')).toBeTruthy()
  })

  it('renders mode-specific not-found links', () => {
    const { rerender } = render(<NotFoundState isBrand={false} messages={frameKitMessages.en} />)
    expect(screen.getByRole('link', { name: 'Back to editor' }).getAttribute('href')).toBe('/editor')
    expect(screen.getByRole('heading', { name: 'Template not found' })).toBeTruthy()

    rerender(<NotFoundState isBrand messages={frameKitMessages.en} />)
    expect(screen.getByRole('link', { name: 'Back to editor' }).getAttribute('href')).toBe('/brand')
    expect(screen.getByRole('heading', { name: 'Component not found' })).toBeTruthy()
  })

  it('exposes message errors as alerts', () => {
    render(<MessageState>Invalid resource</MessageState>)

    expect(screen.getByRole('alert').textContent).toBe('Invalid resource')
  })
})
