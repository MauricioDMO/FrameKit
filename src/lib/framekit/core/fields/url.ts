import type { UrlFieldDescriptor } from '../../types'

export function url(params: { label: string; placeholder?: string; required?: boolean; defaultValue?: string }): UrlFieldDescriptor {
  return Object.freeze({ kind: 'url', ...params }) as UrlFieldDescriptor
}
