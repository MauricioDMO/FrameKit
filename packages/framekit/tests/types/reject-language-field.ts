import { defineTemplate, field } from '@mauriciodmo/framekit'

// @ts-expect-error defineTemplate rejects the reserved fields.language property
defineTemplate({
  meta: { title: 'Invalid template' },
  width: 1080,
  height: 1080,
  fields: {
    language: field.text({ label: 'Idioma' }),
  },
  content: {
    es: {},
  },
  variants: { default: 'es' },
  render: () => null,
})
