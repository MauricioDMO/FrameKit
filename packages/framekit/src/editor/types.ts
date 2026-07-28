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
  contentLanguageLabel: string
  exportError: string
  exportAlert: string
  errorRequired: string
  errorInvalidNumber: string
  errorNumberTooSmall: string
  errorNumberTooLarge: string
  errorInvalidColor: string
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
  scope?: ImageFieldScope
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
  value: string
  onChange: (value: string) => void
  error?: string
  imageLabels?: ImageFieldLabels
  onImageUpload?: (file: File) => Promise<void>
}
