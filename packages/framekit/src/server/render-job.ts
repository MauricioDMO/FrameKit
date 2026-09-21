import { randomBytes, timingSafeEqual } from 'node:crypto'

import type { ResolvedRenderPayload } from '@/types'

const renderJobsSymbol = Symbol.for('framekit.server.render-jobs')
const renderJobTtlMs = 120_000
const renderJobBytes = 32
const maximumCollisionRetries = 8
const identifierPattern = /^[a-f0-9]{64}$/

interface RenderJobRecord {
  token: string
  payload: ResolvedRenderPayload
  createdAt: number
  expiresAt: number
}

interface RenderJobStoreState {
  jobs: Map<string, RenderJobRecord>
}

export interface CreatedRenderJob {
  id: string
  token: string
}

export interface RenderJobTestOptions {
  now?: () => number
  randomBytes?: (size: number) => Buffer
}

function getRenderJobStore (): RenderJobStoreState {
  const globalState = globalThis as typeof globalThis & {
    [renderJobsSymbol]?: RenderJobStoreState
  }

  if (globalState[renderJobsSymbol] === undefined) {
    globalState[renderJobsSymbol] = { jobs: new Map() }
  }

  return globalState[renderJobsSymbol]
}

function deleteExpiredRenderJobs (now: number): void {
  for (const [id, job] of getRenderJobStore().jobs) {
    if (job.expiresAt <= now) getRenderJobStore().jobs.delete(id)
  }
}

function createIdentifier (options: RenderJobTestOptions): string {
  return (options.randomBytes ?? randomBytes)(renderJobBytes).toString('hex')
}

function hasValidIdentifier (value: string): boolean {
  return identifierPattern.test(value)
}

function tokensMatch (provided: string, expected: string): boolean {
  const providedBytes = Buffer.from(provided, 'utf8')
  const expectedBytes = Buffer.from(expected, 'utf8')
  const length = Math.max(providedBytes.length, expectedBytes.length)
  const normalizedProvided = Buffer.alloc(length)
  const normalizedExpected = Buffer.alloc(length)
  providedBytes.copy(normalizedProvided)
  expectedBytes.copy(normalizedExpected)

  return timingSafeEqual(normalizedProvided, normalizedExpected) && providedBytes.length === expectedBytes.length
}

export function createRenderJob (
  payload: ResolvedRenderPayload,
  options: RenderJobTestOptions = {}
): CreatedRenderJob {
  const now = (options.now ?? Date.now)()
  const store = getRenderJobStore()
  deleteExpiredRenderJobs(now)

  for (let attempt = 0; attempt < maximumCollisionRetries; attempt += 1) {
    const id = createIdentifier(options)
    if (store.jobs.has(id)) continue

    const token = createIdentifier(options)
    store.jobs.set(id, {
      token,
      payload,
      createdAt: now,
      expiresAt: now + renderJobTtlMs
    })
    return { id, token }
  }

  throw new Error('Unable to allocate a render job identifier')
}

export function loadRenderRequest (
  id: string,
  token: string,
  options: RenderJobTestOptions = {}
): ResolvedRenderPayload | undefined {
  if (!hasValidIdentifier(id) || !hasValidIdentifier(token)) return undefined

  const now = (options.now ?? Date.now)()
  const store = getRenderJobStore()
  deleteExpiredRenderJobs(now)
  const job = store.jobs.get(id)
  if (!job || !tokensMatch(token, job.token)) return undefined

  return job.payload
}

export function deleteRenderJob (id: string): void {
  if (!hasValidIdentifier(id)) return
  getRenderJobStore().jobs.delete(id)
}
