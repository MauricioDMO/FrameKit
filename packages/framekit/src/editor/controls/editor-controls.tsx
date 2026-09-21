import { IconRotate } from '@tabler/icons-react'

import type { TemplateBase } from '@/types'
import type { TemplateDataValidationError } from '@/core/validation'
import { EditorField } from './fields'
import type { EditorMessages } from '@/editor/types'

interface EditorControlsProps {
  definition: TemplateBase
  messages: EditorMessages
  selectedVariant: string
  data: Record<string, string | number | boolean>
  errors: Record<string, string>
  onVariantChange: (variant: string) => void
  onReset: () => void
  onFieldChange: (key: string, value: string | number | boolean) => void
  onFieldValidationError?: (key: string, error?: TemplateDataValidationError) => void
  onImageUpload?: (key: string, file: File, scope: 'common' | 'variant') => Promise<void>
}

export function EditorControls ({ definition, messages, selectedVariant, data, errors, onVariantChange, onReset, onFieldChange, onFieldValidationError, onImageUpload }: EditorControlsProps) {
  return (
    <aside className="studio-editor-scrollbar rounded-2xl border border-black/8 bg-fk-ivory-100 p-4 shadow-md dark:border-white/10 dark:bg-fk-forest-200 xl:min-h-0 xl:overflow-y-auto">
      <div className="flex items-baseline justify-between border-b border-black/8 pb-3 dark:border-white/10">
        <h2 className="font-black tracking-tight">{messages.content}</h2>
        <span className="text-xs text-fk-sage-400 dark:text-fk-sage-200">{definition.width} × {definition.height}</span>
      </div>
      <div className="mt-4 space-y-4">
        <div className="block select-none">
          <span className="mb-1.5 block select-none text-[11px] font-bold tracking-widest text-fk-sage-400 uppercase dark:text-fk-sage-200">{messages.variantLabel}</span>
          <div className="flex items-center gap-2">
            <select aria-label={messages.variantLabel} value={selectedVariant} onChange={(event) => onVariantChange(event.target.value)} className="studio-select min-w-0 flex-1 rounded-xl border border-fk-ivory-400 bg-fk-ivory-100 px-3 py-2 text-sm font-bold text-fk-forest-400 transition outline-none focus:border-fk-mint-300 focus:ring-3 focus:ring-fk-mint-300/10 dark:border-white/15 dark:bg-fk-forest-200 dark:text-fk-sage-100">
              {Object.keys(definition.content).map((value) => <option key={value} value={value}>{definition.variants.labels?.[value] ?? value}</option>)}
            </select>
            <button type="button" title={messages.reset} onClick={onReset} aria-label={messages.reset} className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl border border-fk-ivory-400 bg-fk-ivory-100 text-fk-sage-400 transition hover:bg-fk-ivory-200 focus:ring-2 focus:ring-fk-mint-300 focus:outline-none dark:border-white/15 dark:bg-fk-forest-200 dark:text-fk-sage-100 dark:hover:bg-fk-forest-100"><IconRotate size={17} aria-hidden="true" /></button>
          </div>
        </div>
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
                placeholder: 'placeholder' in field ? field.placeholder : undefined
              }}
              value={data[key] ?? (field.kind === 'number' ? field.defaultValue : field.kind === 'boolean' ? false : '')}
              onChange={(value) => onFieldChange(key, value)}
              error={errors[key]}
              onValidationError={(error) => onFieldValidationError?.(key, error)}
              imageLabels={{ select: messages.imageSelect, uploading: messages.imageUploading, loadError: messages.imageLoadError }}
              colorPickerLabel={messages.colorPickerLabel}
              onImageUpload={field.kind === 'image' && onImageUpload ? (file) => onImageUpload(key, file, field.scope ?? 'variant') : undefined}
            />
          </div>
        ))}
      </div>
    </aside>
  )
}
