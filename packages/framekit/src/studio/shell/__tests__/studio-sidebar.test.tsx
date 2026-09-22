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

const route = vi.hoisted(() => ({ pathname: '/editor' }))

vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname
}))

afterEach(() => {
  cleanup()
  route.pathname = '/editor'
})

const normalUser: StudioUser = { id: 'user-1', username: 'owner', role: 'user' }
const administrator: StudioUser = { id: 'admin-1', username: 'administrator', role: 'admin' }

function StatefulSidebar ({ section = 'editor', authenticated = true, administrator: isAdministrator = false }: { section?: 'editor' | 'brand' | 'settings', authenticated?: boolean, administrator?: boolean }) {
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <StudioSidebar
      user={!authenticated ? undefined : isAdministrator ? administrator : normalUser}
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

  it('shows account and token links for a normal settings user', () => {
    route.pathname = '/settings/tokens'
    render(<StatefulSidebar section="settings" />)

    const account = screen.getByRole('link', { name: 'Cuenta' })
    const tokens = screen.getByRole('link', { name: 'Tokens de API' })

    expect(account.getAttribute('href')).toBe('/settings/account')
    expect(tokens.getAttribute('href')).toBe('/settings/tokens')
    expect(screen.queryByRole('link', { name: 'Usuarios' })).toBeNull()
    expect(account.getAttribute('aria-current')).toBeNull()
    expect(tokens.getAttribute('aria-current')).toBe('page')
    expect(tokens.className).toContain('bg-fk-mint-200')
    expect(account.className).toContain('text-fk-sage-200')
  })

  it('shows the users link only for administrators and marks the current settings route active', () => {
    route.pathname = '/settings/users'
    render(<StatefulSidebar section="settings" administrator />)

    const account = screen.getByRole('link', { name: 'Cuenta' })
    const tokens = screen.getByRole('link', { name: 'Tokens de API' })
    const users = screen.getByRole('link', { name: 'Usuarios' })

    expect(account.getAttribute('href')).toBe('/settings/account')
    expect(tokens.getAttribute('href')).toBe('/settings/tokens')
    expect(users.getAttribute('href')).toBe('/settings/users')
    expect(users.getAttribute('aria-current')).toBe('page')
    expect(users.className).toContain('bg-fk-mint-200')
    for (const link of [account, tokens]) expect(link.getAttribute('aria-current')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Opciones' }))
    expect(screen.getByRole('link', { name: 'Ajustes' }).getAttribute('aria-current')).toBeNull()
  })

  it('keeps Users active on a user edit route', () => {
    route.pathname = '/settings/users/user-2'
    render(<StatefulSidebar section="settings" administrator />)

    const users = screen.getByRole('link', { name: 'Usuarios' })
    expect(users.getAttribute('aria-current')).toBe('page')
    expect(users.className).toContain('bg-fk-mint-200')

    fireEvent.click(screen.getByRole('button', { name: 'Opciones' }))
    expect(screen.getByRole('link', { name: 'Ajustes' }).getAttribute('aria-current')).toBeNull()
  })

  it('hides settings subsection links without a user', () => {
    route.pathname = '/settings/account'
    render(<StatefulSidebar section="settings" authenticated={false} />)

    expect(screen.queryByRole('link', { name: 'Cuenta' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Tokens de API' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Usuarios' })).toBeNull()
  })

  it.each([
    ['editor', 'Plantillas', 'Marca', 'Ajustes'],
    ['brand', 'Plantillas', 'Marca', 'Ajustes'],
    ['settings', 'Plantillas', 'Marca', 'Ajustes']
  ] as const)('marks only the %s destination active', (section, editorLabel, brandLabel, settingsLabel) => {
    route.pathname = section === 'settings' ? '/settings/account' : '/editor'
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
