import { defineTemplate, fields } from '@mauriciodmo/framekit'

// @ts-expect-error fields.language is reserved
defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    language: fields.text({ label: 'Idioma' }),
  },
  content: {
    es: { language: 'Español' },
  },
  render() {
    return null
  },
})
