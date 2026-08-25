import { describe, expect, it } from 'vitest'

import { defineTemplate, field, resolveTemplateData } from '../index'

import { extractedTemplate } from '../../tests/types/extracted-template'

describe('resolveTemplateData', () => {
  it('resolves defaults, variant content, and edits in order', () => {
    const definition = defineTemplate({
      meta: { title: 'Resolution test' },
      width: 100,
      height: 100,
      fields: {
        backgroundImage: field.image({
          label: 'Background',
          defaultValue: '/assets/images/backgrounds/forest.svg',
        }),
        title: field.text({ label: 'Title', defaultValue: 'Default title' }),
      },
      content: {
        aurora: { title: 'Variant title' },
      },
      variants: { default: 'aurora' },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'aurora', {
      title: 'Edited title',
    })).toEqual({
      backgroundImage: '/assets/images/backgrounds/forest.svg',
      title: 'Edited title',
    })
  })

  it('resolves defaults before variant content and edits', () => {
    const definition = defineTemplate({
      meta: { title: 'Resolution order' },
      width: 1440,
      height: 1440,
      fields: {
        backgroundImage: field.image({ defaultValue: '/assets/images/backgrounds/forest.svg', label: 'Background' }),
        accentColor: field.color({ defaultValue: '#b9f8d2', label: 'Accent' }),
        eyebrow: field.text({ label: 'Eyebrow' }),
        title: field.text({ label: 'Title' }),
      },
      content: {
        en: { eyebrow: 'Digital studio / 2026', title: 'Variant title' },
      },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'en', { title: 'Edited title' })).toMatchObject({
      backgroundImage: '/assets/images/backgrounds/forest.svg',
      accentColor: '#b9f8d2',
      eyebrow: 'Digital studio / 2026',
      title: 'Edited title',
    })
  })

  it('resolves boolean defaults, content, and false edits without coercion', () => {
    const definition = defineTemplate({
      meta: { title: 'Boolean resolution' },
      width: 100,
      height: 100,
      fields: {
        omittedDefault: field.boolean({ label: 'Omitted default' }),
        explicitTrue: field.boolean({ label: 'Explicit true', defaultValue: true }),
        fromContent: field.boolean({ label: 'From content' }),
      },
      content: { en: { fromContent: true } },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'en', { fromContent: false })).toEqual({
      omittedDefault: false,
      explicitTrue: true,
      fromContent: false,
    })
  })

  it('loads a template assembled from an extracted definition base', () => {
    expect(extractedTemplate).toMatchObject({ width: 1200, height: 800 })
    expect(resolveTemplateData(extractedTemplate, 'aurora', {})).toEqual({
      title: 'Northern light',
      accentColor: '',
    })
  })

  it('resolves image fields from variant assets before common assets', () => {
    const definition = defineTemplate({
      meta: { title: 'Asset precedence' },
      width: 100,
      height: 100,
      fields: {
        hero: field.image({ label: 'Hero' }),
        background: field.image({ label: 'Background', scope: 'common' }),
      },
      content: { en: {}, es: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'en', {}, {
      common: { hero: '/common/hero.svg', background: '/common/background.svg' },
      variants: { en: { hero: '/en/hero.webp' } },
    })).toEqual({ hero: '/en/hero.webp', background: '/common/background.svg' })

    expect(resolveTemplateData(definition, 'es', {}, {
      common: { hero: '/common/hero.svg', background: '/common/background.svg' },
      variants: {},
    })).toEqual({ hero: '/common/hero.svg', background: '/common/background.svg' })
  })

  it('rejects unknown variants and edit keys instead of silently resolving them', () => {
    const definition = defineTemplate({
      meta: { title: 'Resolution errors' },
      width: 100,
      height: 100,
      fields: { title: field.text({ label: 'Title' }) },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(() => resolveTemplateData(definition, 'missing', {})).toThrow('content variant "missing" is not defined')
    expect(() => resolveTemplateData(definition, 'en', { missing: 'value' })).toThrow('edits contains unknown field key "missing"')
  })
})
