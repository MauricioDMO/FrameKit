import type { EditorFieldProps } from '../../types'

export function BooleanField ({ field, value, onChange, error }: EditorFieldProps) {
  return (
    <span className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer">
      <input
        name={field.key}
        type="checkbox"
        role="switch"
        aria-label={field.label}
        aria-checked={value === true}
        aria-invalid={error !== undefined}
        aria-describedby={error ? `${field.key}-error` : undefined}
        checked={value === true}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-full bg-fk-ivory-400 transition-colors peer-checked:bg-fk-mint-300 peer-focus-visible:ring-3 peer-focus-visible:ring-fk-mint-300/20 dark:bg-white/20"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5 peer-checked:bg-white dark:bg-fk-sage-100 dark:peer-checked:bg-fk-forest-400"
      />
    </span>
  )
}
