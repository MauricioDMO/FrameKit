import type { NumberFieldDescriptor } from '../../types'

export function number(params: { label: string; placeholder?: string; required?: boolean; defaultValue?: string; min?: number; max?: number }): NumberFieldDescriptor {
  return Object.freeze({
    kind: 'number',
    label: params.label,
    placeholder: params.placeholder,
    required: params.required,
    defaultValue: params.defaultValue !== undefined ? String(params.defaultValue) : undefined,
    min: params.min,
    max: params.max,
  }) as NumberFieldDescriptor
}
