import { isPlainObject } from '../utils'

const VARIANT_KEYS = new Set(['default', 'labels'])

export function validateVariants (variants: unknown): string | undefined {
  if (!isPlainObject(variants)) {
    return 'variants must be a plain object'
  }

  for (const key of Object.keys(variants)) {
    if (!VARIANT_KEYS.has(key)) {
      return `variants contains unknown property "${key}"`
    }
  }

  if (typeof variants.default !== 'string' || variants.default.trim() === '') {
    return 'variants.default must be a non-empty string'
  }

  if (variants.labels !== undefined) {
    if (!isPlainObject(variants.labels)) {
      return 'variants.labels must be a plain object'
    }

    for (const [key, label] of Object.entries(variants.labels)) {
      if (typeof label !== 'string' || label.trim() === '') {
        return `variants.labels.${key} must be a non-empty string`
      }
    }
  }
}
