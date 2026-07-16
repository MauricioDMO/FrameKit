import { controlClass } from '../shared'
import type { EditorFieldProps } from '../types'

export function ColorField({ field, value, onChange }: EditorFieldProps) {
  const pickerValue = /^#[\da-f]{6}$/i.test(value) ? value : '#000000'

  return (
    <div className="flex items-center gap-2">
      <input
        name={field.key}
        type="color"
        required={field.required}
        value={pickerValue}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-[#d6d5ce] bg-[#fbfaf6] p-1"
      />
      <input
        name={`${field.key}-value`}
        type="text"
        required={field.required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
      />
    </div>
  )
}
