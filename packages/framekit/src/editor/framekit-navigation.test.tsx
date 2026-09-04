// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FrameKitNavigation, FrameKitNavigationTree } from './framekit-navigation'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>,
}))

vi.mock('next/navigation', () => ({
  usePathname: () => '/editor/catalog/category/first',
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

const unselectedNavigation = {
  ...navigation,
  children: [{
    ...navigation.children[0],
    children: [{ type: 'template' as const, id: 'catalog/category/other', slug: 'catalog/category/other', title: 'Other', href: '/editor/catalog/category/other' }],
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

    render(<FrameKitNavigationTree nodes={[unselectedNavigation]} />)

    expect(screen.getByRole('button', { name: 'Catalog' }).getAttribute('aria-expanded')).toBe('true')
    const categoryButton = screen.getByRole('button', { name: 'Category' })
    expect(categoryButton.getAttribute('aria-expanded')).toBe('false')
    expect(categoryButton.querySelector('svg')?.classList.contains('rotate-90')).toBe(false)
    expect(screen.queryByRole('link', { name: 'Other' })).toBeNull()
  })

  it('applies the persisted closed state before the initial assertion', () => {
    localStorage.setItem('framekit:navigation:v1', JSON.stringify({ catalog: false }))

    render(<FrameKitNavigation node={unselectedNavigation} />)

    expect(screen.getByRole('button', { name: 'Catalog' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('link', { name: 'Other' })).toBeNull()
  })

  it('restores a folder state from localStorage', () => {
    render(<FrameKitNavigation node={unselectedNavigation} />)

    fireEvent.click(screen.getByRole('button', { name: 'Catalog' }))
    expect(screen.queryByRole('link', { name: 'Other' })).toBeNull()

    cleanup()
    render(<FrameKitNavigation node={unselectedNavigation} />)

    expect(screen.getByRole('button', { name: 'Catalog' }).getAttribute('aria-expanded')).toBe('false')
    expect(screen.queryByRole('link', { name: 'Other' })).toBeNull()
  })

  it('ignores malformed persisted state', () => {
    localStorage.setItem('framekit:navigation:v1', '{invalid')

    render(<FrameKitNavigation node={navigation} />)

    expect(screen.getByRole('button', { name: 'Catalog' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'First' })).toBeTruthy()
  })

  it('keeps selected templates subdued and draws scope lines only for folders', () => {
    render(<FrameKitNavigationTree nodes={[navigation]} />)

    const link = screen.getByRole('link', { name: 'First' })
    expect(link.getAttribute('aria-current')).toBe('page')
    expect(link.className).toContain('bg-white/10')
    expect(link.className).not.toContain('bg-[#c8f7d9]')
    expect(link.querySelector('span[aria-hidden="true"]')).toBeNull()
    expect(link.style.paddingLeft).toBe('41px')
    const scopeLine = document.querySelector('div.relative > span[aria-hidden="true"]')
    expect(scopeLine).toBeTruthy()
    expect((scopeLine as HTMLElement).style.left).toBe('17px')
    expect(screen.getByRole('button', { name: 'Catalog' }).className).toContain('focus:ring-2')
  })

  it('keeps folders and template links keyboard-focusable with visible focus styles', () => {
    render(<FrameKitNavigationTree nodes={[navigation]} />)

    const folder = screen.getByRole('button', { name: 'Catalog' })
    const link = screen.getByRole('link', { name: 'First' })

    expect(folder.tagName).toBe('BUTTON')
    expect(folder.getAttribute('type')).toBe('button')
    expect(link.tagName).toBe('A')

    folder.focus()
    expect(document.activeElement).toBe(folder)
    expect(folder.className).toContain('focus:ring-2')

    link.focus()
    expect(document.activeElement).toBe(link)
    expect(link.className).toContain('focus:ring-2')
  })

  it('keeps the selected template visible when its folders are collapsed', () => {
    localStorage.setItem('framekit:navigation:v1', JSON.stringify({ catalog: false, 'catalog/category': false }))

    render(<FrameKitNavigationTree nodes={[navigation]} />)

    expect(screen.getByRole('button', { name: 'Catalog' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('button', { name: 'Category' }).getAttribute('aria-expanded')).toBe('true')
    expect(screen.getByRole('link', { name: 'First' }).getAttribute('aria-current')).toBe('page')
  })
})
