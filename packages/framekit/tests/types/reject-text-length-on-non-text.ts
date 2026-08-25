import { defineTemplate, field } from '@mauriciodmo/framekit'

export const template = defineTemplate({
  meta: { title: 'Invalid text constraints' },
  width: 100,
  height: 100,
  fields: {
    // @ts-expect-error text length constraints are only valid for text fields
    color: field.color({ label: 'Color', minLength: 1 }),
  },
  content: { en: {} },
  variants: { default: 'en' },
  render: () => null,
})
