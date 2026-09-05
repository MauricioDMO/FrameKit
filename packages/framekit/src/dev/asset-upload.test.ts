// @vitest-environment node

import { mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'

import { describe, expect, it, vi } from 'vitest'

import { handleAssetUpload } from './asset-upload'

const templateSlug = 'social/post'
const variant = 'es'
const fieldKey = 'hero'
const oldAssetBytes = Buffer.from('old asset')
const newAssetBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02])

type UploadBody = {
  templateSlug: string
  variant: string
  fieldKey: string
  mimeType: string
  data: string
}

type RequestOptions = {
  method?: string
  contentType?: string
}

type TestResponse = ServerResponse & {
  body?: string
  headers: Record<string, string | number>
}

type ProjectFixture = {
  root: string
  assetsDirectory: string
  oldAsset: string
  newAsset: string
  traversalDirectory: string
}

function requestFor(body: string, { method = 'POST', contentType = 'application/json' }: RequestOptions = {}): IncomingMessage {
  const request = Readable.from([body]) as unknown as IncomingMessage
  Object.assign(request, {
    method,
    url: '/__framekit/assets',
    headers: { 'content-length': String(Buffer.byteLength(body)), 'content-type': contentType },
  })
  return request
}

function responseFor(): TestResponse {
  const headers: Record<string, string | number> = {}
  return {
    headers,
    setHeader(name: string, value: string | number) {
      headers[name.toLowerCase()] = value
    },
    end(this: TestResponse, body?: string) {
      this.body = body
    },
  } as unknown as TestResponse
}

function uploadBody(overrides: Partial<UploadBody> = {}): string {
  return JSON.stringify({
    templateSlug,
    variant,
    fieldKey,
    mimeType: 'image/png',
    data: newAssetBytes.toString('base64'),
    ...overrides,
  })
}

function expectJsonResponse(
  response: TestResponse,
  statusCode: number,
  body: Record<string, string>,
  additionalHeaders: Record<string, string | number> = {},
): void {
  const expectedBody = JSON.stringify(body)
  if (response.body === undefined) throw new Error('Expected a response body')

  expect(response.statusCode).toBe(statusCode)
  expect(response.body).toBe(expectedBody)
  expect(response.headers).toEqual({
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(expectedBody),
    ...additionalHeaders,
  })
}

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let resolve!: () => void
  const promise = new Promise<void>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

async function createProject(): Promise<ProjectFixture> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-upload-'))
  const template = path.join(root, 'src', 'templates', 'social', 'post')
  const assetsDirectory = path.join(template, 'assets', variant)
  const oldAsset = path.join(assetsDirectory, `${fieldKey}.jpg`)

  try {
    await mkdir(assetsDirectory, { recursive: true })
    await writeFile(path.join(template, 'template.tsx'), '')
    await writeFile(oldAsset, oldAssetBytes)
    return {
      root,
      assetsDirectory,
      oldAsset,
      newAsset: path.join(assetsDirectory, `${fieldKey}.png`),
      traversalDirectory: path.join(template, 'outside'),
    }
  } catch (error) {
    await rm(root, { recursive: true, force: true })
    throw error
  }
}

type ErrorCase = {
  name: string
  body: string
  method?: string
  contentType?: string
  statusCode: number
  error: string
  headers?: Record<string, string | number>
}

const errorCases: ErrorCase[] = [
  { name: 'method', method: 'GET', body: uploadBody(), statusCode: 405, error: 'Método no permitido', headers: { allow: 'POST' } },
  { name: 'content type', contentType: 'text/plain', body: uploadBody(), statusCode: 415, error: 'El upload debe usar application/json' },
  { name: 'JSON', body: '{not-json', statusCode: 400, error: 'El cuerpo del upload no es JSON válido' },
  { name: 'inputs', body: JSON.stringify({ templateSlug }), statusCode: 400, error: 'Faltan datos del asset' },
  { name: 'path traversal', body: uploadBody({ variant: '../outside' }), statusCode: 400, error: 'La variante no es válida' },
  { name: 'missing template', body: uploadBody({ templateSlug: 'missing' }), statusCode: 404, error: 'La plantilla no existe' },
]

describe('handleAssetUpload', () => {
  it('replaces a variant asset and regenerates the manifest', async () => {
    const project = await createProject()
    const regenerationStarted = deferred()
    const releaseRegeneration = deferred()
    const regenerate = vi.fn(async () => {
      regenerationStarted.resolve()
      await releaseRegeneration.promise
    })
    const response = responseFor()
    const upload = handleAssetUpload(requestFor(uploadBody()), response, { projectRoot: project.root, regenerate })

    try {
      await expect(readFile(project.oldAsset)).resolves.toEqual(oldAssetBytes)
      await regenerationStarted.promise
      expect(response.body).toBeUndefined()
      expect(response.headers).toEqual({})
      await expect(readFile(project.oldAsset)).rejects.toMatchObject({ code: 'ENOENT' })
      await expect(readFile(project.newAsset)).resolves.toEqual(newAssetBytes)

      releaseRegeneration.resolve()
      await expect(upload).resolves.toBe(true)
      expect(regenerate).toHaveBeenCalledOnce()
      expectJsonResponse(response, 200, { status: 'ok' })
    } finally {
      releaseRegeneration.resolve()
      await upload.catch(() => undefined)
      await rm(project.root, { recursive: true, force: true })
    }
  })

  it.each(errorCases)('returns a JSON error for $name without side effects', async ({ body, method, contentType, statusCode, error, headers }) => {
    const project = await createProject()
    const regenerate = vi.fn(async () => undefined)
    const response = responseFor()

    try {
      const entriesBefore = (await readdir(project.assetsDirectory)).sort()

      await expect(handleAssetUpload(requestFor(body, { method, contentType }), response, { projectRoot: project.root, regenerate })).resolves.toBe(true)

      expectJsonResponse(response, statusCode, { error }, headers)
      expect(regenerate).not.toHaveBeenCalled()
      await expect(readFile(project.oldAsset)).resolves.toEqual(oldAssetBytes)
      await expect(readdir(project.assetsDirectory).then((entries) => entries.sort())).resolves.toEqual(entriesBefore)
      await expect(stat(project.traversalDirectory)).rejects.toMatchObject({ code: 'ENOENT' })
    } finally {
      await rm(project.root, { recursive: true, force: true })
    }
  })
})
