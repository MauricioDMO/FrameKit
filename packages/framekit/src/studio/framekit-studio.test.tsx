// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '../index'
import type { TemplateRegistryEntry } from '../types'

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

afterEach(() => {
  cleanup()
  route.params = {}
  route.pathname = '/editor'
})

function createTemplateEntry({ slug = 'social/campaign', width = 100, height = 80, meta = { title: 'Registry title', description: 'Functional description', marketingDescription: 'Marketing goal', tags: ['social', 'launch'] } }: { slug?: string, width?: number, height?: number, meta?: TemplateRegistryEntry['meta'] } = {}) {
  const definition = defineTemplate({
    meta: { title: 'Loaded definition title' },
    width: 100,
    height: 80,
    fields: { title: field.text({ label: 'Title' }) },
    content: { moon: { title: 'Moon title' }, fjord: { title: 'Fjord title' } },
    variants: { default: 'moon', labels: { moon: 'Moon', fjord: 'Fjord' } },
    render: ({ data }) => <span>{data.title}</span>,
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

describe('FrameKitStudio sidebar', () => {
  it('collapses navigation and settings into an expandable rail', () => {
    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[]} />
      </FrameKitLocaleProvider>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ajustes' }))
    expect(screen.getByRole('combobox', { name: 'Idioma de la interfaz' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Plantillas' }).querySelector('svg')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Marca' }).querySelector('svg')).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Colapsar navegación' }))
    expect(screen.queryByRole('navigation')).toBeNull()
    expect(screen.queryByRole('button', { name: 'Ajustes' })).toBeNull()
    expect(screen.getByRole('button', { name: 'Expandir navegación' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Expandir navegación' }))
    expect(screen.getByRole('navigation')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Ajustes' })).toBeTruthy()
  })
})

describe('FrameKitStudio template integration', () => {
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

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Template not found' })).toBeTruthy())
    expect(screen.getByRole('link', { name: 'Back to editor' }).getAttribute('href')).toBe('/editor')
    expect(entry.load).not.toHaveBeenCalled()
  })

  it('shows loading instead of keeping the previous template ready during navigation', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const first = createTemplateEntry({ meta: { title: 'First template' } })
    const view = render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[first]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'First template' })).toBeTruthy())

    const next = createTemplateEntry({ slug: 'social/launch', meta: { title: 'Next template' } })
    next.load.mockReturnValue(new Promise<Awaited<ReturnType<typeof next.load>>>(() => undefined))
    route.params = { slug: ['social', 'launch'] }
    view.rerender(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[first, next]} />
      </FrameKitLocaleProvider>,
    )

    expect(screen.getByLabelText('Loading...')).toBeTruthy()
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
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Next template' })).toBeTruthy())

    resolveFirst({ default: {} as never })
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Next template' })).toBeTruthy()
      expect(screen.queryByRole('alert')).toBeNull()
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

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Registry title' })).toBeTruthy())
    expect(screen.queryByRole('heading', { name: 'Campaign' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Metadata' }))
    const metadata = screen.getByRole('dialog', { name: 'Registry title' })
    expect(within(metadata).getByText('Descripción funcional')).toBeTruthy()
    expect(within(metadata).getByText('Objetivo de marketing')).toBeTruthy()
    expect(within(metadata).getByText('social')).toBeTruthy()
    expect(within(metadata).getByText('launch')).toBeTruthy()
    expect(screen.getByText('100 × 80')).toBeTruthy()
  })

  it('omits optional metadata sections when the registry entry does not provide them', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const entry = createTemplateEntry({ meta: { title: 'Registry title' } })

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[entry]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Registry title' })).toBeTruthy())
    expect(screen.queryByText('Descripción funcional')).toBeNull()
    expect(screen.queryByText('Objetivo de marketing')).toBeNull()
    expect(screen.queryByText('Tags')).toBeNull()
  })

  it('rejects a registry definition with different dimensions', async () => {
    route.params = { slug: ['social', 'campaign'] }

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[createTemplateEntry({ width: 200 })]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('La plantilla no es válida'))
  })

  it('rejects a registry definition with a different height', async () => {
    route.params = { slug: ['social', 'campaign'] }

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[createTemplateEntry({ height: 90 })]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('La plantilla no es válida'))
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

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('La plantilla no es válida'))
  })

  it('keeps the selected variant independent from the Studio interface locale', async () => {
    route.params = { slug: ['social', 'campaign'] }
    const entry = createTemplateEntry()

    render(
      <FrameKitLocaleProvider initialLocale="es">
        <FrameKitStudio templates={[entry]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('combobox', { name: 'Variante' })).toBeTruthy())
    fireEvent.change(screen.getByRole('combobox', { name: 'Variante' }), { target: { value: 'fjord' } })
    fireEvent.click(screen.getByRole('button', { name: 'Ajustes' }))
    fireEvent.change(screen.getByRole('combobox', { name: 'Idioma de la interfaz' }), { target: { value: 'en' } })

    expect((screen.getByRole('combobox', { name: 'Variant' }) as HTMLSelectElement).value).toBe('fjord')
    expect(screen.getByRole('heading', { name: 'Registry title' })).toBeTruthy()
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

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('Error loading template'))
    expect(screen.queryByText('private loader failure')).toBeNull()
  })

  it('uses the localized brand load error instead of exposing the loader error', async () => {
    route.pathname = '/brand'
    route.params = { slug: ['communication', 'hero'] }
    const brand = {
      slug: 'communication/hero',
      title: 'Hero',
      segments: ['communication', 'hero'],
      description: 'A hero component.',
      load: vi.fn(async () => ({ default: () => null })),
    }
    brand.load.mockRejectedValue(new Error('private brand loader failure'))

    render(
      <FrameKitLocaleProvider initialLocale="en">
        <FrameKitStudio templates={[]} brands={[brand]} />
      </FrameKitLocaleProvider>,
    )

    await waitFor(() => expect(screen.getByRole('alert').textContent).toContain('The component could not be loaded'))
    expect(screen.queryByText('private brand loader failure')).toBeNull()
  })
})
