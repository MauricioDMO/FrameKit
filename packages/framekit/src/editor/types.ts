import type { TemplateDataValidationError } from '../core/validation'
import type { ImageFieldScope, TemplateFieldKind } from '../types'

export interface EditorMessages {
  templateEditor: string
  reset: string
  generating: string
  downloadPng: string
  copyPng?: string
  content: string
  preview: string
  actualSize: string
  fitToView: string
  contentVariantLabel: string
  exportError: string
  exportAlert: string
  errorRequired: string
  errorInvalidNumber: string
  errorNumberTooSmall: string
  errorNumberTooLarge: string
  errorInvalidStep: string
  errorTextTooShort: string
  errorTextTooLong: string
  errorInvalidColor: string
  errorInvalidChoice: string
  errorInvalidBoolean: string
  imageSelect: string
  imageUploading: string
  imageLoadError: string
  imageUploadError: string
}

export interface TemplateField {
  key: string
  type: TemplateFieldKind
  required: boolean
  min?: number
  max?: number
  step?: number
  control?: 'input' | 'slider'
  minLength?: number
  maxLength?: number
  scope?: ImageFieldScope
  options?: readonly { value: string; label: string }[]
  label: string
  placeholder?: string
}

export interface ImageFieldLabels {
  select: string
  uploading: string
  loadError: string
  uploadError: string
}

export interface EditorFieldProps {
  field: TemplateField
  value: string | number | boolean
  onChange: (value: string | number | boolean) => void
  error?: string
  onValidationError?: (error?: TemplateDataValidationError) => void
  imageLabels?: ImageFieldLabels
  onImageUpload?: (file: File) => Promise<void>
}
