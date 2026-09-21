import { assertRasterSignature, type RasterMimeType } from '@/shared/raster-image'
import { ImageRenderError } from '@/server/errors'
import {
  canonicalDataUrl,
  hasControlCharacters,
  imageFetchFailed,
  imageHostNotAllowed,
  imageTooLarge,
  maxImageBytes,
  maxRedirects,
  rasterMimeTypes,
  redirectStatuses,
  rethrowAbort,
  throwIfAborted,
  unsupportedImage
} from './shared'
import { hasCredentialsInAuthority, hasInvalidPortSyntax, validateRemoteTarget } from './remote-target'

function parseContentType (value: string | null): RasterMimeType | undefined {
  if (!value) return undefined
  const mimeType = value.split(';', 1)[0].trim().toLowerCase()
  return rasterMimeTypes.has(mimeType as RasterMimeType) ? mimeType as RasterMimeType : undefined
}

function parseContentLength (value: string | null): number | undefined {
  if (value === null) return undefined
  const normalized = value.trim()
  if (!/^\d+$/.test(normalized)) return Number.NaN

  const length = Number(normalized)
  return length
}

async function cancelResponse (response: Response, signal: AbortSignal | undefined): Promise<void> {
  try {
    await response.body?.cancel()
  } catch (error) {
    rethrowAbort(error, signal)
  }
  throwIfAborted(signal)
}

async function readResponseBytes (response: Response, signal: AbortSignal | undefined): Promise<Buffer> {
  if (!response.body) unsupportedImage()

  const reader = response.body.getReader()
  const chunks: Buffer[] = []
  let length = 0

  try {
    while (true) {
      throwIfAborted(signal)
      const result = await reader.read()
      if (result.done) break

      throwIfAborted(signal)
      const chunk = Buffer.from(result.value)
      length += chunk.length
      if (length > maxImageBytes) {
        try {
          await reader.cancel()
        } catch (error) {
          rethrowAbort(error, signal)
        }
        throwIfAborted(signal)
        imageTooLarge()
      }
      chunks.push(chunk)
    }
  } catch (error) {
    rethrowAbort(error, signal)
    if (error instanceof ImageRenderError) throw error
    imageFetchFailed()
  } finally {
    reader.releaseLock()
  }

  return Buffer.concat(chunks, length)
}

export async function fetchRemoteRasterImage (
  initialUrl: URL,
  allowedImageHosts: ReadonlySet<string>,
  signal: AbortSignal | undefined
): Promise<string> {
  let url = initialUrl
  let redirects = 0

  while (true) {
    throwIfAborted(signal)

    let response: Response
    try {
      response = await fetch(url.href, { redirect: 'manual', signal })
    } catch (error) {
      rethrowAbort(error, signal)
      imageFetchFailed()
    }
    throwIfAborted(signal)

    if (redirectStatuses.has(response.status)) {
      if (redirects >= maxRedirects) {
        await cancelResponse(response, signal)
        imageFetchFailed()
      }

      const location = response.headers.get('location')
      await cancelResponse(response, signal)
      if (
        !location ||
        location !== location.trim() ||
        hasControlCharacters(location) ||
        location.includes('\\') ||
        location.includes('#') ||
        hasCredentialsInAuthority(location) ||
        hasInvalidPortSyntax(location) ||
        location.startsWith('//')
      ) {
        imageFetchFailed()
      }

      let redirectUrl: URL
      try {
        redirectUrl = new URL(location, url)
      } catch {
        imageFetchFailed()
      }

      const target = validateRemoteTarget(redirectUrl, allowedImageHosts)
      if (!target.ok) {
        if (target.reason === 'host_not_allowed') imageHostNotAllowed()
        imageFetchFailed()
      }

      url = target.url
      redirects += 1
      continue
    }

    if (response.status < 200 || response.status >= 300) {
      await cancelResponse(response, signal)
      imageFetchFailed()
    }

    const mimeType = parseContentType(response.headers.get('content-type'))
    if (!mimeType) {
      await cancelResponse(response, signal)
      unsupportedImage()
    }
    const contentLength = parseContentLength(response.headers.get('content-length'))
    if (contentLength !== undefined && Number.isNaN(contentLength)) {
      await cancelResponse(response, signal)
      imageFetchFailed()
    }
    if (contentLength !== undefined && (!Number.isSafeInteger(contentLength) || contentLength > maxImageBytes)) {
      await cancelResponse(response, signal)
      imageTooLarge()
    }
    const bytes = await readResponseBytes(response, signal)

    try {
      assertRasterSignature(mimeType, bytes)
    } catch {
      unsupportedImage()
    }

    return canonicalDataUrl(mimeType, bytes)
  }
}
