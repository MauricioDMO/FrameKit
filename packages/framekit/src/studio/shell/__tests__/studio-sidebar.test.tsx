// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { frameKitMessages } from '@/studio/i18n/messages'
import { StudioSidebar } from '../studio-sidebar'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>
}))

afterEach(cleanup)

function StatefulSidebar () {
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <StudioSidebar
      isBrand={false}
      navigation={[]}
      messages={frameKitMessages.es}
      locale="es"
      onLocaleChange={vi.fn()}
      collapsed={collapsed}
      onToggle={() => {
        setCollapsed((current) => !current)
        setSettingsOpen(false)
      }}
      settingsOpen={settingsOpen}
      onToggleSettings={() => setSettingsOpen((current) => !current)}
    />
  )
}

describe('StudioSidebar', () => {
  it('renders the active navigation and empty catalog message', () => {
    render(<StatefulSidebar />)

    expect(screen.getByRole('link', { name: 'Plantillas' }).getAttribute('href')).toBe('/editor')
    expect(screen.getByRole('link', { name: 'Plantillas' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Marca' }).getAttribute('href')).toBe('/brand')
    expect(screen.getByRole('link', { name: 'Marca' }).getAttribute('aria-current')).toBeNull()
    expect(screen.getByText('No hay plantillas disponibles.')).toBeTruthy()
  })

  it('closes settings while collapsing and restores the expanded sidebar', () => {
    render(<StatefulSidebar />)

    const settings = screen.getByRole('button', { name: 'Ajustes' })
    fireEvent.click(settings)
    expect(settings.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('combobox', { name: 'Idioma de la interfaz' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Colapsar navegación' }))
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ajustes' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Expandir navegación' }).getAttribute('title')).toBe('Expandir navegación')

    fireEvent.click(screen.getByRole('button', { name: 'Expandir navegación' }))
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toBe('Plantillas')
    expect(screen.getByRole('button', { name: 'Ajustes' }).getAttribute('aria-expanded')).toBe('false')
  })
})
