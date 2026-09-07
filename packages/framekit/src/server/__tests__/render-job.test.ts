import { describe, expect, it } from 'vitest'

import { createRenderJob, deleteRenderJob, loadRenderRequest, type RenderJobTestOptions } from '@/server/render-job'
import type { ResolvedRenderPayload } from '@/server/config'

const payload: ResolvedRenderPayload = {
  template: 'social/post',
  variant: 'default',
  data: { title: 'Offer', count: 2, enabled: true },
  assets: { common: { logo: '/logo.png' }, variants: { default: { hero: '/hero.png' } } },
  width: 1080,
  height: 1080
}

function fixedRandomBytes (values: string[]): RenderJobTestOptions['randomBytes'] {
  let index = 0
  return () => Buffer.from(values[index++ % values.length], 'hex')
}

describe('render jobs', () => {
  it('creates and loads a job without exposing storage metadata', () => {
    const job = createRenderJob(payload, {
      now: () => 1_000,
      randomBytes: fixedRandomBytes([
        'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb'
      ])
    })

    expect(job).toEqual({
      id: 'a'.repeat(64),
      token: 'b'.repeat(64)
    })
    expect(loadRenderRequest(job.id, job.token, { now: () => 1_001 })).toBe(payload)
    expect((globalThis as Record<PropertyKey, unknown>)[Symbol.for('framekit.server.render-jobs')]).toBeDefined()

    deleteRenderJob(job.id)
    expect(loadRenderRequest(job.id, job.token)).toBeUndefined()
  })

  it('treats malformed, missing, wrong-token, and expired jobs identically', () => {
    const job = createRenderJob(payload, {
      now: () => 10_000,
      randomBytes: fixedRandomBytes([
        'cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc',
        'dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd'
      ])
    })
    const options = { now: () => 130_000 }

    expect(loadRenderRequest('malformed', job.token, options)).toBeUndefined()
    expect(loadRenderRequest('e'.repeat(64), 'malformed', options)).toBeUndefined()
    expect(loadRenderRequest(job.id, 'e'.repeat(64), options)).toBeUndefined()
    expect(loadRenderRequest(job.id, job.token, options)).toBeUndefined()
  })

  it('cleans expired jobs opportunistically and makes deletion idempotent', () => {
    const first = createRenderJob(payload, {
      now: () => 20_000,
      randomBytes: fixedRandomBytes([
        '1111111111111111111111111111111111111111111111111111111111111111',
        '2222222222222222222222222222222222222222222222222222222222222222'
      ])
    })

    createRenderJob(payload, {
      now: () => 140_000,
      randomBytes: fixedRandomBytes([
        '3333333333333333333333333333333333333333333333333333333333333333',
        '4444444444444444444444444444444444444444444444444444444444444444'
      ])
    })

    expect(loadRenderRequest(first.id, first.token)).toBeUndefined()
    expect(() => deleteRenderJob(first.id)).not.toThrow()
    expect(() => deleteRenderJob('invalid')).not.toThrow()
  })

  it('retries a collision and keeps concurrent jobs isolated', () => {
    const randomBytes = fixedRandomBytes([
      '5555555555555555555555555555555555555555555555555555555555555555',
      '6666666666666666666666666666666666666666666666666666666666666666',
      '5555555555555555555555555555555555555555555555555555555555555555',
      '7777777777777777777777777777777777777777777777777777777777777777',
      '8888888888888888888888888888888888888888888888888888888888888888'
    ])
    const first = createRenderJob(payload, { randomBytes })
    const second = createRenderJob(payload, { randomBytes })

    expect(second.id).toBe('7'.repeat(64))
    expect(loadRenderRequest(first.id, first.token)).toBe(payload)
    expect(loadRenderRequest(second.id, second.token)).toBe(payload)

    deleteRenderJob(first.id)
    expect(loadRenderRequest(first.id, first.token)).toBeUndefined()
    expect(loadRenderRequest(second.id, second.token)).toBe(payload)
    deleteRenderJob(second.id)
  })

  it('bounds collision retries', () => {
    const id = '9'.repeat(64)
    createRenderJob(payload, {
      randomBytes: fixedRandomBytes([id])
    })

    expect(() => createRenderJob(payload, {
      randomBytes: fixedRandomBytes([
        id
      ])
    })).toThrow('Unable to allocate a render job identifier')
  })
})
