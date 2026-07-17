import type { ReactNode } from 'react'

export type TemplateFieldKind = 'text' | 'textarea' | 'number' | 'color' | 'url'

export interface BaseFieldDescriptor {
  label: string
  placeholder?: string
  required?: boolean
  defaultValue?: string
}

export interface TextFieldDescriptor extends BaseFieldDescriptor {
  kind: 'text'
}

export interface TextareaFieldDescriptor extends BaseFieldDescriptor {
  kind: 'textarea'
}

export interface ColorFieldDescriptor extends BaseFieldDescriptor {
  kind: 'color'
}

export interface UrlFieldDescriptor extends BaseFieldDescriptor {
  kind: 'url'
}

export interface NumberFieldDescriptor extends BaseFieldDescriptor {
  kind: 'number'
  min?: number
  max?: number
}

export type FieldDescriptor =
  | TextFieldDescriptor
  | TextareaFieldDescriptor
  | ColorFieldDescriptor
  | UrlFieldDescriptor
  | NumberFieldDescriptor

type NoLanguageFields<Fields extends Record<string, FieldDescriptor>> =
  Extract<keyof Fields, 'language'> extends never ? unknown : 'fields.language is reserved'

export interface TemplateDefinition {
  width: number
  height: number
  fields: Record<string, FieldDescriptor>
  content: Record<string, { language: string } & Record<string, string>>
  render(props: TemplateRenderProps): ReactNode
}

export interface TemplateRenderProps<
  Fields extends Record<string, FieldDescriptor> = Record<string, FieldDescriptor>,
  Locales extends Record<string, unknown> = Record<string, { language: string }>,
> {
  data: { [K in keyof Fields]: string }
  locale: keyof Locales & string
  width: number
  height: number
}

export type InferTemplateData<Def extends TemplateDefinition> =
  { [K in keyof Def['fields']]: string }

export function defineTemplate<const Def extends TemplateDefinition>(
  def: Def & NoLanguageFields<Def['fields']>
): Def {
  if (def.width <= 0 || !Number.isFinite(def.width)) {
    throw new Error('width must be a positive finite number')
  }
  if (def.height <= 0 || !Number.isFinite(def.height)) {
    throw new Error('height must be a positive finite number')
  }
  const fieldKeys = Object.keys(def.fields)
  if (fieldKeys.includes('language')) {
    throw new Error('fields.language is reserved')
  }
  if (Object.keys(def.content).length === 0) {
    throw new Error('content must have at least one entry')
  }
  return def
}
