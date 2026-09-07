import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'

import { expect } from 'vitest'

export const templateSlug = 'social/post'
export const variant = 'es'
export const fieldKey = 'hero'
export const oldAssetBytes = Buffer.from('old asset')
export const newAssetBytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x01, 0x02])

export type UploadBody = {
  templateSlug: string
  variant: string
  fieldKey: string
  mimeType: string
  data: string
}

export type RequestOptions = {
  method?: string
  contentType?: string
}

export type TestResponse = ServerResponse & {
  body?: string
  headers: Record<string, string | number>
}

export type ProjectFixture = {
  root: string
  assetsDirectory: string
  oldAsset: string
  newAsset: string
  traversalDirectory: string
}

export type ErrorCase = {
  name: string
  body: string
  method?: string
  contentType?: string
  statusCode: number
  error: string
  headers?: Record<string, string | number>
}

export function requestFor (body: string, { method = 'POST', contentType = 'application/json' }: RequestOptions = {}): IncomingMessage {
  const request = Readable.from([body]) as unknown as IncomingMessage
  Object.assign(request, {
    method,
    url: '/__framekit/assets',
    headers: { 'content-length': String(Buffer.byteLength(body)), 'content-type': contentType }
  })
  return request
}

export function responseFor (): TestResponse {
  const headers: Record<string, string | number> = {}
  return {
    headers,
    setHeader (name: string, value: string | number) {
      headers[name.toLowerCase()] = value
    },
    end (this: TestResponse, body?: string) {
      this.body = body
    }
  } as unknown as TestResponse
}

export function uploadBody (overrides: Partial<UploadBody> = {}): string {
  return JSON.stringify({
    templateSlug,
    variant,
    fieldKey,
    mimeType: 'image/png',
    data: newAssetBytes.toString('base64'),
    ...overrides
  })
}

export function expectJsonResponse (
  response: TestResponse,
  statusCode: number,
  body: Record<string, string>,
  additionalHeaders: Record<string, string | number> = {}
): void {
  const expectedBody = JSON.stringify(body)
  if (response.body === undefined) throw new Error('Expected a response body')

  expect(response.statusCode).toBe(statusCode)
  expect(response.body).toBe(expectedBody)
  expect(response.headers).toEqual({
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(expectedBody),
    ...additionalHeaders
  })
}

export async function createProject (): Promise<ProjectFixture> {
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
      traversalDirectory: path.join(template, 'outside')
    }
  } catch (error) {
    await rm(root, { recursive: true, force: true })
    throw error
  }
}
