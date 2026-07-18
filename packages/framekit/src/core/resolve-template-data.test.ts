import { describe, expect, it } from 'vitest'

import { defineTemplate, fields, resolveTemplateData } from '../index'

import { extractedTemplate } from '../../tests/types/extracted-template'

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

  it('resolves defaults before localized content and edits', () => {
    const definition = defineTemplate({
      width: 1440,
      height: 1440,
      fields: {
        backgroundImage: fields.url({ defaultValue: '/images/backgrounds/forest.svg', label: 'Background' }),
        accentColor: fields.color({ defaultValue: '#b9f8d2', label: 'Accent' }),
        eyebrow: fields.text({ label: 'Eyebrow' }),
        title: fields.text({ label: 'Title' }),
      },
      content: {
        en: { language: 'English', eyebrow: 'Digital studio / 2026', title: 'Localized title' },
      },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'en', { title: 'Edited title' })).toMatchObject({
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
