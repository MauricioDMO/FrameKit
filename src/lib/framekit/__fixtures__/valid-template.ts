import { defineTemplate, fields } from '@/lib/framekit'

// Valid template — used to derive type-level assertions
defineTemplate({
  width: 1080,
  height: 1080,
  fields: {
    title: fields.text({ label: 'Título', required: true }),
    accentColor: fields.color({ label: 'Color', defaultValue: '#173d31' }),
  },
  content: {
    es: { language: 'Español', title: 'Oferta' },
    en: { language: 'English', title: 'Offer' },
  },
  render() {
    return null as React.ReactNode
  },
})

// Type assertions (compile-time only):
// InferTemplateData<Def> yields { title: string, accentColor: string }
// TemplateRenderProps.locale = 'es' | 'en' (union of content keys)
