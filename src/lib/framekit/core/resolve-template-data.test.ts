import { describe, expect, it } from 'vitest'

import { defineTemplate, fields, resolveTemplateData } from '@/lib/framekit'
import pilotTemplate from '@/templates/redes-sociales/instagram/promocion-cuadrada/template'

import { extractedTemplate } from '../__fixtures__/extracted-template'

describe('resolveTemplateData', () => {
  it('resolves defaults, localized content, and edits in order without copying language', () => {
    const definition = defineTemplate({
      width: 100,
      height: 100,
      fields: {
        backgroundImage: fields.url({
          label: 'Background',
          defaultValue: '/images/backgrounds/forest.svg',
        }),
        title: fields.text({ label: 'Title', defaultValue: 'Default title' }),
      },
      content: {
        aurora: { language: 'Aurora', title: 'Localized title' },
      },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'aurora', {
      title: 'Edited title',
      language: 'must stay excluded',
    })).toEqual({
      backgroundImage: '/images/backgrounds/forest.svg',
      title: 'Edited title',
    })
  })

  it('resolves the pilot defaults before localized content and edits', () => {
    expect(resolveTemplateData(pilotTemplate, 'en', { title: 'Edited title' })).toMatchObject({
      backgroundImage: '/images/backgrounds/forest.svg',
      accentColor: '#b9f8d2',
      eyebrow: 'Digital studio / 2026',
      title: 'Edited title',
    })
  })

  it('loads a template assembled from an extracted definition base', () => {
    expect(extractedTemplate).toMatchObject({ width: 1200, height: 800 })
    expect(resolveTemplateData(extractedTemplate, 'aurora', {})).toEqual({
      title: 'Northern light',
      accentColor: '',
    })
  })
})
