// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '../index'
import type { TemplateDefinition, TemplateRegistryEntry } from '../types'

import { FrameKitStudio } from './framekit-studio'
import { FrameKitLocaleProvider } from './locale-provider'

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>,
}))

const route = vi.hoisted(() => ({ params: {} as { slug?: string[] }, pathname: '/editor' }))

vi.mock('next/navigation', () => ({
  useParams: () => route.params,
  usePathname: () => route.pathname,
}))

const initialLocalStorage = new Map<string, string>()
for (let index = 0; index < localStorage.length; index += 1) {
  const key = localStorage.key(index)
  const value = key === null ? null : localStorage.getItem(key)
  if (key !== null && value !== null) initialLocalStorage.set(key, value)
}

const initialDocumentAttributes = Array.from(document.documentElement.attributes).map(({ name, value }) => [name, value] as const)
const initialCookies = document.cookie

function clearCookies() {
  for (const cookie of document.cookie.split('; ')) {
    const name = cookie.split('=', 1)[0]
    if (name) document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
  }
}

function restoreBrowserState() {
  localStorage.clear()
  for (const [key, value] of initialLocalStorage) localStorage.setItem(key, value)

  for (const attribute of Array.from(document.documentElement.attributes)) document.documentElement.removeAttribute(attribute.name)
  for (const [name, value] of initialDocumentAttributes) document.documentElement.setAttribute(name, value)

  clearCookies()
  for (const cookie of initialCookies.split('; ')) {
    if (cookie) document.cookie = `${cookie}; path=/`
  }
}

beforeEach(restoreBrowserState)
afterEach(() => {
  cleanup()
  route.params = {}
  route.pathname = '/editor'
  restoreBrowserState()
})

function createTemplateEntry({ slug = 'social/campaign', width = 100, height = 80, meta = { title: 'Registry title', description: 'Functional description', marketingDescription: 'Marketing goal', tags: ['social', 'launch'] }, onRender }: { slug?: string, width?: number, height?: number, meta?: TemplateRegistryEntry['meta'], onRender?: (props: Parameters<TemplateDefinition['render']>[0]) => void } = {}) {
  const definition = defineTemplate({
    meta: { title: 'Loaded definition title' },
    width: 100,
    height: 80,
    fields: { title: field.text({ label: 'Title' }) },
    content: { moon: { title: 'Moon title' }, fjord: { title: 'Fjord title' } },
    variants: { default: 'moon', labels: { moon: 'Moon', fjord: 'Fjord' } },
    render: (props) => {
      onRender?.(props)
      return <span>{props.data.title}</span>
    },
  })

  return {
    slug,
    segments: slug.split('/'),
    meta,
    width,
    height,
    variants: definition.variants,
    variantKeys: Object.keys(definition.content),
    assets: { common: {}, variants: {} },
    load: vi.fn(async () => ({ default: definition })),
  } satisfies TemplateRegistryEntry
}

function createBrandEntry({ slug = 'communication/hero', title = 'Hero', description = 'A hero component.' }: { slug?: string, title?: string, description?: string } = {}) {
  const preview = vi.fn(() => <span>Brand preview</span>)
  const brand = {
    slug,
    title,
    segments: slug.split('/'),
    description,
    load: vi.fn(async () => ({ default: preview })),
  }
  return { brand, preview }
}

describe('FrameKitStudio sidebar', () => {
  it('shows the exact initial template state without a selected slug', () => {
    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[]} />
      </FrameKitLocaleProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Select a template' }).textContent).toBe('Select a template')
    expect(screen.getByText('Canvas ready').textContent).toBe('Canvas ready')
    expect(screen.getByText('Choose a format from the navigation to edit its content and export it as a PNG.').textContent).toBe('Choose a format from the navigation to edit its content and export it as a PNG.')
    expect(screen.getByText('No templates are available.').textContent).toBe('No templates are available.')
  })

  it('collapses navigation and settings into an expandable rail', () => {
    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[]} />
      </FrameKitLocaleProvider>,
    )

    const settings = screen.getByRole('button', { name: 'Ajustes' })
    expect(settings.getAttribute('aria-expanded')).toBe('false')
    expect(settings.getAttribute('aria-controls')).toBe('sidebar-settings')
    expect(screen.getByRole('link', { name: 'Plantillas' }).getAttribute('href')).toBe('/editor')
    expect(screen.getByRole('link', { name: 'Plantillas' }).getAttribute('aria-current')).toBe('page')
    expect(screen.getByRole('link', { name: 'Marca' }).getAttribute('href')).toBe('/brand')
    expect(screen.getByRole('link', { name: 'Marca' }).getAttribute('aria-current')).toBeNull()

    fireEvent.click(settings)
    expect(settings.getAttribute('aria-expanded')).toBe('true')
    expect((screen.getByRole('combobox', { name: 'Idioma de la interfaz' }) as HTMLSelectElement).value).toBe('es')

    fireEvent.click(screen.getByRole('button', { name: 'Colapsar navegación' }))
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ajustes' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Expandir navegación' }).getAttribute('title')).toBe('Expandir navegación')

    fireEvent.click(screen.getByRole('button', { name: 'Expandir navegación' }))
    expect(screen.getByRole('navigation').getAttribute('aria-label')).toBe('Plantillas')
    expect(screen.getByRole('button', { name: 'Ajustes' }).getAttribute('aria-expanded')).toBe('false')
  })

  it('persists locale and theme actions in the document and cookies', () => {
    clearCookies()
    document.documentElement.className = ''
    document.documentElement.lang = ''

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[]} />
      </FrameKitLocaleProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ajustes' }))
    const language = screen.getByRole('combobox', { name: 'Idioma de la interfaz' })
    fireEvent.change(language, { target: { value: 'en' } })

    expect((screen.getByRole('combobox', { name: 'App language' }) as HTMLSelectElement).value).toBe('en')
    expect(document.documentElement.lang).toBe('en')
    expect(document.cookie).toBe('locale=en')

    fireEvent.click(screen.getByRole('button', { name: 'Change theme' }))
    expect(document.documentElement.className).toBe('dark')
    expect(document.cookie).toBe('locale=en; theme=dark')

    fireEvent.click(screen.getByRole('button', { name: 'Change theme' }))
    expect(document.documentElement.className).toBe('')
    expect(document.cookie).toBe('locale=en; theme=light')
  })
})

describe('FrameKitStudio template integration', () => {
  it('shows the exact initial brand state without a selected slug', () => {
    route.pathname = '/brand'

    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[]} brands={[]} />
      </FrameKitLocaleProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Select a component' }).textContent).toBe('Select a component')
    expect(screen.getByText('Choose a brand component to view its preview and learn its purpose.').textContent).toBe('Choose a brand component to view its preview and learn its purpose.')
    expect(screen.getByText('No brand components are available.').textContent).toBe('No brand components are available.')
  })

  it('shows the localized loading state while the template loader is pending', () => {
    route.params = { slug: ['social', 'campaign'] }
    const entry = createTemplateEntry()
    entry.load.mockReturnValue(new Promise<Awaited<ReturnType<typeof entry.load>>>(() => undefined))

    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[entry]} />
      </FrameKitLocaleProvider>,
    )

    const loading = screen.getByLabelText('Loading...')
    expect(entry.load).toHaveBeenCalledTimes(1)
    expect(loading.getAttribute('aria-label')).toBe('Loading...')
    expect(loading.getAttribute('aria-busy')).toBe('true')
    expect(screen.queryByRole('heading', { name: 'Registry title' })).toBeNull()
  })

  it('shows the localized not-found state for an unknown template slug', async () => {
    route.params = { slug: ['social', 'missing'] }
    const entry = createTemplateEntry()

    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[entry]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Template not found' }).textContent).toBe('Template not found'))
    expect(screen.getByText('This route does not match a template available in the catalog.').textContent).toBe('This route does not match a template available in the catalog.')
    expect(screen.getByRole('link', { name: 'Back to editor' }).getAttribute('href')).toBe('/editor')
    expect(entry.load).not.toHaveBeenCalled()
  })

  it('shows the localized brand loading state while the loader is pending', () => {
    route.pathname = '/brand'
    route.params = { slug: ['communication', 'hero'] }
    const { brand } = createBrandEntry()
    brand.load.mockReturnValue(new Promise<Awaited<ReturnType<typeof brand.load>>>(() => undefined))

    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[]} brands={[brand]} />
      </FrameKitLocaleProvider>,
    )

    const loading = screen.getByLabelText('Loading component...')
    expect(brand.load).toHaveBeenCalledTimes(1)
    expect(loading.getAttribute('aria-label')).toBe('Loading component...')
    expect(loading.getAttribute('aria-busy')).toBe('true')
    expect(screen.queryByRole('heading', { name: 'Hero' })).toBeNull()
  })

  it('shows the exact not-found state for an unknown brand slug', async () => {
    route.pathname = '/brand'
    route.params = { slug: ['communication', 'missing'] }
    const { brand } = createBrandEntry()

    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[]} brands={[brand]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Component not found' }).textContent).toBe('Component not found'))
    expect(screen.getByText('This route does not match a brand component available in the catalog.').textContent).toBe('This route does not match a brand component available in the catalog.')
    expect(screen.getByRole('link', { name: 'Back to editor' }).getAttribute('href')).toBe('/brand')
    expect(brand.load).not.toHaveBeenCalled()
  })

  it('shows loading instead of keeping the previous template ready during navigation', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const first = createTemplateEntry({ meta: { title: 'First template' } })
    const view = render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[first]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'First template' }).textContent).toBe('First template'))

    const next = createTemplateEntry({ slug: 'social/launch', meta: { title: 'Next template' } })
    next.load.mockReturnValue(new Promise<Awaited<ReturnType<typeof next.load>>>(() => undefined))
    route.params = { slug: ['social', 'launch'] }
    view.rerender(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[first, next]} />
      </FrameKitLocaleProvider>,
    )

    expect(screen.getByLabelText('Loading...').getAttribute('aria-busy')).toBe('true')
    expect(screen.queryByRole('heading', { name: 'First template' })).toBeNull()
  })

  it('ignores a template loader result that resolves after navigation', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const first = createTemplateEntry({ meta: { title: 'First template' } })
    let resolveFirst!: (module: Awaited<ReturnType<typeof first.load>>) => void
    first.load.mockReturnValue(new Promise<Awaited<ReturnType<typeof first.load>>>((resolve) => { resolveFirst = resolve }))
    const next = createTemplateEntry({ slug: 'social/launch', meta: { title: 'Next template' } })

    const view = render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[first, next]} />
      </FrameKitLocaleProvider>,
    )

    route.params = { slug: ['social', 'launch'] }
    view.rerender(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[first, next]} />
      </FrameKitLocaleProvider>,
    )
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Next template' }).textContent).toBe('Next template'))

    resolveFirst({ default: {} as never })
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Next template' }).textContent).toBe('Next template')
      expect(screen.queryByRole('alert')).toBeNull()
    })
  })

  it('passes exact resolved props to the selected template renderer', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const onRender = vi.fn()
    const entry = createTemplateEntry({ onRender })

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[entry]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(onRender).toHaveBeenLastCalledWith({
      data: { title: 'Moon title' },
      assets: { common: {}, variants: {} },
      variant: 'moon',
      width: 100,
      height: 80,
    }))

    fireEvent.change(screen.getByRole('combobox', { name: 'Variante' }), { target: { value: 'fjord' } })
    expect(onRender).toHaveBeenLastCalledWith({
      data: { title: 'Fjord title' },
      assets: { common: {}, variants: {} },
      variant: 'fjord',
      width: 100,
      height: 80,
    })
  })

  it('uses registry metadata for the selected template without a slug fallback', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const entry = createTemplateEntry()

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[entry]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Registry title' }).textContent).toBe('Registry title'))
    expect(screen.queryByRole('heading', { name: 'Campaign' })).toBeNull()
    const metadataButton = screen.getByRole('button', { name: 'Metadata' })
    metadataButton.focus()
    fireEvent.click(metadataButton)
    const metadata = screen.getByRole('dialog', { name: 'Registry title' })
    expect(within(metadata).getByText('Descripción funcional').textContent).toBe('Descripción funcional')
    expect(within(metadata).getByText('Objetivo de marketing').textContent).toBe('Objetivo de marketing')
    expect(within(metadata).getByText('social').textContent).toBe('social')
    expect(within(metadata).getByText('launch').textContent).toBe('launch')
    expect(screen.getByText('100 × 80').textContent).toBe('100 × 80')

    fireEvent.click(within(metadata).getByRole('button', { name: 'Cerrar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(document.activeElement).toBe(metadataButton)
  })

  it('rejects a registry definition with different dimensions', async () => {
    route.params = { slug: ['social', 'campaign'] }

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[createTemplateEntry({ width: 200 })]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('La plantilla no es válida'))
  })

  it('rejects a registry definition with a different height', async () => {
    route.params = { slug: ['social', 'campaign'] }

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[createTemplateEntry({ height: 90 })]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('La plantilla no es válida'))
  })

  it('rejects a loaded definition that fails validation', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const entry = createTemplateEntry()
    entry.load.mockResolvedValue({ default: {} as never })

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[entry]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('La plantilla no es válida'))
  })

  it('keeps the selected variant independent from the Studio interface locale', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const entry = createTemplateEntry()

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[entry]} />
      </FrameKitLocaleProvider>,
    )

    const variant = await waitFor(() => screen.getByRole('combobox', { name: 'Variante' }))
    fireEvent.change(variant, { target: { value: 'fjord' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ajustes' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Idioma de la interfaz' }), { target: { value: 'en' } })

    expect((screen.getByRole('combobox', { name: 'Variant' }) as HTMLSelectElement).value).toBe('fjord')
    expect(document.documentElement.lang).toBe('en')
    expect(document.cookie).toBe('locale=en')
    expect(screen.getByRole('heading', { name: 'Registry title' }).textContent).toBe('Registry title')
  })

  it('uses a localized load error instead of exposing the loader error', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const entry = createTemplateEntry()
    entry.load.mockRejectedValue(new Error('private loader failure'))

    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[entry]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Error loading template'))
    expect(screen.queryByText('private loader failure')).toBeNull()
  })

  it('loads and renders a brand preview successfully', async () => {
    route.pathname = '/brand'
    route.params = { slug: ['communication', 'hero'] }
    const { brand } = createBrandEntry()

    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[]} brands={[brand]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Hero' }).textContent).toBe('Hero'))
    expect(brand.load).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('region', { name: 'Component preview' }).getAttribute('aria-label')).toBe('Component preview')
    expect(screen.getByText('Brand preview').textContent).toBe('Brand preview')
    expect(screen.getByText('A hero component.').textContent).toBe('A hero component.')
    expect(screen.getByText('Edit the implementation in code and use this preview to verify the result.').textContent).toBe('Edit the implementation in code and use this preview to verify the result.')
  })

  it('uses the localized brand load error instead of exposing the loader error', async () => {
    route.pathname = '/brand'
    route.params = { slug: ['communication', 'hero'] }
    const { brand } = createBrandEntry()
    brand.load.mockRejectedValue(new Error('private brand loader failure'))

    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[]} brands={[brand]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('The component could not be loaded'))
    expect(screen.queryByText('private brand loader failure')).toBeNull()
  })
})
