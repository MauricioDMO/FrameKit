import type { IncomingMessage, ServerResponse } from 'node:http'

import { readBody } from './request'
import { AssetUploadError, sendJson } from './errors'
import { replaceAsset } from './storage'

export async function handleAssetUpload (
  request: IncomingMessage,
  response: ServerResponse,
  options: { projectRoot: string; regenerate: () => Promise<void> }
): Promise<boolean> {
  const pathname = new URL(request.url ?? '/', 'http://framekit.local').pathname
  if (pathname !== '/framekit/assets') return false

  if (request.method !== 'POST') {
    response.setHeader('allow', 'POST')
    sendJson(response, 405, { error: 'Método no permitido' })
    return true
  }

  if (!request.headers['content-type']?.toLowerCase().startsWith('application/json')) {
    sendJson(response, 415, { error: 'El upload debe usar application/json' })
    return true
  }

  try {
    let body: Record<string, unknown>
    try {
      body = JSON.parse(await readBody(request)) as Record<string, unknown>
    } catch (error) {
      if (error instanceof AssetUploadError) throw error
      throw new AssetUploadError(400, 'El cuerpo del upload no es JSON válido')
    }
    if (
      typeof body.templateSlug !== 'string' ||
      typeof body.variant !== 'string' ||
      typeof body.fieldKey !== 'string' ||
      typeof body.mimeType !== 'string' ||
      typeof body.data !== 'string'
    ) {
      throw new AssetUploadError(400, 'Faltan datos del asset')
    }

    await replaceAsset(options.projectRoot, {
      templateSlug: body.templateSlug,
      variant: body.variant,
      fieldKey: body.fieldKey,
      mimeType: body.mimeType,
      data: body.data
    })
    await options.regenerate()
    sendJson(response, 200, { status: 'ok' })
  } catch (error) {
    const normalized = error instanceof AssetUploadError ? error : new AssetUploadError(500, String(error))
    sendJson(response, normalized.statusCode, { error: normalized.message })
  }

  return true
}
