import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createStudioPage } from '@/studio/page'

const pageMocks = vi.hoisted(() => {
  const notFoundError = new Error('NEXT_NOT_FOUND')
  return {
    notFound: vi.fn(() => {
      throw notFoundError
    }),
    notFoundError
  }
})

vi.mock('next/navigation', () => ({ notFound: pageMocks.notFound }))

function StudioClient () {
  return <div data-testid="studio-client" />
}

const StudioPage = createStudioPage(StudioClient)

async function renderPage (params: { section: string, slug?: string[] }) {
  return StudioPage({ params: Promise.resolve(params) })
}

beforeEach(() => {
  pageMocks.notFound.mockClear()
})

describe('createStudioPage', () => {
  it('renders the client without route or registry props for editor and brand sections', async () => {
    for (const section of ['editor', 'brand']) {
      const element = await renderPage({ section, slug: ['social', 'post'] }) as ReactElement

      expect(element.type).toBe(StudioClient)
      expect(Object.keys(element.props as Record<string, unknown>)).toEqual([])
    }

    expect(pageMocks.notFound).not.toHaveBeenCalled()
  })

  it('calls notFound for every section other than editor and brand', async () => {
    for (const section of ['', 'Editor', 'preview', 'editor/other']) {
      await expect(renderPage({ section })).rejects.toBe(pageMocks.notFoundError)
    }

    expect(pageMocks.notFound).toHaveBeenCalledTimes(4)
  })
})
