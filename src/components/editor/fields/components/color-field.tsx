import { controlClass } from '../shared'
import type { EditorFieldProps } from '../types'

export function ColorField({ field, value, onChange, error }: EditorFieldProps) {
  const pickerValue = /^#[\da-f]{6}$/i.test(value) ? value : '#000000'
  const hexValue = value.replace(/^#+/, '')
  const pickerId = `${field.key}-picker`

  return (
    <div className="flex items-center gap-2">
      <input
        id={pickerId}
        name={field.key}
        type="color"
        required={field.required}
        value={pickerValue}
        onChange={(event) => onChange(event.target.value)}
        className="sr-only"
      />
      <label
        htmlFor={pickerId}
        aria-label={`Seleccionar ${field.label}`}
        className="h-10 w-12 shrink-0 cursor-pointer rounded-xl border border-[#d6d5ce] p-1 dark:border-white/15"
      >
        <span
          aria-hidden="true"
          className="block size-full rounded-lg"
          style={{ backgroundColor: pickerValue }}
        />
      </label>
      <div className={`${controlClass} flex h-10 items-center gap-1 px-3 py-0`}>
        <span
          aria-hidden="true"
          className="text-base text-[#59665f] dark:text-[#b8c8be]"
        >
          #
        </span>
        <input
          name={`${field.key}-value`}
          type="text"
          required={field.required}
          value={hexValue}
          onChange={(event) => onChange(`#${event.target.value.replace(/^#+/, '')}`)}
          className="min-w-0 flex-1 bg-transparent text-base outline-none"
        />
      </div>
    </div>
  )
}
