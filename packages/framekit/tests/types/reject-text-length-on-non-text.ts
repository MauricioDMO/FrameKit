import { field } from '@mauriciodmo/framekit'

field.color({
  label: 'Color',
  // @ts-expect-error text length constraints are only valid for text fields
  minLength: 1,
})
