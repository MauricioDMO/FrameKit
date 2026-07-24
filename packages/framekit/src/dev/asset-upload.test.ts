// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { Readable } from 'node:stream'

import { describe, expect, it, vi } from 'vitest'

import { handleAssetUpload } from './asset-upload'

function requestFor(body: string): IncomingMessage {
  const request = Readable.from([body]) as unknown as IncomingMessage
  Object.assign(request, {
    method: 'POST',
    url: '/__framekit/assets',
    headers: { 'content-length': String(Buffer.byteLength(body)), 'content-type': 'application/json' },
  })
  return request
}

function responseFor(): ServerResponse & { body?: string } {
  return {
    setHeader: vi.fn(),
    end(this: ServerResponse & { body?: string }, body?: string) {
      this.body = body
    },
  } as unknown as ServerResponse & { body?: string }
}

describe('handleAssetUpload', () => {
  it('replaces a variant asset and regenerates the manifest', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-upload-'))
    const template = path.join(root, 'src', 'templates', 'social', 'post')
    const bytes = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
    const regenerate = vi.fn(async () => undefined)

    try {
      await mkdir(template, { recursive: true })
      await writeFile(path.join(template, 'template.tsx'), '')
      const body = JSON.stringify({
        templateSlug: 'social/post',
        variant: 'es',
        fieldKey: 'hero',
        filename: 'photo.png',
        mimeType: 'image/png',
        data: bytes.toString('base64'),
      })
      const response = responseFor()

      await expect(handleAssetUpload(requestFor(body), response, { projectRoot: root, regenerate })).resolves.toBe(true)
      await expect(readFile(path.join(template, 'assets', 'es', 'hero.png'))).resolves.toEqual(bytes)
      expect(regenerate).toHaveBeenCalledOnce()
      expect(response.statusCode).toBe(200)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
