import type { TemplateFieldKind } from '@/lib/framekit'

export type TemplateFieldType = TemplateFieldKind

export interface TemplateField {
  key: string
  type: TemplateFieldType
  required: boolean
  min?: number
  max?: number
  label: string
  placeholder?: string
}

export interface EditorFieldProps {
  field: TemplateField
  value: string
  onChange: (value: string) => void
  error?: string
}
