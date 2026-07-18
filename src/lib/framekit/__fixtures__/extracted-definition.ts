import { defineTemplateBase, fields } from '@/lib/framekit'

export const templateBase = defineTemplateBase({
  width: 1200,
  height: 800,
  fields: {
    title: fields.text({ label: 'Title' }),
    accentColor: fields.color({ label: 'Accent' }),
  },
  content: {
    aurora: { language: 'Aurora', title: 'Northern light' },
    desert: { language: 'Desert', title: 'Open horizon' },
  },
})
