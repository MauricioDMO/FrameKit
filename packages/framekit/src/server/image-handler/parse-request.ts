import { isPlainObject } from '../../core/validation/utils'
import type { ImageRenderRequest } from '../config'
import { invalidRequest } from './errors'

const requestKeys = new Set(['template', 'variant', 'data'])
const forbiddenKeys = new Set(['__proto__', 'prototype', 'constructor'])

function hasForbiddenKey (value: Record<string, unknown>): boolean {
  return Object.keys(value).some((key) => forbiddenKeys.has(key))
}

export function parseImageRequest (value: unknown): ImageRenderRequest {
  if (!isPlainObject(value) || hasForbiddenKey(value)) invalidRequest()

  if (Object.keys(value).some((key) => !requestKeys.has(key))) invalidRequest()
  if (!Object.hasOwn(value, 'template') || typeof value.template !== 'string' || value.template === '') invalidRequest()
  if (Object.hasOwn(value, 'variant') && (typeof value.variant !== 'string' || value.variant === '')) invalidRequest()
  if (Object.hasOwn(value, 'data') && (!isPlainObject(value.data) || hasForbiddenKey(value.data))) invalidRequest()

  return {
    template: value.template,
    ...(Object.hasOwn(value, 'variant') ? { variant: value.variant as string } : {}),
    data: Object.hasOwn(value, 'data') ? value.data as Record<string, unknown> : {}
  }
}
