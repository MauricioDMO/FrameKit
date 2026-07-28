// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FrameKitNavigation, FrameKitNavigationTree } from './framekit-navigation'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/editor/catalog/first',
}))

const navigation = {
  type: 'folder' as const,
  id: 'catalog',
  slug: 'catalog',
  title: 'Catalog',
  children: [{
    type: 'folder' as const,
    id: 'catalog/category',
    slug: 'catalog/category',
    title: 'Category',
    children: [{ type: 'template' as const, id: 'catalog/category/first', slug: 'catalog/category/first', title: 'First', href: '/editor/catalog/category/first' }],
  }],
}

beforeEach(() => localStorage.clear())
afterEach(() => {
  cleanup()
  localStorage.clear()
})

describe('FrameKitNavigation', () => {
  it('keeps nested folder indicators independent', () => {
    localStorage.setItem('framekit:navigation:v1', JSON.stringify({ catalog: true, 'catalog/category': false }))

    render(<FrameKitNavigationTree nodes={[navigation]} />)

    expect(screen.getByRole('button', { name: 'Catalog' }).getAttribute('aria-expanded')).toBe('true')
    const categoryButton = screen.getByRole('button', { name: 'Category' })
    expect(categoryButton.getAttribute('aria-expanded')).toBe('false')
    expect(categoryButton.querySelector('svg')?.classList.contains('rotate-90')).toBe(false)
    expect(screen.queryByRole('link', { name: 'First' })).toBeNull()
  })

  it('applies the persisted closed state before the initial assertion', () => {
    localStorage.setItem('framekit:navigation:v1', JSON.stringify({ catalog: false }))

    render(<FrameKitNavigation node={navigation} />)

    expect(screen.getByRole('button', { name: 'Catalog' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('link', { name: 'First' })).toBeNull()
  })

  it('restores a folder state from localStorage', () => {
    render(<FrameKitNavigation node={navigation} />)

    fireEvent.click(screen.getByRole('button', { name: 'Catalog' }))
    expect(screen.queryByRole('link', { name: 'First' })).toBeNull()

    cleanup()
    render(<FrameKitNavigation node={navigation} />)

    expect(screen.getByRole('button', { name: 'Catalog' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('link', { name: 'First' })).toBeNull()
  })

  it('ignores malformed persisted state', () => {
    localStorage.setItem('framekit:navigation:v1', '{invalid')

    render(<FrameKitNavigation node={navigation} />)

    expect(screen.getByRole('button', { name: 'Catalog' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'First' })).toBeTruthy()
  })
})
