import type { ReactNode } from 'react'

export type TemplateFieldKind = 'text' | 'number' | 'color' | 'image' | 'choice' | 'boolean'

export type ImageFieldScope = 'common' | 'variant'

export interface BaseFieldDescriptor {
  label: string
  placeholder?: string
  required?: boolean
  defaultValue?: string
}

export interface TextFieldDescriptor extends BaseFieldDescriptor {
  kind: 'text'
  minLength?: number
  maxLength?: number
}

export interface ColorFieldDescriptor extends BaseFieldDescriptor {
  kind: 'color'
}

export interface NumberFieldDescriptor {
  kind: 'number'
  label: string
  placeholder?: string
  defaultValue: number
  min?: number
  max?: number
  step?: number
  control?: 'input' | 'slider'
}

export interface ImageFieldDescriptor extends BaseFieldDescriptor {
  kind: 'image'
  scope?: ImageFieldScope
}

export interface ChoiceFieldDescriptor<OptionValue extends string = string> {
  kind: 'choice'
  label: string
  options: readonly { value: OptionValue; label: string }[]
  defaultValue: OptionValue
}

export interface BooleanFieldDescriptor {
  kind: 'boolean'
  label: string
  defaultValue?: boolean
}

export type FieldDescriptor =
  | TextFieldDescriptor
  | ColorFieldDescriptor
  | NumberFieldDescriptor
  | ImageFieldDescriptor
  | ChoiceFieldDescriptor
  | BooleanFieldDescriptor

export interface TemplateAssetManifest {
  common: Record<string, string>
  variants: Record<string, Record<string, string>>
}

export type TemplateFields = Record<string, FieldDescriptor>

type InferFieldValue<Field> =
  Field extends { kind: 'number' }
    ? number
    : Field extends { kind: 'boolean' }
    ? boolean
    : Field extends {
        kind: 'choice'
        options: readonly { value: infer OptionValue extends string }[]
      }
      ? OptionValue
      : string

type InferFieldsData<Fields> = {
  -readonly [K in keyof Fields]: InferFieldValue<Fields[K]>
}

export interface TemplateMeta {
  title: string
  description?: string
  marketingDescription?: string
  tags?: string[]
}

export interface TemplateVariants {
  default: string
  labels?: Record<string, string>
}

export type TemplateContentEntry<Fields extends TemplateFields> = Partial<{
  [Key in Exclude<keyof Fields, 'language'> & string]: InferFieldValue<Fields[Key]>
}>

export type TemplateContent<Fields extends TemplateFields> = Record<
  string,
  TemplateContentEntry<Fields>
>

export type NoLanguageFields<Fields extends TemplateFields> =
  Extract<keyof Fields, 'language'> extends never ? unknown : 'fields.language is reserved'

export type NoUnknownMetaKeys<Meta extends TemplateMeta> =
  Exclude<keyof Meta, keyof TemplateMeta> extends never
    ? unknown
    : { [Key in Exclude<keyof Meta, keyof TemplateMeta>]: never }

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

export interface TemplateRegistryEntry {
  slug: string
  segments: string[]
  meta: TemplateMeta
  width: number
  height: number
  variants: TemplateVariants
  variantKeys: string[]
  assets: TemplateAssetManifest
  load: () => Promise<{ default: TemplateDefinition }>
}

export interface TemplateRenderProps<
  Definition extends TemplateBase = TemplateDefinition,
> {
  data: InferTemplateData<Definition>
  assets: TemplateAssetManifest
  variant: keyof Definition['content'] & string
  width: Definition['width']
  height: Definition['height']
}

export type InferTemplateData<Def extends TemplateBase> = InferFieldsData<Def['fields']>

export type TemplateInput<
  Fields extends TemplateFields,
  Content extends TemplateContent<Fields>,
  Width extends number,
  Height extends number,
  Meta extends TemplateMeta,
  Variants extends TemplateVariants,
> = {
  meta: Meta & NoUnknownMetaKeys<Meta>
  width: Width
  height: Height
  fields: Fields
  variants: Variants
  content: Content & NoUnknownContentKeys<Content, Fields>
}
