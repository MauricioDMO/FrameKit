import type { TemplateField } from '@/lib/templates/types'

interface EditorFieldProps {
  field: TemplateField
  value: string
  onChange: (value: string) => void
}

const controlClass =
  'w-full rounded-xl border border-[#d6d5ce] bg-[#fbfaf6] px-3.5 py-2.5 text-sm text-[#17221d] outline-none transition placeholder:text-[#9b9e98] focus:border-[#39775f] focus:ring-3 focus:ring-[#39775f]/10'

export function EditorField({ field, value, onChange }: EditorFieldProps) {
  const label = (
    <span className="mb-2 block text-xs font-bold uppercase tracking-[0.1em] text-[#59665f]">
      {field.label}
    </span>
  )

  if (field.type === 'textarea') {
    return (
      <label className="block">
        {label}
        <textarea
          rows={4}
          required={field.required}
          placeholder={field.placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={`${controlClass} resize-y`}
        />
      </label>
    )
  }

  if (field.type === 'color') {
    const pickerValue = /^#[\da-f]{6}$/i.test(value) ? value : '#000000'

    return (
      <label className="block">
        {label}
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={pickerValue}
            onChange={(event) => onChange(event.target.value)}
            className="h-11 w-14 shrink-0 cursor-pointer rounded-xl border border-[#d6d5ce] bg-[#fbfaf6] p-1"
          />
          <input
            type="text"
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={controlClass}
          />
        </div>
      </label>
    )
  }

  return (
    <label className="block">
      {label}
      <input
        type={field.type === 'url' ? 'text' : field.type}
        inputMode={field.type === 'url' ? 'url' : undefined}
        required={field.required}
        placeholder={field.placeholder}
        min={field.min}
        max={field.max}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={controlClass}
      />
    </label>
  )
}
