import type { TemplateBase } from '../types'

export function getVariants(definition: TemplateBase): string[] {
  return Object.keys(definition.content)
}
