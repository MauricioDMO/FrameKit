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

export type TemplateFields = Record<string, FieldDescriptor>

export type TemplateContentEntry<Fields extends TemplateFields> = {
  language: string
} & Partial<Record<Exclude<keyof Fields, 'language'> & string, string>>

export type TemplateContent<Fields extends TemplateFields> = Record<
  string,
  TemplateContentEntry<Fields>
>

export type NoLanguageFields<Fields extends TemplateFields> =
  Extract<keyof Fields, 'language'> extends never ? unknown : 'fields.language is reserved'

export type NoUnknownContentKeys<
  Content extends TemplateContent<Fields>,
  Fields extends TemplateFields,
> = {
  [Locale in keyof Content]: Content[Locale] & Record<
    Exclude<keyof Content[Locale], 'language' | keyof Fields>,
    never
  >
}

export interface TemplateBase<
  Fields extends TemplateFields = TemplateFields,
  Content extends TemplateContent<Fields> = TemplateContent<Fields>,
  Width extends number = number,
  Height extends number = number,
> {
  width: Width
  height: Height
  fields: Fields
  content: Content
}

export interface TemplateDefinition<
  Fields extends TemplateFields = TemplateFields,
  Content extends TemplateContent<Fields> = TemplateContent<Fields>,
  Width extends number = number,
  Height extends number = number,
> extends TemplateBase<Fields, Content, Width, Height> {
  render(props: TemplateRenderProps<TemplateBase<Fields, Content, Width, Height>>): ReactNode
}

export interface TemplateRenderProps<
  Definition extends TemplateBase = TemplateDefinition,
> {
  data: { -readonly [K in keyof Definition['fields']]: string }
  locale: keyof Definition['content'] & string
  width: Definition['width']
  height: Definition['height']
}

export type InferTemplateData<Def extends TemplateBase> =
  { -readonly [K in keyof Def['fields']]: string }

export type TemplateInput<
  Fields extends TemplateFields,
  Content extends TemplateContent<Fields>,
  Width extends number,
  Height extends number,
> = {
  width: Width
  height: Height
  fields: Fields
  content: Content & NoUnknownContentKeys<Content, Fields>
}
