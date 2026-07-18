import { controlClass } from '../shared'
import type { EditorFieldProps } from '../types'

export function UrlField({ field, value, onChange }: EditorFieldProps) {
  return (
    <input
      name={field.key}
      type="text"
      inputMode="url"
      required={field.required}
      placeholder={field.placeholder}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={controlClass}
    />
  )
}
