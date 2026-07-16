import { controlClass } from '../shared'
import type { EditorFieldProps } from '../types'

export function TextareaField({ field, value, onChange }: EditorFieldProps) {
  return (
    <textarea
      name={field.key}
      rows={4}
      required={field.required}
      placeholder={field.placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${controlClass} resize-y`}
    />
  )
}
