// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { defineTemplate, field } from '../../index'
import { resolveTemplateData } from '../../core/resolve-template-data'

import { getInitialState, loadPersistedState, rebaseState, resetVariant, selectVariant, updateField } from './editor-state'

const definition = defineTemplate({
  meta: { title: 'Editor state' },
  width: 100,
  height: 100,
    fields: {
      title: field.text({ label: 'Title' }),
      color: field.color({ label: 'Color' }),
      count: field.number({ label: 'Count', defaultValue: 1, min: 0, max: 10 }),
      enabled: field.boolean({ label: 'Enabled' }),
      logo: field.image({ label: 'Logo' }),
      alignment: field.choice({
      label: 'Alignment',
      defaultValue: 'center',
      options: [
        { value: 'left', label: 'Left' },
        { value: 'center', label: 'Center' }
      ]
    })
  },
  content: { en: { alignment: 'left' }, fr: {} },
  variants: { default: 'en', labels: { en: 'English', fr: 'French' } },
  render: () => null,
})

describe('editor state', () => {
  it('keeps variant changes and edits isolated', () => {
    const initial = getInitialState(definition)
    const english = updateField(initial, 'title', 'English\ntitle')
    const french = updateField(selectVariant(english, 'fr'), 'title', 'Titre français')
    const disabled = updateField(french, 'enabled', false)

    expect(disabled.dataByVariant).toEqual({ en: { title: 'English\ntitle' }, fr: { title: 'Titre français', enabled: false } })
  })

  it('resets only the active variant without mutating the previous state', () => {
    const state = { selectedVariant: 'fr', dataByVariant: { en: { title: 'English title' }, fr: { title: 'Titre français' } } }
    const reset = resetVariant(state)

    expect(reset.dataByVariant).toEqual({ en: { title: 'English title' } })
    expect(state.dataByVariant).toEqual({ en: { title: 'English title' }, fr: { title: 'Titre français' } })
  })

  it('preserves a live variant selection while dropping stale edits', () => {
    const refreshed = defineTemplate({
      meta: { title: 'Refreshed editor state' },
      width: 100,
      height: 100,
      fields: { title: field.text({ label: 'Title' }) },
      content: { en: {}, fr: {} },
      variants: { default: 'en' },
      render: () => null,
    })
    const state = {
      selectedVariant: 'fr',
      dataByVariant: { en: { title: 'Saved', count: 3 }, fr: { title: 'Titre français' }, removed: { title: 'Discarded' } },
    }

    expect(rebaseState(state, refreshed)).toEqual({
      selectedVariant: 'fr',
      dataByVariant: { en: { title: 'Saved' }, fr: { title: 'Titre français' } },
    })
  })

  it('discards malformed persisted variants, fields, and values', () => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Saved', enabled: true, logo: '/saved/logo.png', unknown: 'discarded', color: 7 }, unknown: { title: 'discarded' } } }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toEqual({ selectedVariant: 'en', dataByVariant: { en: { title: 'Saved', enabled: true, logo: '/saved/logo.png' } } })
  })

  it('discards persisted boolean strings instead of coercing them', () => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { enabled: 'true' } } }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toEqual({ selectedVariant: 'en', dataByVariant: { en: {} } })
  })

  it('preserves a valid persisted choice', () => {
    const storage = {
      getItem: () => JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { alignment: 'center' } } }),
    }

    expect(loadPersistedState('social/campaign', definition, storage)).toEqual({
      selectedVariant: 'en',
      dataByVariant: { en: { alignment: 'center' } },
    })
  })

  it('passes current content and default fallbacks to the resolver after dropping stale choices', () => {
    const storage = {
      getItem: () => JSON.stringify({
        selectedVariant: 'fr',
        dataByVariant: {
          en: { title: 'Saved English', alignment: 'legacy', enabled: true },
          fr: { title: 'Saved French', alignment: 'legacy', enabled: false },
        },
      }),
    }
    const state = loadPersistedState('social/campaign', definition, storage)

    expect(state).toEqual({
      selectedVariant: 'fr',
      dataByVariant: {
        en: { title: 'Saved English', enabled: true },
        fr: { title: 'Saved French', enabled: false },
      },
    })
    const resolvedEnglish = resolveTemplateData(definition, 'en', state!.dataByVariant.en)
    const resolvedFrench = resolveTemplateData(definition, 'fr', state!.dataByVariant.fr)

    expect(resolvedEnglish).toMatchObject({ title: 'Saved English', alignment: 'left', enabled: true })
    expect(resolvedFrench).toMatchObject({ title: 'Saved French', alignment: 'center', enabled: false })

  })

  it('keeps finite numeric edits and discards numeric strings or invalid values', () => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { count: 5, stringCount: '5', invalidCount: 11 } } }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toEqual({ selectedVariant: 'en', dataByVariant: { en: { count: 5 } } })
  })

  it('rejects a persisted selected variant that is no longer declared', () => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant: 'removed', dataByVariant: {} }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toBeNull()
  })

  it.each([null, 42, ''])('rejects a malformed persisted selected variant: %s', (selectedVariant) => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant, dataByVariant: {} }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toBeNull()
  })

  it('ignores a valid v1 payload instead of migrating it', () => {
    const storage = {
      getItem: (key: string) => key === 'framekit:social/campaign:v1'
        ? JSON.stringify({ selectedLocale: 'fr', dataByLocale: { fr: { title: 'Old title' } } })
        : null,
    }

    expect(loadPersistedState('social/campaign', definition, storage)).toBeNull()
  })
})
