import type { InferTemplateData, TemplateAssetManifest, TemplateBase } from '../types'
import { getDefaultValues } from './get-default-values'

const emptyAssets: TemplateAssetManifest = { common: {}, variants: {} }

export function resolveTemplateData<Definition extends TemplateBase>(
  definition: Definition,
  variant: string,
  edits: Partial<InferTemplateData<Definition>> & Record<string, string | number | boolean>,
  assets: TemplateAssetManifest = emptyAssets,
): InferTemplateData<Definition> {
  if (!Object.prototype.hasOwnProperty.call(definition.content, variant)) {
    throw new Error(`content variant "${variant}" is not defined`)
  }

  if (!edits || typeof edits !== 'object' || Array.isArray(edits)) {
    throw new Error('edits must be a plain object')
  }

  const result = getDefaultValues(definition.fields) as Record<string, string | number | boolean>
  const fieldKeys = new Set(Object.keys(definition.fields))
  const variantContent = definition.content[variant]

  for (const [key, value] of Object.entries(variantContent)) {
    if (!fieldKeys.has(key)) {
      throw new Error(`content.${variant} contains unknown field key "${key}"`)
    }
    const expectedType = definition.fields[key].kind === 'boolean' ? 'boolean' : definition.fields[key].kind === 'number' ? 'number' : 'string'
    if (typeof value !== expectedType || (expectedType === 'number' && !Number.isFinite(value))) {
      throw new Error(`content.${variant}.${key} must be a ${expectedType}`)
    }
    result[key] = value as string | number | boolean
  }

  for (const [key, value] of Object.entries(edits)) {
    if (!fieldKeys.has(key)) {
      throw new Error(`edits contains unknown field key "${key}"`)
    }
    const expectedType = definition.fields[key].kind === 'boolean' ? 'boolean' : definition.fields[key].kind === 'number' ? 'number' : 'string'
    if (typeof value !== expectedType || (expectedType === 'number' && !Number.isFinite(value))) {
      throw new Error(`edits.${key} must be a ${expectedType}`)
    }
    result[key] = value as string | number | boolean
  }

  for (const [key, field] of Object.entries(definition.fields)) {
    if (field.kind !== 'image') continue

    const source = field.scope === 'common'
      ? assets.common[key]
      : assets.variants[variant]?.[key] ?? assets.common[key]

    if (source) result[key] = source
  }

  return result as InferTemplateData<Definition>
}
