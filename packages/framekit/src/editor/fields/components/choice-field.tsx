import { controlClass } from '../shared'
import type { EditorFieldProps } from '../../types'

export function ChoiceField({ field, value, onChange, error }: EditorFieldProps) {
  const options = field.options ?? []
  const stringValue = typeof value === 'string' ? value : ''
  const hasDeclaredValue = options.some((option) => option.value === stringValue)

  return (
    <select
      name={field.key}
      aria-label={field.label}
      aria-invalid={error !== undefined}
      aria-describedby={error ? `${field.key}-error` : undefined}
      value={stringValue}
      onChange={(event) => onChange(event.target.value)}
      className={controlClass}
    >
      {!hasDeclaredValue && <option value={stringValue} hidden disabled>{stringValue}</option>}
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}
