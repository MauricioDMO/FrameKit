import type { RasterMimeType } from '../../shared/raster-image'
import { ImageRenderError } from '../errors'

export const maxImageBytes = 8_000_000
export const maxRedirects = 3
export const redirectStatuses = new Set([301, 302, 303, 307, 308])
export const rasterMimeTypes = new Set<RasterMimeType>(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])
export const loopbackHostnames = new Set(['localhost'])

export function unsupportedImage (): never {
  throw new ImageRenderError({ code: 'unsupported_image', message: 'Image source is unsupported' })
}

export function imageHostNotAllowed (): never {
  throw new ImageRenderError({ code: 'image_host_not_allowed', message: 'Image host is not allowed' })
}

export function imageFetchFailed (): never {
  throw new ImageRenderError({ code: 'image_fetch_failed', message: 'Image fetch failed' })
}

export function imageTooLarge (): never {
  throw new ImageRenderError({ code: 'request_too_large', message: 'Image exceeds the size limit' })
}

export function invalidTemplateData (): never {
  throw new ImageRenderError({ code: 'invalid_template_data', message: 'Template data is invalid' })
}

export function isAbortError (error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

function abortError (): Error {
  const error = new Error('The operation was aborted')
  error.name = 'AbortError'
  return error
}

export function throwIfAborted (signal: AbortSignal | undefined): void {
  if (signal?.aborted) throw signal.reason ?? abortError()
}

export function rethrowAbort (error: unknown, signal: AbortSignal | undefined): void {
  if (isAbortError(error)) throw error
  if (signal?.aborted) throw signal.reason ?? abortError()
}

export function canonicalDataUrl (mimeType: RasterMimeType, bytes: Uint8Array): string {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString('base64')}`
}

export function hasControlCharacters (value: string): boolean {
  return [...value].some((character) => character.charCodeAt(0) <= 0x1f || character.charCodeAt(0) === 0x7f)
}
