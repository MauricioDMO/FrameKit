import { defineTemplate, fields } from '@mauriciodmo/framekit'

defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Título' }),
  },
  content: {
    // @ts-expect-error content.es missing required 'language' field
    es: { title: 'Oferta' },
  },
  render() {
    return null
  },
})
