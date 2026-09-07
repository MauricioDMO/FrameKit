import type { IncomingMessage } from 'node:http'

import { AssetUploadError } from './errors'

const maxRequestBytes = 12_000_000

export async function readBody (request: IncomingMessage): Promise<string> {
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
