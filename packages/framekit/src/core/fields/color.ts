import type { ColorFieldDescriptor } from '../../types'

export function color(params: { label: string; placeholder?: string; required?: boolean; defaultValue?: string }): ColorFieldDescriptor {
  return Object.freeze({ kind: 'color', ...params }) as ColorFieldDescriptor
}
