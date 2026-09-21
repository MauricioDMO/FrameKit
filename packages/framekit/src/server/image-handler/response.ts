import { isPlainObject } from '@/core/validation/utils'
import type { TemplateDataValidationError } from '@/core/validation'
import { ImageRenderError } from '@/server/errors'
import type { ImageRenderErrorCode } from '@/server/errors'
import { publicMessageFor } from './errors'

const statusByCode: Record<ImageRenderErrorCode, number> = {
  invalid_request: 400,
  unauthorized: 401,
  template_not_found: 404,
  request_too_large: 413,
  unsupported_image: 415,
  invalid_template_data: 422,
  image_host_not_allowed: 422,
  image_fetch_failed: 502,
  api_not_configured: 503,
  render_capacity_exhausted: 503,
  render_timeout: 504,
  render_failed: 500
}

function safeFields (value: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
  if (value === undefined) return undefined

  const fields: Record<string, unknown> = Object.create(null)
  for (const [key, rawError] of Object.entries(value)) {
    if (!isPlainObject(rawError) || typeof rawError.code !== 'string') continue

    const code = rawError.code as TemplateDataValidationError['code']
    if (code === 'required' || code === 'invalid_number' || code === 'invalid_color' || code === 'invalid_choice' || code === 'invalid_boolean') {
      fields[key] = { code }
      continue
    }

    if (code === 'number_too_small' || code === 'number_too_large') {
      const bound = rawError[code === 'number_too_small' ? 'min' : 'max']
      if (typeof bound === 'number' && Number.isFinite(bound)) fields[key] = { code, [code === 'number_too_small' ? 'min' : 'max']: bound }
      continue
    }

    if (code === 'invalid_step') {
      if (typeof rawError.step === 'number' && Number.isFinite(rawError.step)) fields[key] = { code, step: rawError.step }
      continue
    }

    if (code === 'text_too_short' || code === 'text_too_long') {
      const length = rawError[code === 'text_too_short' ? 'minLength' : 'maxLength']
      if (typeof length === 'number' && Number.isFinite(length)) fields[key] = { code, [code === 'text_too_short' ? 'minLength' : 'maxLength']: length }
    }
  }

  return Object.keys(fields).length === 0 ? undefined : fields
}

export function errorResponse (error: ImageRenderError): Response {
  const body: { error: ImageRenderErrorCode; message: string; fields?: Record<string, unknown> } = {
    error: error.code,
    message: publicMessageFor(error.code)
  }
  if (error.code === 'invalid_template_data') {
    const fields = safeFields(error.fields)
    if (fields !== undefined) body.fields = fields
  }

  const headers = new Headers({
    'Cache-Control': 'no-store',
    'Content-Type': 'application/json'
  })
  if (error.code === 'unauthorized') headers.set('WWW-Authenticate', 'Bearer')
  if (error.code === 'render_capacity_exhausted') headers.set('Retry-After', '1')

  return new Response(JSON.stringify(body), { status: statusByCode[error.code], headers })
}

export function successResponse (slug: string, bytes: Buffer): Response {
  return new Response(bytes as unknown as BodyInit, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Disposition': `inline; filename="${slug.replaceAll('/', '-')}.png"`,
      'Content-Length': String(bytes.byteLength),
      'Content-Type': 'image/png',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}
