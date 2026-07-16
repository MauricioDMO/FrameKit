import { fieldComponents } from './registry'
import { FieldLabel } from './shared'
import type { EditorFieldProps } from './types'

export function EditorField({ field, value, onChange }: EditorFieldProps) {
  const Field = fieldComponents[field.type]

  return (
    <label className="block">
      <FieldLabel label={field.label} />
      <Field field={field} value={value} onChange={onChange} />
    </label>
  )
}
