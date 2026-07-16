export type TemplateData = Record<string, string>

export type TemplateFieldType =
  | 'text'
  | 'textarea'
  | 'url'
  | 'color'
  | 'number'

export interface TemplateField {
  key: string
  label: string
  type: TemplateFieldType
  placeholder?: string
  required?: boolean
  min?: number
  max?: number
}

export interface TemplateConfig {
  title: string
  description?: string
  order: number
  width: number
  height: number
  fileName?: string
  fields: TemplateField[]
  defaults: TemplateData
}

export interface FolderConfig {
  title: string
  order: number
}

export interface TemplateProps {
  data: TemplateData
  width: number
  height: number
}

export interface TemplateNavigationFolder {
  type: 'folder'
  id: string
  slug: string
  title: string
  order: number
  children: TemplateNavigationNode[]
}

export interface TemplateNavigationItem {
  type: 'template'
  id: string
  slug: string
  title: string
  description?: string
  order: number
  href: string
}

export type TemplateNavigationNode =
  | TemplateNavigationFolder
  | TemplateNavigationItem
