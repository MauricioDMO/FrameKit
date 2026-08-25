import { defineTemplate, field } from '@mauriciodmo/framekit'

defineTemplate({
  meta: { title: 'Invalid template' },
  width: 1080,
  height: 1080,
  fields: {
    // @ts-expect-error min is not allowed on text fields
    name: field.text({ label: 'Name', min: 3 }),
  },
  content: {
    es: { name: 'Test' },
  },
  variants: { default: 'es' },
  render() {
    return null
  },
})
