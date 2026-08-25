import { defineTemplate, fields } from '@mauriciodmo/framekit'

defineTemplate({
  meta: { title: 'Invalid template' },
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Título' }),
  },
  content: {
    // @ts-expect-error content entries contain field values only
    es: { language: 'Español', title: 'Oferta' },
  },
  variants: { default: 'es' },
  render() {
    return null
  },
})
