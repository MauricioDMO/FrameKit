import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import path from 'node:path'

import { findTemplates } from '../discovery/find-templates'

const maxAssetBytes = 8_000_000
const maxRequestBytes = 12_000_000
const fieldKeyPattern = /^[A-Za-z0-9][A-Za-z0-9_-]*$/
const variantPattern = /^[A-Za-z0-9][A-Za-z0-9_-]*$/
const mimeExtensions: Record<string, string> = {
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

class AssetUploadError extends Error {
  constructor(public readonly statusCode: number, message: string) {
    super(message)
  }
}

function sendJson(response: ServerResponse, statusCode: number, body: Record<string, string>): void {
  const payload = JSON.stringify(body)
  response.statusCode = statusCode
  response.setHeader('content-type', 'application/json; charset=utf-8')
  response.setHeader('content-length', Buffer.byteLength(payload))
  response.end(payload)
}

async function readBody(request: IncomingMessage): Promise<string> {
  const declaredLength = Number(request.headers['content-length'] ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > maxRequestBytes) {
    throw new AssetUploadError(413, 'La solicitud de asset es demasiado grande')
  }

  const chunks: Buffer[] = []
  let length = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    length += buffer.length
    if (length > maxRequestBytes) {
      throw new AssetUploadError(413, 'La solicitud de asset es demasiado grande')
    }
    chunks.push(buffer)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function decodeAsset(data: string): Buffer {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(data) || data.length % 4 !== 0) {
    throw new AssetUploadError(400, 'Los datos del asset no son base64 válido')
  }

  const bytes = Buffer.from(data, 'base64')
  if (bytes.length === 0 || bytes.length > maxAssetBytes) {
    throw new AssetUploadError(413, 'El asset supera el límite de 8 MB')
  }
  if (bytes.toString('base64') !== data) {
    throw new AssetUploadError(400, 'Los datos del asset no son base64 válido')
  }
  return bytes
}

function validateImageSignature(mimeType: string, bytes: Buffer): void {
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8
  const isWebp = bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP'
  const isGif = bytes.subarray(0, 4).toString('ascii') === 'GIF8'

  const valid = mimeType === 'image/png' ? isPng : mimeType === 'image/jpeg' ? isJpeg : mimeType === 'image/webp' ? isWebp : isGif
  if (!valid) throw new AssetUploadError(415, 'El contenido no coincide con el tipo de imagen declarado')
}

async function replaceAsset(
  projectRoot: string,
  input: {
    templateSlug: string
    variant: string
    fieldKey: string
    mimeType: string
    data: string
  },
): Promise<void> {
  if (!fieldKeyPattern.test(input.fieldKey) || input.fieldKey === 'language') {
    throw new AssetUploadError(400, 'La key del field no es válida')
  }
  if (input.variant !== 'common' && !variantPattern.test(input.variant)) {
    throw new AssetUploadError(400, 'La variante no es válida')
  }

  const extension = mimeExtensions[input.mimeType]
  if (!extension) throw new AssetUploadError(415, 'Tipo de imagen no soportado')
  const bytes = decodeAsset(input.data)
  validateImageSignature(input.mimeType, bytes)

  const templatesDirectory = path.join(projectRoot, 'src', 'templates')
  const templates = await findTemplates(templatesDirectory)
  const template = templates.find((candidate) => candidate.slug === input.templateSlug)
  if (!template) throw new AssetUploadError(404, 'La plantilla no existe')

  const assetsDirectory = path.join(template.absolutePath, 'assets', input.variant)
  await mkdir(assetsDirectory, { recursive: true })

  for (const entry of await readdir(assetsDirectory, { withFileTypes: true })) {
    const extension = path.extname(entry.name).toLowerCase()
    if (!entry.isFile() || !['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'].includes(extension)) continue
    if (entry.name.slice(0, -extension.length) !== input.fieldKey) continue
    await unlink(path.join(assetsDirectory, entry.name))
  }

  await writeFile(path.join(assetsDirectory, `${input.fieldKey}${extension}`), bytes)
}

export async function handleAssetUpload(
  request: IncomingMessage,
  response: ServerResponse,
  options: { projectRoot: string; regenerate: () => Promise<void> },
): Promise<boolean> {
  const pathname = new URL(request.url ?? '/', 'http://framekit.local').pathname
  if (pathname !== '/__framekit/assets') return false

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
      data: body.data,
    })
    await options.regenerate()
    sendJson(response, 200, { status: 'ok' })
  } catch (error) {
    const normalized = error instanceof AssetUploadError ? error : new AssetUploadError(500, String(error))
    sendJson(response, normalized.statusCode, { error: normalized.message })
  }

  return true
}
