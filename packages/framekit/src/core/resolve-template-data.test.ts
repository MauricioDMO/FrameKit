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
        count: field.number({ label: 'Count', defaultValue: 1, min: 0, max: 10 }),
      },
      content: {
        aurora: { title: 'Variant title', count: 2 },
      },
      variants: { default: 'aurora' },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'aurora', {
      title: 'Edited title',
      count: 3,
    })).toEqual({
      backgroundImage: '/assets/images/backgrounds/forest.svg',
      title: 'Edited title',
      count: 3,
    })
  })

  it('applies choice defaults, variant content, and edits in order', () => {
    const definition = defineTemplate({
      meta: { title: 'Choice resolution' },
      width: 100,
      height: 100,
      fields: {
        alignment: field.choice({
          label: 'Alignment',
          options: [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
          ],
          defaultValue: 'left',
        }),
      },
      content: {
        empty: {},
        en: { alignment: 'center' },
      },
      variants: { default: 'empty' },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'empty', {})).toEqual({ alignment: 'left' })
    expect(resolveTemplateData(definition, 'en', {})).toEqual({ alignment: 'center' })
    expect(resolveTemplateData(definition, 'en', { alignment: 'right' })).toEqual({ alignment: 'right' })
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

    expect(resolveTemplateData(definition, 'en', { title: 'Edited title' })).toEqual({
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

  it('rejects invalid content values at the resolver boundary', () => {
    const definition = defineTemplate({
      meta: { title: 'Number resolution' },
      width: 100,
      height: 100,
      fields: { count: field.number({ label: 'Count', defaultValue: 1 }) },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    for (const count of ['2' as unknown as number, Number.NaN]) {
      const invalidDefinition = {
        ...definition,
        content: { en: { count } },
      } as unknown as typeof definition

      expect(() => resolveTemplateData(invalidDefinition, 'en', {})).toThrow('content.en.count must be a number')
    }
  })

  it.each([
    ['boolean', { showLogo: 'true' }, 'edits.showLogo must be a boolean'],
    ['number', { count: '2' }, 'edits.count must be a number'],
    ['text', { title: 2 }, 'edits.title must be a string'],
  ])('rejects invalid %s edit values at the resolver boundary', (_kind, edits, error) => {
    const definition = defineTemplate({
      meta: { title: 'Edit resolution' },
      width: 100,
      height: 100,
      fields: {
        showLogo: field.boolean({ label: 'Show logo' }),
        count: field.number({ label: 'Count', defaultValue: 1 }),
        title: field.text({ label: 'Title' }),
      },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(() => resolveTemplateData(definition, 'en', edits as never)).toThrow(error)
  })

  it('rejects non-finite number edits', () => {
    const definition = defineTemplate({
      meta: { title: 'Number edit resolution' },
      width: 100,
      height: 100,
      fields: { count: field.number({ label: 'Count', defaultValue: 1 }) },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(() => resolveTemplateData(definition, 'en', { count: Number.NaN })).toThrow('edits.count must be a number')
    expect(() => resolveTemplateData(definition, 'en', { count: Infinity })).toThrow('edits.count must be a number')
  })

  it('loads a template assembled from an extracted definition base', () => {
    expect(extractedTemplate).toMatchObject({ width: 1200, height: 800 })
    expect(resolveTemplateData(extractedTemplate, 'aurora', {})).toEqual({
      title: 'Northern light',
      accentColor: '',
      alignment: 'center',
    })
  })

  it('resolves image fields from variant assets before common assets', () => {
    const definition = defineTemplate({
      meta: { title: 'Asset precedence' },
      width: 100,
      height: 100,
      fields: {
        hero: field.image({ label: 'Hero', scope: 'variant' }),
        background: field.image({ label: 'Background', scope: 'common' }),
      },
      content: { en: {}, es: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'en', {
      hero: '/edited/hero.svg',
      background: '/edited/background.svg',
    }, {
      common: { hero: '/common/hero.svg', background: '/common/background.svg' },
      variants: { en: { hero: '/en/hero.webp', background: '/en/background.webp' } },
    })).toEqual({ hero: '/en/hero.webp', background: '/common/background.svg' })

    expect(resolveTemplateData(definition, 'es', {
      hero: '/edited/hero.svg',
      background: '/edited/background.svg',
    }, {
      common: { hero: '/common/hero.svg', background: '/common/background.svg' },
      variants: {},
    })).toEqual({ hero: '/common/hero.svg', background: '/common/background.svg' })
  })

  it('applies falsy boolean, number, and text edits', () => {
    const definition = defineTemplate({
      meta: { title: 'Falsy edits' },
      width: 100,
      height: 100,
      fields: {
        showLogo: field.boolean({ label: 'Show logo', defaultValue: true }),
        count: field.number({ label: 'Count', defaultValue: 2 }),
        title: field.text({ label: 'Title', defaultValue: 'Default', required: false }),
      },
      content: { en: { showLogo: true, count: 1, title: 'Variant' } },
      variants: { default: 'en' },
      render: () => null,
    })

    expect(resolveTemplateData(definition, 'en', { title: 'Edited' })).toEqual({
      showLogo: true,
      count: 1,
      title: 'Edited',
    })
    expect(resolveTemplateData(definition, 'en', { showLogo: false, count: 0, title: '' })).toEqual({
      showLogo: false,
      count: 0,
      title: '',
    })
  })

  it('rejects edits that are not plain objects', () => {
    const definition = defineTemplate({
      meta: { title: 'Edit shape' },
      width: 100,
      height: 100,
      fields: { title: field.text({ label: 'Title' }) },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })

    for (const edits of [null, [], new Date()]) {
      expect(() => resolveTemplateData(definition, 'en', edits as never)).toThrow('edits must be a plain object')
    }
  })

  it('does not mutate the definition, edits, or assets', () => {
    const definition = defineTemplate({
      meta: { title: 'No mutation' },
      width: 100,
      height: 100,
      fields: {
        hero: field.image({ label: 'Hero' }),
        title: field.text({ label: 'Title', defaultValue: 'Default' }),
      },
      content: { en: { title: 'Variant' } },
      variants: { default: 'en' },
      render: () => null,
    })
    const edits = { title: 'Edited' }
    const assets = {
      common: { hero: '/common/hero.svg' },
      variants: { en: { hero: '/en/hero.svg' } },
    }
    const originalContent = structuredClone(definition.content)
    const originalEdits = structuredClone(edits)
    const originalAssets = structuredClone(assets)

    expect(resolveTemplateData(definition, 'en', edits, assets)).toEqual({ hero: '/en/hero.svg', title: 'Edited' })
    expect(definition.content).toEqual(originalContent)
    expect(edits).toEqual(originalEdits)
    expect(assets).toEqual(originalAssets)
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
