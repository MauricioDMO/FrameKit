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

  const editsPrototype = edits && typeof edits === 'object' ? Object.getPrototypeOf(edits) : undefined
  if (editsPrototype !== Object.prototype && editsPrototype !== null) {
    throw new Error('edits must be a plain object')
  }

  const result = getDefaultValues(definition.fields) as Record<string, string | number | boolean>
  const fieldKeys = new Set(Object.keys(definition.fields))
  const variantContent = definition.content[variant]

  function applyValues(values: Record<string, string | number | boolean | undefined>, source: string): void {
    for (const [key, value] of Object.entries(values)) {
      if (!fieldKeys.has(key)) {
        throw new Error(`${source} contains unknown field key "${key}"`)
      }
      const expectedType = definition.fields[key].kind === 'boolean' ? 'boolean' : definition.fields[key].kind === 'number' ? 'number' : 'string'
      if (typeof value !== expectedType || (expectedType === 'number' && !Number.isFinite(value))) {
        throw new Error(`${source}.${key} must be a ${expectedType}`)
      }
      result[key] = value as string | number | boolean
    }
  }

  applyValues(variantContent, `content.${variant}`)
  applyValues(edits, 'edits')

  for (const [key, field] of Object.entries(definition.fields)) {
    if (field.kind !== 'image') continue

    const source = field.scope === 'common'
      ? assets.common[key]
      : assets.variants[variant]?.[key] ?? assets.common[key]

    if (source) result[key] = source
  }

  return result as InferTemplateData<Definition>
}
