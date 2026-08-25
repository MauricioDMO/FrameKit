import { defineTemplate, fields } from '@mauriciodmo/framekit'

defineTemplate({
  meta: { title: 'Invalid template' },
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Título' }),
  },
  content: {
    // @ts-expect-error content.es.title must be string, not number
    es: { title: 42 },
  },
  variants: { default: 'es' },
  render() {
    return null
  },
})
