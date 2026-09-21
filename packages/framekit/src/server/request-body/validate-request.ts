import { ImageRenderError } from '@/server/errors'

export const maxRequestBytes = 12_000_000

export function invalidRequest (): never {
  throw new ImageRenderError({ code: 'invalid_request', message: 'Invalid request' })
}

export function requestTooLarge (): never {
  throw new ImageRenderError({ code: 'request_too_large', message: 'Request body exceeds the size limit' })
}

function hasJsonContentType (value: string | null): boolean {
  return value !== null && /^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?\s*$/i.test(value)
}

function checkDeclaredLength (value: string | null): void {
  if (value === null) return

  const normalized = value.trim()
  if (!/^\d+$/.test(normalized)) invalidRequest()

  const length = Number(normalized)
  if (!Number.isFinite(length) || length > maxRequestBytes) requestTooLarge()
}

export function validateRequestMetadata (request: Request): void {
  if (!hasJsonContentType(request.headers.get('content-type'))) invalidRequest()

  const contentEncoding = request.headers.get('content-encoding')?.trim().toLowerCase()
  if (contentEncoding !== undefined && contentEncoding !== '' && contentEncoding !== 'identity') invalidRequest()
  checkDeclaredLength(request.headers.get('content-length'))
}
