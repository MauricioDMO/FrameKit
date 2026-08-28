import { fieldComponents } from './registry'
import { FieldLabel } from './shared'
import type { EditorFieldProps } from '../types'

export function EditorField({ field, value, onChange, error, onValidationError, imageLabels, onImageUpload }: EditorFieldProps) {
  const Field = fieldComponents[field.type]
  const isLabelContainer = field.type !== 'color' && field.type !== 'image'
  const Container = isLabelContainer ? 'label' : 'div'

  return (
    <Container className={isLabelContainer ? 'block select-none' : 'block'}>
      <FieldLabel label={field.label} />
      <Field
        field={field}
        value={value}
        onChange={onChange}
        error={error}
        onValidationError={onValidationError}
        imageLabels={imageLabels}
        onImageUpload={onImageUpload}
      />
      {error && (
        <p id={`${field.key}-error`} className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
        )}
    </Container>
  )
}
