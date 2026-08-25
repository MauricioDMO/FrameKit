import { defineTemplate, field } from '@mauriciodmo/framekit'

defineTemplate({
  meta: { title: 'Invalid template' },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Título' }),
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
