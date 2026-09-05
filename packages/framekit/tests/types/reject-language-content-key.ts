import { defineTemplate, field } from '@mauriciodmo/framekit'

defineTemplate({
  meta: { title: 'Invalid template' },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Título' }),
  },
  content: {
    es: {
      // @ts-expect-error language is not a declared field
      language: 'Español',
      title: 'Oferta',
    },
  },
  variants: { default: 'es' },
  render: () => null,
})
