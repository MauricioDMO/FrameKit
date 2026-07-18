import type { getMessages } from '@/i18n/messages'
import type { TemplateDefinition } from '@/lib/framekit'

import { EditorField } from '../fields'

interface EditorControlsProps {
  definition: TemplateDefinition
  messages: ReturnType<typeof getMessages>['editor']
  selectedLocale: string
  data: Record<string, string>
  errors: Record<string, string>
  onLocaleChange: (locale: string) => void
  onFieldChange: (key: string, value: string) => void
}

export function EditorControls({
  definition,
  messages,
  selectedLocale,
  data,
  errors,
  onLocaleChange,
  onFieldChange,
}: EditorControlsProps) {
  return (
    <aside className="rounded-2xl border border-black/8 bg-[#faf9f5] p-4 shadow-[0_6px_24px_rgba(45,53,48,0.05)] xl:min-h-0 xl:overflow-y-auto dark:border-white/10 dark:bg-[#1d2923]">
      <div className="flex items-baseline justify-between border-b border-black/8 pb-3 dark:border-white/10">
        <h2 className="font-black tracking-tight">{messages.content}</h2>
        <span className="text-xs text-[#5f6963] dark:text-[#b8c8be]">{definition.width} × {definition.height}</span>
      </div>
      <div className="mt-4 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[11px] font-bold tracking-widest text-[#59665f] uppercase dark:text-[#b8c8be]">
            {messages.contentLanguageLabel}
          </span>
          <select
            value={selectedLocale}
            onChange={(event) => onLocaleChange(event.target.value)}
            className="studio-select w-full rounded-xl border border-[#d6d5ce] bg-[#fbfaf6] px-3 py-2 text-sm font-bold text-[#17221d] transition outline-none focus:border-[#39775f] focus:ring-3 focus:ring-[#39775f]/10 dark:border-white/15 dark:bg-[#24342c] dark:text-[#e6eee9]"
          >
            {Object.entries(definition.content).map(([value, contentEntry]) => (
              <option key={value} value={value}>{contentEntry.language}</option>
            ))}
          </select>
        </label>
        {Object.entries(definition.fields).map(([key, field]) => (
          <div key={key} data-field-key={key}>
            <EditorField
              field={{
                key,
                type: field.kind,
                required: field.required ?? true,
                min: field.kind === 'number' ? field.min : undefined,
                max: field.kind === 'number' ? field.max : undefined,
                label: field.label,
                placeholder: field.placeholder,
              }}
              value={data[key] ?? ''}
              onChange={(value) => onFieldChange(key, value)}
              error={errors[key]}
            />
          </div>
        ))}
      </div>
    </aside>
  )
}
