import type { ReactNode } from 'react'

export type TemplateFieldKind = 'text' | 'textarea' | 'number' | 'color' | 'image'

export type ImageFieldScope = 'common' | 'variant'

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

export interface NumberFieldDescriptor extends BaseFieldDescriptor {
  kind: 'number'
  min?: number
  max?: number
}

export interface ImageFieldDescriptor extends BaseFieldDescriptor {
  kind: 'image'
  scope?: ImageFieldScope
}

export type FieldDescriptor =
  | TextFieldDescriptor
  | TextareaFieldDescriptor
  | ColorFieldDescriptor
  | NumberFieldDescriptor
  | ImageFieldDescriptor

export interface TemplateAssetManifest {
  common: Record<string, string>
  variants: Record<string, Record<string, string>>
}

export type TemplateFields = Record<string, FieldDescriptor>

export interface TemplateMeta {
  [key: string]: unknown
}

export interface TemplateVariants {
  default: string
  labels?: Record<string, string>
  [key: string]: unknown
}

export type TemplateContentEntry<Fields extends TemplateFields> =
  Partial<Record<Exclude<keyof Fields, 'language'> & string, string>>

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
  [Variant in keyof Content]: Content[Variant] & Record<
    Exclude<keyof Content[Variant], keyof Fields>,
    never
  >
}

export interface TemplateBase<
  Fields extends TemplateFields = TemplateFields,
  Content extends TemplateContent<Fields> = TemplateContent<Fields>,
  Width extends number = number,
  Height extends number = number,
  Meta extends TemplateMeta = TemplateMeta,
  Variants extends TemplateVariants = TemplateVariants,
> {
  meta: Meta
  width: Width
  height: Height
  fields: Fields
  variants: Variants
  content: Content
}

export interface TemplateDefinition<
  Fields extends TemplateFields = TemplateFields,
  Content extends TemplateContent<Fields> = TemplateContent<Fields>,
  Width extends number = number,
  Height extends number = number,
  Meta extends TemplateMeta = TemplateMeta,
  Variants extends TemplateVariants = TemplateVariants,
> extends TemplateBase<Fields, Content, Width, Height, Meta, Variants> {
  render(props: TemplateRenderProps<TemplateBase<Fields, Content, Width, Height, Meta, Variants>>): ReactNode
}

export interface TemplateRenderProps<
  Definition extends TemplateBase = TemplateDefinition,
> {
  data: { -readonly [K in keyof Definition['fields']]: string }
  assets: TemplateAssetManifest
  variant: keyof Definition['content'] & string
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
  Meta extends TemplateMeta,
  Variants extends TemplateVariants,
> = {
  meta: Meta
  width: Width
  height: Height
  fields: Fields
  variants: Variants
  content: Content & NoUnknownContentKeys<Content, Fields>
}
