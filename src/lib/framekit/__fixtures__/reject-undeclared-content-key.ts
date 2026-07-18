import { defineTemplate, fields } from '@/lib/framekit'

defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Título' }),
  },
  content: {
    // @ts-expect-error foo is not declared in fields
    es: { language: 'Español', foo: 'bar' },
  },
  render() {
    return null
  },
})
