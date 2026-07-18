import type { TemplateFieldKind } from '../types'

export interface EditorMessages {
  templateEditor: string
  reset: string
  generating: string
  downloadPng: string
  content: string
  preview: string
  actualSize: string
  fitToView: string
  contentLanguageLabel: string
  exportError: string
  exportAlert: string
  errorRequired: string
  errorInvalidNumber: string
  errorNumberTooSmall: string
  errorNumberTooLarge: string
  errorInvalidUrl: string
}

export interface TemplateField {
  key: string
  type: TemplateFieldKind
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
