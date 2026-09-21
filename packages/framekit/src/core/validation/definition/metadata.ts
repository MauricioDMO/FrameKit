import { isPlainObject } from '@/core/validation/utils'

const META_KEYS = new Set(['title', 'description', 'marketingDescription', 'tags'])

export function validateMetadata (meta: unknown): string | undefined {
  if (!isPlainObject(meta)) {
    return 'meta must be a plain object'
  }

  for (const key of Object.keys(meta)) {
    if (!META_KEYS.has(key)) {
      return `meta contains unknown property "${key}"`
    }
  }

  if (typeof meta.title !== 'string' || meta.title.trim() === '') {
    return 'meta.title must be a non-empty string'
  }
  if (meta.description !== undefined && typeof meta.description !== 'string') {
    return 'meta.description must be a string'
  }
  if (meta.marketingDescription !== undefined && typeof meta.marketingDescription !== 'string') {
    return 'meta.marketingDescription must be a string'
  }
  if (meta.tags !== undefined) {
    if (!Array.isArray(meta.tags)) {
      return 'meta.tags must be an array of strings'
    }
    for (const tag of meta.tags) {
      if (typeof tag !== 'string') {
        return 'meta.tags must be an array of strings'
      }
    }
  }
}
