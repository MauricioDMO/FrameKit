// @vitest-environment node

import { readFile, readdir, rm, stat } from 'node:fs/promises'

import { describe, expect, it, vi } from 'vitest'

import { handleAssetUpload } from '@/tooling/dev/asset-upload/index'

import type { ErrorCase } from './support'
import {
  createProject,
  expectJsonResponse,
  oldAssetBytes,
  requestFor,
  responseFor,
  templateSlug,
  uploadBody
} from './support'

const oversizedAssetData = Buffer.alloc(8_000_001).toString('base64')

const errorCases: ErrorCase[] = [
  { name: 'method', method: 'GET', body: uploadBody(), statusCode: 405, error: 'Método no permitido', headers: { allow: 'POST' } },
  { name: 'content type', contentType: 'text/plain', body: uploadBody(), statusCode: 415, error: 'El upload debe usar application/json' },
  { name: 'JSON', body: '{not-json', statusCode: 400, error: 'El cuerpo del upload no es JSON válido' },
  { name: 'inputs', body: JSON.stringify({ templateSlug }), statusCode: 400, error: 'Faltan datos del asset' },
  { name: 'malformed base64', body: uploadBody({ data: 'not base64' }), statusCode: 400, error: 'Los datos del asset no son base64 válido' },
  { name: 'empty asset', body: uploadBody({ data: '' }), statusCode: 413, error: 'El asset supera el límite de 8 MB' },
  { name: 'oversized asset', body: uploadBody({ data: oversizedAssetData }), statusCode: 413, error: 'El asset supera el límite de 8 MB' },
  { name: 'signature mismatch', body: uploadBody({ mimeType: 'image/jpeg' }), statusCode: 415, error: 'El contenido no coincide con el tipo de imagen declarado' },
  { name: 'unsupported MIME type', body: uploadBody({ mimeType: 'image/svg+xml' }), statusCode: 415, error: 'Tipo de imagen no soportado' },
  { name: 'path traversal', body: uploadBody({ variant: '../outside' }), statusCode: 400, error: 'La variante no es válida' },
  { name: 'missing template', body: uploadBody({ templateSlug: 'missing' }), statusCode: 404, error: 'La plantilla no existe' }
]

describe('handleAssetUpload errors', () => {
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
