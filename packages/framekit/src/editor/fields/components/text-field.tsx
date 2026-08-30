import { controlClass } from '../shared'
import type { EditorFieldProps } from '../../types'

export function TextField({ field, value, onChange, error }: EditorFieldProps) {
  return <textarea
    name={field.key}
    aria-label={field.label}
    required={field.required}
    aria-required={field.required}
    aria-invalid={error !== undefined}
    aria-describedby={error ? `${field.key}-error` : undefined}
    placeholder={field.placeholder}
    minLength={field.minLength}
    maxLength={field.maxLength}
    value={typeof value === 'string' ? value : ''}
    onChange={(event) => onChange(event.target.value)}
    className={`${controlClass} studio-textarea`}
  />
}
