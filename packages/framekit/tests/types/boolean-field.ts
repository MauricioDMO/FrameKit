import { defineTemplate, field } from '@mauriciodmo/framekit'

field.boolean({ label: 'Show logo', defaultValue: true })

field.boolean({
  label: 'Show logo',
  // @ts-expect-error boolean defaults cannot be strings
  defaultValue: 'true',
})

field.boolean({
  label: 'Show logo',
  // @ts-expect-error boolean fields do not accept required
  required: false,
})

field.boolean({
  label: 'Show logo',
  // @ts-expect-error boolean fields do not accept control
  control: 'checkbox',
})

field.boolean({
  label: 'Show logo',
  // @ts-expect-error boolean fields do not accept placeholder
  placeholder: 'yes',
})

defineTemplate({
  meta: { title: 'Boolean template' },
  width: 100,
  height: 100,
  fields: { showLogo: field.boolean({ label: 'Show logo' }) },
  content: { en: { showLogo: true } },
  variants: { default: 'en' },
  render({ data }) {
    const value: boolean = data.showLogo
    void value
    return null
  },
})

defineTemplate({
  meta: { title: 'Invalid boolean template' },
  width: 100,
  height: 100,
  fields: { showLogo: field.boolean({ label: 'Show logo' }) },
  content: {
    en: {
      // @ts-expect-error boolean content values cannot be strings
      showLogo: 'true',
    },
  },
  variants: { default: 'en' },
  render: () => null,
})
