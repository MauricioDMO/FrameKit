import type { BooleanFieldDescriptor } from '../../types'

export function boolean(params: { label: string; defaultValue?: boolean }): BooleanFieldDescriptor {
  return Object.freeze({ kind: 'boolean', label: params.label, defaultValue: params.defaultValue === undefined ? false : params.defaultValue })
}
