import { ImageRenderError } from '../errors'
import type { ImageRenderErrorCode } from '../errors'

const publicMessageByCode: Record<ImageRenderErrorCode, string> = {
  invalid_request: 'Invalid request',
  unauthorized: 'Unauthorized',
  template_not_found: 'Template not found',
  request_too_large: 'Request body exceeds the size limit',
  unsupported_image: 'Image source is unsupported',
  invalid_template_data: 'Template data is invalid',
  image_host_not_allowed: 'Image host is not allowed',
  image_fetch_failed: 'Image fetch failed',
  api_not_configured: 'Image rendering API is not configured',
  render_capacity_exhausted: 'Maximum concurrent image renders exceeded',
  render_timeout: 'Image render timed out',
  render_failed: 'Image render failed'
}

export function publicMessageFor (code: ImageRenderErrorCode): string {
  return publicMessageByCode[code]
}

export function failure (
  code: ImageRenderErrorCode,
  cause?: unknown,
  fields?: Record<string, unknown>
): ImageRenderError {
  return new ImageRenderError({
    code,
    message: publicMessageFor(code),
    ...(fields === undefined ? {} : { fields }),
    cause
  })
}

export function invalidRequest (): never {
  throw failure('invalid_request')
}
