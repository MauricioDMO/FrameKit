import { defineTemplate, fields } from '@/lib/framekit'

// Note: TypeScript's structural typing does not reject extra content keys
// when the parameter is generic. validateTemplateDefinition() catches this at
// runtime (error: content.*.foo is not a declared field key).
defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Título' }),
  },
  content: {
    // foo is not a declared field — caught by validateTemplateDefinition at runtime
    es: { language: 'Español', foo: 'bar' },
  },
  render() {
    return null
  },
})
