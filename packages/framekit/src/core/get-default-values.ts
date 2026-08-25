import type { FieldDescriptor } from '../types'

type DefaultValues<Fields extends Record<string, FieldDescriptor>> = {
  -readonly [Key in keyof Fields]: Fields[Key] extends { kind: 'boolean' } ? boolean : string
}

export function getDefaultValues<const Fields extends Record<string, FieldDescriptor>>(fields: Fields): DefaultValues<Fields> {
  const result: Record<string, string | boolean> = {}
  for (const key in fields) {
    const field = fields[key]
    result[key] = field.kind === 'boolean' ? field.defaultValue ?? false : field.defaultValue ?? ''
  }
  return result as DefaultValues<Fields>
}
