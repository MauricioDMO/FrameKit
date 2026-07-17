import { fieldComponents } from './registry'
import { FieldLabel } from './shared'
import type { EditorFieldProps } from './types'

export function EditorField({ field, value, onChange }: EditorFieldProps) {
  const Field = fieldComponents[field.type]
  const Container = field.type === 'color' ? 'div' : 'label'

  return (
    <Container className="block">
      <FieldLabel label={field.label} />
      <Field field={field} value={value} onChange={onChange} />
    </Container>
  )
}
