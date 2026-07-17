import type { FieldDescriptor } from '../types'

export function getDefaultValues(fields: Record<string, FieldDescriptor>): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key in fields) {
    result[key] = fields[key].defaultValue ?? ''
  }
  return result
}
