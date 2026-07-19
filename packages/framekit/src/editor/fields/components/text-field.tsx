import { controlClass } from '../shared'
import type { EditorFieldProps } from '../../types'

export function TextField({ field, value, onChange, error }: EditorFieldProps) {
  return <input name={field.key} type="text" required={field.required} aria-required={field.required} aria-invalid={error !== undefined} placeholder={field.placeholder} value={value} onChange={(event) => onChange(event.target.value)} className={controlClass} />
}
