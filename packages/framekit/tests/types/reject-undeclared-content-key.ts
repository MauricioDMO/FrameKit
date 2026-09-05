import { defineTemplate, field } from '@mauriciodmo/framekit'

defineTemplate({
  meta: { title: 'Invalid template' },
  width: 1080,
  height: 1080,
  fields: {
    title: field.text({ label: 'Título' }),
  },
  content: {
    es: {
      title: 'bar',
      // @ts-expect-error foo is not declared in fields
      foo: 'bar',
    },
  },
  variants: { default: 'es' },
  render() {
    return null
  },
})
