import type { ImageFieldDescriptor, ImageFieldScope } from '../../types'

export function image(params: {
  label: string
  placeholder?: string
  required?: boolean
  defaultValue?: string
  scope?: ImageFieldScope
}): ImageFieldDescriptor {
  return Object.freeze({ kind: 'image', ...params }) as ImageFieldDescriptor
}
