import type { ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { createRenderJob } from '@/server/render-job'
import type { ResolvedRenderPayload } from '@/server/config'
import { createRenderPage } from '@/server/render-page'

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
  template: 'render-page/test',
  variant: 'default',
  data: { title: 'Private render payload' },
  assets: { common: {}, variants: { default: {} } },
  width: 320,
  height: 180
}

interface RenderClientProps {
  payload: ResolvedRenderPayload
}

function RenderClient ({ payload }: RenderClientProps) {
  return <div data-template={payload.template} />
}

const RenderPage = createRenderPage(RenderClient)

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

describe('private render page helper', () => {
  it('uses one notFound path for missing, malformed, expired, and wrong credentials', async () => {
    const validJob = createRenderJob(payload)
    const expiredJob = createRenderJob(payload, { now: () => 0 })
    const wrongToken = validJob.token === '0'.repeat(64) ? '1'.repeat(64) : '0'.repeat(64)
    const cases = [
      { id: validJob.id },
      { id: 'malformed-id', token: validJob.token },
      { id: validJob.id, token: 'malformed-token' },
      { id: expiredJob.id, token: expiredJob.token },
      { id: validJob.id, token: wrongToken }
    ]

    for (const testCase of cases) {
      setRenderToken(testCase.token)
      await expect(renderPage(testCase.id)).rejects.toBe(pageMocks.notFoundError)
    }

    expect(pageMocks.headers).toHaveBeenCalledTimes(cases.length)
    expect(pageMocks.notFound).toHaveBeenCalledTimes(cases.length)
  })

  it('passes only the resolved payload to the client', async () => {
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
    expect(pageMocks.notFound).not.toHaveBeenCalled()
  })
})
