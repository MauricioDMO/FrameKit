import { controlClass } from '../shared'
import type { EditorFieldProps } from '../../types'

export function NumberField({ field, value, onChange }: EditorFieldProps) {
  return <input name={field.key} type="number" required={field.required} placeholder={field.placeholder} min={field.min} max={field.max} value={value} onChange={(event) => onChange(event.target.value)} className={controlClass} />
}
