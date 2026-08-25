import type { TemplateDefinition } from '../types'

export function getVariants(definition: TemplateDefinition): string[] {
  return Object.keys(definition.content)
}
