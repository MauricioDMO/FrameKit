import { fieldComponents } from './registry'
import { FieldLabel } from './shared'
import type { EditorFieldProps } from './types'

export function EditorField({ field, value, onChange, error }: EditorFieldProps) {
  const Field = fieldComponents[field.type]
  const Container = field.type === 'color' ? 'div' : 'label'

  return (
    <Container className="block">
      <FieldLabel label={field.label} />
      <Field field={field} value={value} onChange={onChange} error={error} />
      {error && <p className="text-red-600 dark:text-red-400 text-xs mt-1">{error}</p>}
    </Container>
  )
}
