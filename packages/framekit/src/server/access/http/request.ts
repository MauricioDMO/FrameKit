import { isPlainObject } from '../../../core/validation/utils'

import { AccessError, fail } from './errors'

const accessRequestLimit = 64 * 1024

function isJsonContentType (value: string | null): boolean {
  return value !== null && /^application\/json(?:\s*;\s*charset\s*=\s*(?:utf-8|"utf-8"))?\s*$/i.test(value)
}

function validateRequestMetadata (request: Request): void {
  if (!isJsonContentType(request.headers.get('content-type'))) fail('invalid_request', 400)

  const contentEncoding = request.headers.get('content-encoding')?.trim().toLowerCase()
  if (contentEncoding !== undefined && contentEncoding !== '' && contentEncoding !== 'identity') fail('invalid_request', 400)

  const declaredLength = request.headers.get('content-length')
  if (declaredLength === null) return

  const normalizedLength = declaredLength.trim()
  if (!/^\d+$/.test(normalizedLength)) fail('invalid_request', 400)

  const length = Number(normalizedLength)
  if (!Number.isFinite(length) || length > accessRequestLimit) fail('request_too_large', 413)
}

export async function readAccessJson (request: Request): Promise<unknown> {
  validateRequestMetadata(request)

  const body = request.body
  if (body === null) fail('invalid_request', 400)

  let reader: ReadableStreamDefaultReader<Uint8Array>
  try {
    reader = body.getReader()
  } catch {
    fail('invalid_request', 400)
  }

  const decoder = new TextDecoder('utf-8', { fatal: true })
  const text: string[] = []
  let length = 0
  let cancelPromise: Promise<void> | undefined

  const cancelReader = (): Promise<void> => {
    cancelPromise ??= Promise.resolve().then(() => reader.cancel()).catch(() => undefined)
    return cancelPromise
  }

  try {
    while (true) {
      const result = await reader.read()
      if (result.done) break

      length += result.value.byteLength
      if (length > accessRequestLimit) fail('request_too_large', 413)
      text.push(decoder.decode(result.value, { stream: true }))
    }

    text.push(decoder.decode())
    try {
      return JSON.parse(text.join('')) as unknown
    } catch {
      fail('invalid_request', 400)
    }
  } catch (error) {
    await cancelReader()
    if (error instanceof AccessError) throw error
    fail('invalid_request', 400)
  } finally {
    if (cancelPromise !== undefined) await cancelPromise
    reader.releaseLock()
  }
}

export function exactBody (
  value: unknown,
  keys: readonly string[],
  optionalKeys: readonly string[] = []
): Record<string, unknown> {
  if (!isPlainObject(value)) fail('invalid_request', 400)

  const actualKeys = Object.keys(value)
  const allowedKeys = [...keys, ...optionalKeys]
  if (actualKeys.length === 0 || actualKeys.some((key) => !allowedKeys.includes(key)) || keys.some((key) => !Object.hasOwn(value, key))) {
    fail('invalid_request', 400)
  }

  return value
}
