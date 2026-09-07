// @vitest-environment jsdom

import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { defineTemplate, field } from '@mauriciodmo/framekit'
import type {
  TemplateAssetManifest,
  TemplateDefinition,
  TemplateRegistryEntry
} from '@mauriciodmo/framekit'
import type { ResolvedRenderPayload } from '@mauriciodmo/framekit/server'

import { RenderClient } from '@/app/__framekit/render/[id]/render-client'

const registryState = vi.hoisted(() => ({ templates: [] as unknown[] }))

vi.mock('@framekit/generated/templates', () => registryState)

type TestRenderProps = {
  data: { title: string }
  assets: TemplateAssetManifest
  variant: string
  width: number
  height: number
}

type TestRender = (props: TestRenderProps) => React.ReactNode

const TEST_SLUG = 'render-route/test'
const TEST_ASSETS: TemplateAssetManifest = {
  common: { logo: '/assets/logo.svg' },
  variants: { en: { background: '/assets/background.svg' } }
}

function makePayload (overrides: Partial<ResolvedRenderPayload> = {}): ResolvedRenderPayload {
  return {
    template: TEST_SLUG,
    variant: 'en',
    data: { title: 'Payload title' },
    assets: TEST_ASSETS,
    width: 320,
    height: 180,
    ...overrides
  }
}

function makeDefinition (options: { width?: number, height?: number, render?: TestRender } = {}): TemplateDefinition {
  const width = options.width ?? 320
  const height = options.height ?? 180
  const render = options.render ?? (({ data }) => <span>{data.title}</span>)

  return defineTemplate({
    meta: { title: 'Render route test' },
    width,
    height,
    fields: { title: field.text({ label: 'Title' }) },
    content: { en: { title: 'Definition title' } },
    variants: { default: 'en' },
    render
  })
}

function makeEntry (options: {
  slug?: string
  definition?: TemplateDefinition
  load?: TemplateRegistryEntry['load']
} = {}): TemplateRegistryEntry {
  const slug = options.slug ?? TEST_SLUG
  const definition = options.definition ?? makeDefinition()

  return {
    slug,
    segments: slug.split('/'),
    meta: { title: 'Registry entry' },
    width: 320,
    height: 180,
    variants: { default: 'en' },
    variantKeys: ['en'],
    assets: { common: {}, variants: { en: {} } },
    load: options.load ?? (async () => ({ default: definition }))
  }
}

function setEntries (...entries: TemplateRegistryEntry[]): void {
  registryState.templates.splice(0, registryState.templates.length, ...entries)
}

function deferred<T> (): { promise: Promise<T>, resolve: (value: T) => void } {
  let resolvePromise!: (value: T) => void
  const promise = new Promise<T>((resolve) => {
    resolvePromise = resolve
  })
  return { promise, resolve: (value) => resolvePromise(value) }
}

interface MountedRender {
  container: HTMLDivElement
  rerender: (payload: ResolvedRenderPayload) => void
  unmount: () => void
}

const mountedRenders: MountedRender[] = []

function mount (payload: ResolvedRenderPayload): MountedRender {
  const container = document.createElement('div')
  const root: Root = createRoot(container)
  document.body.append(container)
  act(() => {
    root.render(<RenderClient payload={payload} />)
  })

  const mounted: MountedRender = {
    container,
    rerender: (nextPayload) => {
      act(() => {
        root.render(<RenderClient payload={nextPayload} />)
      })
    },
    unmount: () => {
      act(() => root.unmount())
      container.remove()
    }
  }
  mountedRenders.push(mounted)
  return mounted
}

async function settle (): Promise<void> {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()
  })
}

function expectCoarseError (container: HTMLDivElement, code: string): void {
  expect(container.querySelectorAll('[data-framekit-render-state]')).toHaveLength(1)
  expect(container.querySelector('[data-framekit-render-root]')).toBeNull()
  expect(container.textContent).toBe('')

  const marker = container.querySelector('main')
  expect(marker).not.toBeNull()
  if (marker === null) return

  expect(marker.getAttribute('data-framekit-render-state')).toBe('error')
  expect(marker.getAttribute('data-framekit-render-error')).toBe(code)
  expect([...marker.attributes].map(({ name }) => name)).toEqual([
    'data-framekit-render-state',
    'data-framekit-render-error'
  ])
}

afterEach(() => {
  for (const mounted of mountedRenders.splice(0)) mounted.unmount()
  registryState.templates.length = 0
})

describe('private render client', () => {
  it('starts loading without a capture root', () => {
    const pending = deferred<{ default: TemplateDefinition }>()
    setEntries(makeEntry({ load: () => pending.promise }))

    const view = mount(makePayload())

    expect(view.container.querySelector('[data-framekit-render-state="loading"]')).not.toBeNull()
    expect(view.container.querySelector('[data-framekit-render-root]')).toBeNull()
  })

  it('renders one exact-size ready root with the resolved payload', async () => {
    const payload = makePayload()
    let observedProps: TestRenderProps | undefined
    const definition = makeDefinition({
      render: (props) => {
        observedProps = props
        return <span>{props.data.title}</span>
      }
    })
    setEntries(makeEntry({ definition }))

    const view = mount(payload)
    expect(view.container.querySelector('[data-framekit-render-state="ready"]')).toBeNull()
    await settle()

    const ready = view.container.querySelector('main[data-framekit-render-state="ready"]')
    const roots = view.container.querySelectorAll<HTMLDivElement>('[data-framekit-render-root]')
    const root = roots[0]

    expect(ready).not.toBeNull()
    expect(roots).toHaveLength(1)
    expect(ready?.children).toHaveLength(1)
    expect(ready?.firstElementChild).toBe(root)
    expect(root?.style.width).toBe('320px')
    expect(root?.style.height).toBe('180px')
    expect(root?.textContent).toBe('Payload title')
    expect(observedProps?.data).toBe(payload.data)
    expect(observedProps?.assets).toBe(payload.assets)
    expect(observedProps?.variant).toBe(payload.variant)
    expect(observedProps?.width).toBe(payload.width)
    expect(observedProps?.height).toBe(payload.height)
    expect(ready?.querySelector('[data-framekit-render-root]')).toBe(root)
    expect(view.container.querySelectorAll('main[data-framekit-render-state="ready"]:not(:has([data-framekit-render-root]))')).toHaveLength(0)
  })

  it('uses only a coarse marker for an unknown entry', async () => {
    setEntries()
    const view = mount(makePayload())

    await settle()

    expectCoarseError(view.container, 'template_not_found')
  })

  it('uses only a coarse marker for a rejected loader', async () => {
    setEntries(makeEntry({
      load: async () => {
        throw new Error('private loader failure')
      }
    }))
    const view = mount(makePayload())

    await settle()

    expectCoarseError(view.container, 'template_load_failed')
    expect(view.container.innerHTML).not.toContain('private loader failure')
  })

  it('uses only a coarse marker for an invalid definition', async () => {
    setEntries(makeEntry({
      load: async () => ({ default: {} as TemplateDefinition })
    }))
    const view = mount(makePayload())

    await settle()

    expectCoarseError(view.container, 'invalid_definition')
  })

  it('uses only a coarse marker for a dimension mismatch', async () => {
    setEntries(makeEntry({ definition: makeDefinition({ width: 321 }) }))
    const view = mount(makePayload())

    await settle()

    expectCoarseError(view.container, 'job_definition_mismatch')
  })

  it('uses only a coarse marker for a missing variant', async () => {
    setEntries(makeEntry())
    const view = mount(makePayload({ variant: 'fr' }))

    await settle()

    expectCoarseError(view.container, 'job_definition_mismatch')
  })

  it('does not briefly reuse the previous ready definition after a payload change', async () => {
    const firstPayload = makePayload()
    const secondPayload = makePayload({ data: { title: 'New payload title' } })
    const firstDefinition = makeDefinition()
    const secondLoad = deferred<{ default: TemplateDefinition }>()
    let loadCount = 0
    setEntries(makeEntry({
      definition: firstDefinition,
      load: () => {
        loadCount += 1
        return loadCount === 1
          ? Promise.resolve({ default: firstDefinition })
          : secondLoad.promise
      }
    }))

    const view = mount(firstPayload)
    await settle()
    expect(view.container.querySelector('[data-framekit-render-state="ready"]')).not.toBeNull()

    view.rerender(secondPayload)

    expect(view.container.querySelector('[data-framekit-render-state="loading"]')).not.toBeNull()
    expect(view.container.querySelector('[data-framekit-render-root]')).toBeNull()

    secondLoad.resolve({ default: firstDefinition })
    await settle()

    expect(view.container.querySelector('[data-framekit-render-state="ready"]')).not.toBeNull()
    expect(view.container.querySelector('[data-framekit-render-root]')?.textContent).toBe('New payload title')
  })

  it('reports render exceptions without a ready root or diagnostic payload', async () => {
    const payload = makePayload({ data: { title: 'secret payload value' } })
    const definition = makeDefinition({
      render: () => {
        throw new Error('secret thrown message')
      }
    })
    setEntries(makeEntry({ definition }))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    const view = mount(payload)
    await settle()

    expectCoarseError(view.container, 'render_component_failed')
    expect(view.container.querySelector('[data-framekit-render-state="ready"]')).toBeNull()
    expect(view.container.innerHTML).not.toContain('secret payload value')
    expect(view.container.innerHTML).not.toContain('secret thrown message')
    expect(view.container.innerHTML).not.toContain('/assets/logo.svg')
  })
})
