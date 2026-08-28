import type { TemplateBase } from '../../types'
import type { TemplateDataValidationError } from '../../core/validation'
import { EditorField } from '../fields'
import type { EditorMessages } from '../types'

interface EditorControlsProps {
  definition: TemplateBase
  messages: EditorMessages
  selectedVariant: string
  data: Record<string, string | number | boolean>
  errors: Record<string, string>
  onVariantChange: (variant: string) => void
  onFieldChange: (key: string, value: string | number | boolean) => void
  onFieldValidationError?: (key: string, error?: TemplateDataValidationError) => void
  onImageUpload?: (key: string, file: File, scope: 'common' | 'variant') => Promise<void>
}

export function EditorControls({ definition, messages, selectedVariant, data, errors, onVariantChange, onFieldChange, onFieldValidationError, onImageUpload }: EditorControlsProps) {
  return (
    <aside className="studio-editor-scrollbar rounded-2xl border border-black/8 bg-[#faf9f5] p-4 shadow-[0_6px_24px_rgba(45,53,48,0.05)] xl:min-h-0 xl:overflow-y-auto dark:border-white/10 dark:bg-[#1d2923]">
      <div className="flex items-baseline justify-between border-b border-black/8 pb-3 dark:border-white/10">
        <h2 className="font-black tracking-tight">{messages.content}</h2>
        <span className="text-xs text-[#5f6963] dark:text-[#b8c8be]">{definition.width} × {definition.height}</span>
      </div>
      <div className="mt-4 space-y-4">
        <label className="block select-none">
          <span className="mb-1.5 block select-none text-[11px] font-bold tracking-widest text-[#59665f] uppercase dark:text-[#b8c8be]">{messages.contentVariantLabel}</span>
          <select value={selectedVariant} onChange={(event) => onVariantChange(event.target.value)} className="studio-select w-full rounded-xl border border-[#d6d5ce] bg-[#fbfaf6] px-3 py-2 text-sm font-bold text-[#17221d] transition outline-none focus:border-[#39775f] focus:ring-3 focus:ring-[#39775f]/10 dark:border-white/15 dark:bg-[#24342c] dark:text-[#e6eee9]">
            {Object.keys(definition.content).map((value) => <option key={value} value={value}>{definition.variants.labels?.[value] ?? value}</option>)}
          </select>
        </label>
        {Object.entries(definition.fields).map(([key, field]) => (
          <div key={key} data-field-key={key}>
            <EditorField
              key={`${selectedVariant}:${key}`}
              field={{
                key,
                type: field.kind,
                required: field.kind === 'choice' || field.kind === 'boolean' ? false : field.kind === 'number' ? true : field.required !== false,
                min: field.kind === 'number' ? field.min : undefined,
                max: field.kind === 'number' ? field.max : undefined,
                step: field.kind === 'number' ? field.step : undefined,
                control: field.kind === 'number' ? field.control : undefined,
                minLength: field.kind === 'text' ? field.minLength : undefined,
                maxLength: field.kind === 'text' ? field.maxLength : undefined,
                scope: field.kind === 'image' ? field.scope : undefined,
                options: field.kind === 'choice' ? field.options : undefined,
                label: field.label,
                placeholder: 'placeholder' in field ? field.placeholder : undefined,
              }}
              value={data[key] ?? (field.kind === 'number' ? field.defaultValue : field.kind === 'boolean' ? false : '')}
              onChange={(value) => onFieldChange(key, value)}
              error={errors[key]}
              onValidationError={(error) => onFieldValidationError?.(key, error)}
              imageLabels={{ select: messages.imageSelect, uploading: messages.imageUploading, loadError: messages.imageLoadError, uploadError: messages.imageUploadError }}
              onImageUpload={field.kind === 'image' && onImageUpload ? (file) => onImageUpload(key, file, field.scope ?? 'variant') : undefined}
            />
          </div>
        ))}
      </div>
    </aside>
  )
}
