// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { frameKitMessages } from '@/studio/i18n/messages'
import type { StudioUser } from '@/studio/types'
import { StudioSidebar } from '@/studio/shell/studio-sidebar'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>
}))

afterEach(cleanup)

const normalUser: StudioUser = { id: 'user-1', username: 'owner', role: 'user' }

function StatefulSidebar ({ section = 'editor', authenticated = true }: { section?: 'editor' | 'brand' | 'settings', authenticated?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <StudioSidebar
      user={authenticated ? normalUser : undefined}
      section={section}
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

    const settings = screen.getByRole('button', { name: 'Opciones' })
    fireEvent.click(settings)
    expect(settings.getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('combobox', { name: 'Idioma de la interfaz' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Colapsar navegación' }))
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Opciones' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Expandir navegación' }).getAttribute('title')).toBe('Expandir navegación')

    fireEvent.click(screen.getByRole('button', { name: 'Expandir navegación' }))
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toBe('Plantillas')
    expect(screen.getByRole('button', { name: 'Opciones' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('hides the account settings link without a user but keeps appearance controls', () => {
    render(<StatefulSidebar authenticated={false} />)

    fireEvent.click(screen.getByRole('button', { name: 'Opciones' }))

    expect(screen.getByRole('combobox', { name: 'Idioma de la interfaz' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Cambiar tema' })).toBeTruthy()
    expect(screen.queryByRole('link', { name: 'Ajustes' })).toBeNull()
  })

  it.each([
    ['editor', 'Plantillas', 'Marca', 'Ajustes'],
    ['brand', 'Plantillas', 'Marca', 'Ajustes'],
    ['settings', 'Plantillas', 'Marca', 'Ajustes']
  ] as const)('marks only the %s destination active', (section, editorLabel, brandLabel, settingsLabel) => {
    render(<StatefulSidebar section={section} />)
    fireEvent.click(screen.getByRole('button', { name: 'Opciones' }))

    const editor = screen.getByRole('link', { name: editorLabel })
    const brand = screen.getByRole('link', { name: brandLabel })
    const settings = screen.getByRole('link', { name: settingsLabel })
    const active = section === 'editor' ? editor : section === 'brand' ? brand : settings

    expect(active.getAttribute('aria-current')).toBe('page')
    for (const link of [editor, brand, settings]) {
      if (link !== active) expect(link.getAttribute('aria-current')).toBeNull()
    }
  })
})
