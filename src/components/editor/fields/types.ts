import type { TemplateField } from '@/lib/templates/types'

export interface EditorFieldProps {
  field: TemplateField
  value: string
  onChange: (value: string) => void
  error?: string
}
