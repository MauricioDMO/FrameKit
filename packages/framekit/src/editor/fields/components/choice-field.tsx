import { controlClass } from '../shared'
import type { EditorFieldProps } from '../../types'

export function ChoiceField({ field, value, onChange, error }: EditorFieldProps) {
  const options = field.options ?? []
  const hasDeclaredValue = options.some((option) => option.value === value)

  return (
    <select
      name={field.key}
      aria-label={field.label}
      aria-invalid={error !== undefined}
      aria-describedby={error ? `${field.key}-error` : undefined}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className={controlClass}
    >
      {!hasDeclaredValue && <option value={value} hidden disabled>{value}</option>}
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}
