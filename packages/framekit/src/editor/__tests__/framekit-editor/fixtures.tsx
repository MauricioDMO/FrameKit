import './mocks'

import { render } from '@testing-library/react'

import { defineTemplate, field } from '@/index'

import { FrameKitEditor } from '@/editor/framekit-editor'
import type { TemplateDefinition, TemplateRegistryEntry } from '@/types'

import { messages } from './messages'

export function createDefinition () {
  return defineTemplate({
    meta: {
      title: 'Editor test',
      tags: ['framekit', 'introducción', 'react'],
      description: 'Una introducción visual a FrameKit y su flujo de trabajo.',
      marketingDescription: 'Explicar cómo FrameKit convierte plantillas React en contenido visual reutilizable.'
    },
    width: 100,
    height: 100,
    fields: {
      title: field.text({ label: 'Title', minLength: 2, maxLength: 20 }),
      optionalText: field.text({ label: 'Optional text', required: false }),
      invalidNumber: field.number({ label: 'Invalid number', defaultValue: 1 }),
      tooSmall: field.number({ label: 'Too small', defaultValue: 10, min: 10 }),
      tooLarge: field.number({ label: 'Too large', defaultValue: 20, max: 20 }),
      steppedNumber: field.number({ label: 'Stepped number', defaultValue: 4, min: 0, max: 10, step: 2 }),
      sliderNumber: field.number({ label: 'Slider number', defaultValue: 50, min: 0, max: 100, step: 10, control: 'slider' }),
      alignment: field.choice({
        label: 'Alignment',
        options: [
          { value: 'left', label: 'Left' },
          { value: 'center', label: 'Center' },
          { value: 'right', label: 'Right' }
        ],
        defaultValue: 'center'
      }),
      showLogo: field.boolean({ label: 'Show logo', defaultValue: true }),
      accentColor: field.color({ label: 'Accent color', defaultValue: '#123456' }),
      optionalColor: field.color({ label: 'Optional color', required: false })
    },
    content: { en: { title: 'English title' }, fr: { title: 'French title' } },
    variants: { default: 'en', labels: { en: 'English' } },
    render ({ data }) {
      return <span>{data.showLogo ? 'logo-on' : 'logo-off'}:{data.invalidNumber}</span>
    }
  })
}

export function createTemplate (definition: TemplateDefinition, meta = definition.meta): TemplateRegistryEntry {
  return {
    slug: 'social/campaign',
    segments: ['social', 'campaign'],
    meta,
    width: definition.width,
    height: definition.height,
    variants: definition.variants,
    variantKeys: Object.keys(definition.content),
    assets: { common: {}, variants: {} },
    load: async () => ({ default: definition })
  }
}

export function renderDefinition (definition: TemplateDefinition, sidebarCollapsed = false) {
  return render(<FrameKitEditor template={createTemplate(definition)} definition={definition} messages={messages} sidebarCollapsed={sidebarCollapsed} />)
}

export function renderEditor (sidebarCollapsed = false) {
  return renderDefinition(createDefinition(), sidebarCollapsed)
}
