import { defineTemplate, fields } from '@mauriciodmo/framekit'

defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Título' }),
  },
  content: {
    // @ts-expect-error content.es.title must be string, not number
    es: { language: 'Español', title: 42 },
  },
  render() {
    return null
  },
})
