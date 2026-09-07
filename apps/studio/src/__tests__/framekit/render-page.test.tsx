import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRenderJob } from '@mauriciodmo/framekit/server'
import type { ResolvedRenderPayload } from '@mauriciodmo/framekit/server'

import RenderPage, {
  dynamic,
  fetchCache,
  metadata,
  revalidate,
  runtime
} from '@/app/__framekit/render/[id]/page'

const pageMocks = vi.hoisted(() => {
  const notFoundError = new Error('NEXT_NOT_FOUND')
  const state = { requestHeaders: new Headers() }

  return {
    state,
    headers: vi.fn(async () => state.requestHeaders),
    notFound: vi.fn(() => {
      throw notFoundError
    }),
    notFoundError
  }
})

vi.mock('next/headers', () => ({ headers: pageMocks.headers }))
vi.mock('next/navigation', () => ({ notFound: pageMocks.notFound }))

const payload: ResolvedRenderPayload = {
  template: 'render-route/test',
  variant: 'en',
  data: { title: 'Private render payload' },
  assets: { common: {}, variants: { en: {} } },
  width: 320,
  height: 180
}

function setRenderToken (token?: string): void {
  pageMocks.state.requestHeaders = token === undefined
    ? new Headers()
    : new Headers({ 'x-framekit-render-token': token })
}

async function renderPage (id: string) {
  return RenderPage({ params: Promise.resolve({ id }) })
}

beforeEach(() => {
  pageMocks.state.requestHeaders = new Headers()
  pageMocks.headers.mockClear()
  pageMocks.notFound.mockClear()
})

describe('private render page', () => {
  it('exports the private route runtime, cache, and crawler settings', () => {
    expect(runtime).toBe('nodejs')
    expect(dynamic).toBe('force-dynamic')
    expect(revalidate).toBe(0)
    expect(fetchCache).toBe('force-no-store')
    expect(metadata).toMatchObject({ robots: { index: false, follow: false } })
  })

  it('returns one indistinguishable notFound result for invalid lookups', async () => {
    const validJob = createRenderJob(payload)
    const expiredJob = createRenderJob(payload, { now: () => 0 })
    const wrongToken = validJob.token === '0'.repeat(64) ? '1'.repeat(64) : '0'.repeat(64)
    const cases = [
      { id: 'f'.repeat(64), token: validJob.token },
      { id: 'malformed-id', token: validJob.token },
      { id: validJob.id, token: 'malformed-token' },
      { id: expiredJob.id, token: expiredJob.token },
      { id: validJob.id, token: wrongToken },
      { id: validJob.id }
    ]

    for (const testCase of cases) {
      setRenderToken(testCase.token)
      await expect(renderPage(testCase.id)).rejects.toBe(pageMocks.notFoundError)
    }

    expect(pageMocks.headers).toHaveBeenCalledTimes(cases.length)
    expect(pageMocks.notFound).toHaveBeenCalledTimes(cases.length)
  })

  it('hands the resolved payload to the client without credentials or job metadata', async () => {
    const job = createRenderJob(payload)
    setRenderToken(job.token)

    const element = await renderPage(job.id) as ReactElement
    const props = element.props as Record<string, unknown>

    expect(Object.keys(props)).toEqual(['payload'])
    expect(props.payload).toBe(payload)
    expect(props).not.toHaveProperty('token')
    expect(props).not.toHaveProperty('createdAt')
    expect(props).not.toHaveProperty('expiresAt')
    expect(pageMocks.headers).toHaveBeenCalledOnce()
  })
})
