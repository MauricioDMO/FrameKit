import { controlClass } from '../shared'
import type { EditorFieldProps } from '../types'

export function TextareaField({ field, value, onChange, error }: EditorFieldProps) {
  return (
    <textarea
      name={field.key}
      rows={3}
      required={field.required}
      placeholder={field.placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={`${controlClass} resize-y`}
    />
  )
}
