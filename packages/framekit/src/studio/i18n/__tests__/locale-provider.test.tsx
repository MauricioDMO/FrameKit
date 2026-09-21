// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'

import { FrameKitLocaleProvider, useFrameKitLocale } from '@/studio/i18n/locale-provider'

afterEach(cleanup)

function LocaleConsumer () {
  const { locale, messages, setLocale } = useFrameKitLocale()

  return (
    <>
      <output>{locale}</output>
      <p>{messages.sidebar.languageLabel}</p>
      <button type="button" onClick={() => setLocale('en')}>Change locale</button>
    </>
  )
}

describe('FrameKitLocaleProvider', () => {
  it('provides localized messages and persists locale changes', () => {
    render(
      <FrameKitLocaleProvider initialLocale="es">
        <LocaleConsumer />
      </FrameKitLocaleProvider>
    )

    expect(screen.getByText('es')).toBeTruthy()
    expect(screen.getByText('Idioma de la interfaz')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Change locale' }))

    expect(screen.getByText('en')).toBeTruthy()
    expect(screen.getByText('App language')).toBeTruthy()
    expect(document.documentElement.lang).toBe('en')
    expect(document.cookie).toBe('locale=en')
  })

  it('throws when used outside the provider', () => {
    expect(() => render(<LocaleConsumer />)).toThrow('useFrameKitLocale must be used within FrameKitLocaleProvider')
  })
})
