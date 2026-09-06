// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { frameKitMessages } from '@/studio/i18n/messages'
import { FrameKitStudioSettings } from '../sidebar-settings'

afterEach(cleanup)
beforeEach(() => {
  document.documentElement.className = ''
  document.documentElement.lang = ''
  document.cookie = 'locale=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
  document.cookie = 'theme=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/'
})

describe('FrameKitStudioSettings', () => {
  it('renders nothing while closed', () => {
    render(<FrameKitStudioSettings open={false} locale="es" messages={frameKitMessages.es.sidebar} onLocaleChange={vi.fn()} />)

    expect(screen.queryByRole('combobox')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('forwards the selected locale', () => {
    const onLocaleChange = vi.fn()
    render(<FrameKitStudioSettings open locale="es" messages={frameKitMessages.es.sidebar} onLocaleChange={onLocaleChange} />)

    fireEvent.change(screen.getByRole('combobox', { name: 'Idioma de la interfaz' }), { target: { value: 'en' } })

    expect(onLocaleChange).toHaveBeenCalledExactlyOnceWith('en')
  })

  it('toggles the document theme and persists it in a cookie', () => {
    render(<FrameKitStudioSettings open locale="es" messages={frameKitMessages.es.sidebar} onLocaleChange={vi.fn()} />)

    const theme = screen.getByRole('button', { name: 'Cambiar tema' })
    fireEvent.click(theme)
    expect(document.documentElement.className).toBe('dark')
    expect(document.cookie).toBe('theme=dark')

    fireEvent.click(theme)
    expect(document.documentElement.className).toBe('')
    expect(document.cookie).toBe('theme=light')
  })
})
