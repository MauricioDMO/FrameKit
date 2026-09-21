import type { TemplateDataValidationError } from '@/core/validation'

type ExportData = Record<string, string | number | boolean>

export class ExportValidationError extends Error {
  constructor (readonly fields: Record<string, TemplateDataValidationError>) {
    super('Image export data is invalid')
    Object.setPrototypeOf(this, new.target.prototype)
    this.name = 'ExportValidationError'
  }
}

function isRecord (value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function finiteNumber (value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function parseFieldError (value: unknown): TemplateDataValidationError | undefined {
  if (!isRecord(value) || typeof value.code !== 'string') return undefined

  switch (value.code) {
    case 'required':
    case 'invalid_number':
    case 'invalid_color':
    case 'invalid_choice':
    case 'invalid_boolean':
      return { code: value.code }
    case 'number_too_small':
      return finiteNumber(value.min) ? { code: value.code, min: value.min } : undefined
    case 'number_too_large':
      return finiteNumber(value.max) ? { code: value.code, max: value.max } : undefined
    case 'invalid_step':
      return finiteNumber(value.step) ? { code: value.code, step: value.step } : undefined
    case 'text_too_short':
      return finiteNumber(value.minLength) ? { code: value.code, minLength: value.minLength } : undefined
    case 'text_too_long':
      return finiteNumber(value.maxLength) ? { code: value.code, maxLength: value.maxLength } : undefined
    default:
      return undefined
  }
}

function parseValidationFields (value: unknown): Record<string, TemplateDataValidationError> | undefined {
  if (!isRecord(value)) return undefined

  const fields: Record<string, TemplateDataValidationError> = {}
  for (const [key, fieldError] of Object.entries(value)) {
    const parsed = parseFieldError(fieldError)
    if (parsed === undefined) return undefined
    fields[key] = parsed
  }
  return Object.keys(fields).length > 0 ? fields : undefined
}

async function throwExportFailure (response: Response): Promise<never> {
  const body: unknown = await response.json().catch(() => undefined)
  if (isRecord(body) && body.error === 'invalid_template_data') {
    const fields = parseValidationFields(body.fields)
    if (fields !== undefined) throw new ExportValidationError(fields)
  }

  throw new Error(`Image export failed with HTTP ${response.status}`)
}

async function requestImage (slug: string, variant: string, data: ExportData): Promise<Blob> {
  const response = await fetch('/api/framekit/images/render', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ template: slug, variant, data })
  })

  if (!response.ok) return throwExportFailure(response)

  const contentType = response.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase()
  if (contentType !== 'image/png') throw new Error('Image export returned an invalid content type')
  return response.blob()
}

export async function exportTemplate (slug: string, variant: string, data: ExportData) {
  const blob = await requestImage(slug, variant, data)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${slug.replaceAll('/', '-')}.png`
  document.body.append(link)
  try {
    link.click()
  } finally {
    URL.revokeObjectURL(url)
    link.remove()
  }
}

export async function copyTemplate (slug: string, variant: string, data: ExportData) {
  if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
    throw new Error('Image clipboard support is unavailable')
  }

  const blob = await requestImage(slug, variant, data)
  if (!document.hasFocus()) {
    await new Promise<void>((resolve) => {
      window.addEventListener('focus', () => resolve(), { once: true })
    })
  }
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
}
