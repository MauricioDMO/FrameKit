import type { EditorFieldProps } from '../../types'

export function BooleanField({ field, value, onChange, error }: EditorFieldProps) {
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
        className="pointer-events-none absolute inset-0 rounded-full bg-[#d6d5ce] transition-colors peer-checked:bg-[#39775f] peer-focus-visible:ring-3 peer-focus-visible:ring-[#39775f]/20 dark:bg-white/20 dark:peer-checked:bg-[#77c99a]"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1 left-1 size-4 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5 dark:bg-[#e6eee9] dark:peer-checked:bg-[#10271f]"
      />
    </span>
  )
}
