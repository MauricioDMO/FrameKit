import { defineTemplate, fields } from '@/lib/framekit'

defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    // @ts-expect-error min is not allowed on text fields
    name: fields.text({ label: 'Name', min: 3 }),
  },
  content: {
    es: { language: 'Español', name: 'Test' },
  },
  render() {
    return null
  },
})
