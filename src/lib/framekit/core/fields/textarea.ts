import type { TextareaFieldDescriptor } from '../../types'

export function textarea(params: { label: string; placeholder?: string; required?: boolean; defaultValue?: string }): TextareaFieldDescriptor {
  return Object.freeze({ kind: 'textarea', ...params }) as TextareaFieldDescriptor
}
