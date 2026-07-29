// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FrameKitStudio } from './framekit-studio'
import { FrameKitLocaleProvider } from './locale-provider'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/navigation', () => ({
  useParams: () => ({}),
  usePathname: () => '/editor',
}))

afterEach(cleanup)

describe('FrameKitStudio sidebar', () => {
  it('collapses navigation and settings into an expandable rail', () => {
    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[]} />
      </FrameKitLocaleProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ajustes' }))
    expect(screen.getByRole('combobox', { name: 'Idioma de la interfaz' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Colapsar navegación' }))
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ajustes' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Expandir navegación' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Expandir navegación' }))
    expect(screen.getByRole('navigation')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ajustes' })).toBeTruthy()
  })
})
