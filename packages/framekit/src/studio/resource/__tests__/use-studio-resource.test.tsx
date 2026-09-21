// @vitest-environment jsdom

import { cleanup, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '@/index'
import type { TemplateRegistryEntry } from '@/types'
import type { FrameKitStudioBrand } from '@/studio/types'
import { useStudioResource, type StudioResourceInput } from '@/studio/resource/use-studio-resource'

afterEach(cleanup)

function ResourceProbe (props: StudioResourceInput) {
  const state = useStudioResource(props)
  const kind = state.status === 'ready' || state.status === 'error' ? `:${state.kind}` : ''
  return <output data-testid="resource-state">{state.status}{kind}</output>
}

function createTemplateEntry ({ width = 100, height = 80 }: { width?: number, height?: number } = {}) {
  const definition = defineTemplate({
    meta: { title: 'Loaded template' },
    width: 100,
    height: 80,
    fields: { title: field.text({ label: 'Title' }) },
    content: { default: { title: 'Default title' } },
    variants: { default: 'default' },
    render: (props) => <span>{props.data.title}</span>
  })
  const load = vi.fn<TemplateRegistryEntry['load']>(async () => ({ default: definition }))

  const entry = {
    slug: 'social/post',
    segments: ['social', 'post'],
    meta: { title: 'Registry template' },
    width,
    height,
    variants: definition.variants,
    variantKeys: Object.keys(definition.content),
    assets: { common: {}, variants: {} },
    load
  } satisfies TemplateRegistryEntry

  return { entry, definition }
}

function createBrandEntry () {
  const preview = () => <span>Brand preview</span>
  const load = vi.fn<FrameKitStudioBrand['load']>(async () => ({ default: preview }))
  const brand = {
    slug: 'communication/hero',
    title: 'Hero',
    segments: ['communication', 'hero'],
    description: 'A hero component.',
    load
  } satisfies FrameKitStudioBrand

  return brand
}

function deferred<T> (): { promise: Promise<T>, resolve: (value: T | PromiseLike<T>) => void } {
  let resolve!: (value: T | PromiseLike<T>) => void
  const promise = new Promise<T>((_resolve) => {
    resolve = _resolve
  })
  return { promise, resolve }
}

describe('useStudioResource', () => {
  it('returns not-found without invoking a loader for an unknown template', async () => {
    render(<ResourceProbe slug="missing" section="editor" templates={[]} brands={[]} />)

    await waitFor(() => expect(screen.getByTestId('resource-state').textContent).toBe('not-found'))
  })

  it('loads and validates a template definition against registry dimensions', async () => {
    const { entry } = createTemplateEntry()

    render(<ResourceProbe slug={entry.slug} section="editor" templates={[entry]} brands={[]} />)

    await waitFor(() => expect(screen.getByTestId('resource-state').textContent).toBe('ready:template'))
    expect(entry.load).toHaveBeenCalledOnce()
  })

  it('rejects a template with mismatched dimensions', async () => {
    const { entry } = createTemplateEntry({ width: 200 })

    render(<ResourceProbe slug={entry.slug} section="editor" templates={[entry]} brands={[]} />)

    await waitFor(() => expect(screen.getByTestId('resource-state').textContent).toBe('invalid'))
  })

  it('loads brand previews and reports loader errors by kind', async () => {
    const brand = createBrandEntry()
    render(<ResourceProbe slug={brand.slug} section="brand" templates={[]} brands={[brand]} />)
    await waitFor(() => expect(screen.getByTestId('resource-state').textContent).toBe('ready:brand'))

    cleanup()
    const failedBrand = createBrandEntry()
    failedBrand.load.mockRejectedValue(new Error('private failure'))
    render(<ResourceProbe slug={failedBrand.slug} section="brand" templates={[]} brands={[failedBrand]} />)
    await waitFor(() => expect(screen.getByTestId('resource-state').textContent).toBe('error:brand'))
  })

  it('reports template loader errors without exposing the loader error', async () => {
    const { entry } = createTemplateEntry()
    entry.load.mockRejectedValue(new Error('private failure'))

    render(<ResourceProbe slug={entry.slug} section="editor" templates={[entry]} brands={[]} />)

    await waitFor(() => expect(screen.getByTestId('resource-state').textContent).toBe('error:template'))
  })

  it('does not update after a brand loader is unmounted', async () => {
    const brand = createBrandEntry()
    const brandModule = await brand.load()
    brand.load.mockClear()
    const brandLoad = deferred<Awaited<ReturnType<typeof brand.load>>>()
    brand.load.mockReturnValue(brandLoad.promise)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      const view = render(<ResourceProbe slug={brand.slug} section="brand" templates={[]} brands={[brand]} />)
      view.unmount()
      brandLoad.resolve(brandModule)
      await brandLoad.promise
      await Promise.resolve()
      expect(consoleError).not.toHaveBeenCalled()
    } finally {
      consoleError.mockRestore()
    }
  })
})
