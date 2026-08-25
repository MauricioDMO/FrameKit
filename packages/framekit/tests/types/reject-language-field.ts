import { defineTemplate, fields } from '@mauriciodmo/framekit'

// @ts-expect-error fields.language is reserved
defineTemplate({
  meta: { title: 'Invalid template' },
  width: 1080,
  height: 1080,
  fields: {
    language: fields.text({ label: 'Idioma' }),
  },
  content: {
    es: {},
  },
  variants: { default: 'es' },
  render() {
    return null
  },
})
