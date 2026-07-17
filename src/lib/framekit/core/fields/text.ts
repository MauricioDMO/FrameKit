import type { TextFieldDescriptor } from '../../types'

export function text(params: { label: string; placeholder?: string; required?: boolean; defaultValue?: string }): TextFieldDescriptor {
  return Object.freeze({ kind: 'text', ...params }) as TextFieldDescriptor
}
