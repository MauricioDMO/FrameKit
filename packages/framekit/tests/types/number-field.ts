import { defineTemplate, field } from '@mauriciodmo/framekit'

field.number({ label: 'Count', defaultValue: 1 })
field.number({ label: 'Opacity', defaultValue: 50, min: 0, max: 100, step: 5, control: 'slider' })

field.number({
  label: 'Count',
  // @ts-expect-error number defaults cannot be strings
  defaultValue: '1',
})

// @ts-expect-error number defaults are required
field.number({ label: 'Count' })

field.number({
  label: 'Count',
  defaultValue: 1,
  // @ts-expect-error number fields do not accept required
  required: false,
})

field.number({
  label: 'Count',
  defaultValue: 1,
  // @ts-expect-error control is limited to input and slider
  control: 'select',
})

defineTemplate({
  meta: { title: 'Numeric template' },
  width: 100,
  height: 100,
  fields: { count: field.number({ label: 'Count', defaultValue: 1 }) },
  content: { en: { count: 2 } },
  variants: { default: 'en' },
  render({ data }) {
    const count: number = data.count
    void count
    return null
  },
})

defineTemplate({
  meta: { title: 'Invalid numeric template' },
  width: 100,
  height: 100,
  fields: { count: field.number({ label: 'Count', defaultValue: 1 }) },
  content: {
    en: {
      // @ts-expect-error number content values cannot be strings
      count: '2',
    },
  },
  variants: { default: 'en' },
  render: () => null,
})
