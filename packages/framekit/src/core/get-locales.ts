import type { TemplateDefinition } from '../types'

export function getLocales(definition: TemplateDefinition): string[] {
  return Object.keys(definition.content)
}
