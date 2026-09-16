import { defineTemplate, field } from '@mauriciodmo/framekit'

defineTemplate({
  meta: { title: 'Language template' },
  width: 1080,
  height: 1080,
  fields: {
    language: field.text({ label: 'Idioma' })
  },
  content: {
    es: { language: 'Español' }
  },
  variants: { default: 'es' },
  render ({ data }) {
    const language: string = data.language
    return language
  }
})
