export type ImageRenderErrorCode =
  | 'invalid_request'
  | 'unauthorized'
  | 'template_not_found'
  | 'request_too_large'
  | 'unsupported_image'
  | 'invalid_template_data'
  | 'image_host_not_allowed'
  | 'image_fetch_failed'
  | 'api_not_configured'
  | 'render_capacity_exhausted'
  | 'render_timeout'
  | 'render_failed'

export interface ImageRenderFailure {
  code: ImageRenderErrorCode
  message: string
  fields?: Record<string, unknown>
  cause?: unknown
}

const imageRenderErrorCodes = new Set<ImageRenderErrorCode>([
  'invalid_request',
  'unauthorized',
  'template_not_found',
  'request_too_large',
  'unsupported_image',
  'invalid_template_data',
  'image_host_not_allowed',
  'image_fetch_failed',
  'api_not_configured',
  'render_capacity_exhausted',
  'render_timeout',
  'render_failed'
])

function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export class ImageRenderError extends Error {
  readonly code: ImageRenderErrorCode
  readonly fields?: Record<string, unknown>
  readonly cause?: unknown

  constructor (failure: ImageRenderFailure) {
    if (
      !isRecord(failure) ||
      typeof failure.code !== 'string' ||
      !imageRenderErrorCodes.has(failure.code as ImageRenderErrorCode)
    ) {
      throw new TypeError('Invalid image render error code')
    }
    if (typeof failure.message !== 'string') {
      throw new TypeError('Image render error message must be a string')
    }
    if (failure.fields !== undefined && (failure.code !== 'invalid_template_data' || !isRecord(failure.fields))) {
      throw new TypeError('Image render error fields are not allowed')
    }

    const code = failure.code as ImageRenderErrorCode
    const message = failure.message
    const fields = failure.fields as Record<string, unknown> | undefined
    const cause = failure.cause

    super(message)
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'ImageRenderError'
    this.code = code
    if (fields !== undefined) this.fields = fields
    Object.defineProperty(this, 'cause', {
      configurable: false,
      enumerable: false,
      value: cause,
      writable: false
    })
  }

  toSafeFailure (): Omit<ImageRenderFailure, 'cause'> {
    const failure: Omit<ImageRenderFailure, 'cause'> = {
      code: this.code,
      message: this.message
    }
    if (this.fields !== undefined) failure.fields = this.fields
    return failure
  }

  toJSON (): Omit<ImageRenderFailure, 'cause'> {
    return this.toSafeFailure()
  }
}
