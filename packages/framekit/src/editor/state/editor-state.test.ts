// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { defineTemplate, field } from '../../index'

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
    const frenchSelection = selectVariant(english, 'fr')
    const french = updateField(frenchSelection, 'title', 'Titre français')
    const disabled = updateField(french, 'enabled', false)

    expect(initial).toEqual({ selectedVariant: 'en', dataByVariant: {} })
    expect(frenchSelection).not.toBe(english)
    expect(frenchSelection.dataByVariant).toBe(english.dataByVariant)
    expect(french.dataByVariant).not.toBe(english.dataByVariant)
    expect(french.dataByVariant.en).toBe(english.dataByVariant.en)
    expect(disabled.dataByVariant).toEqual({ en: { title: 'English\ntitle' }, fr: { title: 'Titre français', enabled: false } })
    expect(disabled.dataByVariant.fr).not.toBe(french.dataByVariant.fr)
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

  it('falls back to the default when the selected variant disappears', () => {
    const refreshed = defineTemplate({
      meta: { title: 'Refreshed editor state' },
      width: 100,
      height: 100,
      fields: { title: field.text({ label: 'Title' }) },
      content: { en: {} },
      variants: { default: 'en' },
      render: () => null,
    })
    const state = {
      selectedVariant: 'fr',
      dataByVariant: { en: { title: 'Saved' }, fr: { title: 'Discarded' } },
    }

    expect(rebaseState(state, refreshed)).toEqual({
      selectedVariant: 'en',
      dataByVariant: { en: { title: 'Saved' } },
    })
  })

  it('discards malformed persisted variants, fields, and values', () => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Saved', enabled: true, logo: '/saved/logo.png', unknown: 'discarded', color: 7 }, unknown: { title: 'discarded' }, broken: null, list: [] } }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toEqual({ selectedVariant: 'en', dataByVariant: { en: { title: 'Saved', enabled: true, logo: '/saved/logo.png' } } })
  })

  it.each(['{invalid', 'null', '[]', JSON.stringify('not an object')])('returns null for a corrupt persisted payload: %s', (stored) => {
    const storage = { getItem: () => stored }

    expect(loadPersistedState('social/campaign', definition, storage)).toBeNull()
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

  it('drops stale persisted choices before returning state', () => {
    const storage = {
      getItem: () => JSON.stringify({
        selectedVariant: 'fr',
        dataByVariant: {
          en: { title: 'Saved English', alignment: 'legacy', enabled: true },
          fr: { title: 'Saved French', alignment: 'legacy', enabled: false },
        },
      }),
    }
    expect(loadPersistedState('social/campaign', definition, storage)).toEqual({
      selectedVariant: 'fr',
      dataByVariant: {
        en: { title: 'Saved English', enabled: true },
        fr: { title: 'Saved French', enabled: false },
      },
    })
  })

  it.each([
    ['finite number', 5, { count: 5 }],
    ['numeric string', '5', {}],
    ['out-of-range number', 11, {}],
  ] as const)('handles the declared count field: %s', (_caseName, value, expected) => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { count: value } } }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toEqual({ selectedVariant: 'en', dataByVariant: { en: expected } })
  })

  it('rejects a persisted selected variant that is no longer declared', () => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant: 'removed', dataByVariant: {} }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toBeNull()
  })

  it.each([null, 42, ''])('rejects a malformed persisted selected variant: %s', (selectedVariant) => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant, dataByVariant: {} }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toBeNull()
  })

  it('reads only the exact v2 storage key', () => {
    const requestedKeys: string[] = []
    const storage = {
      getItem: (key: string) => {
        requestedKeys.push(key)
        return key === 'framekit:social/campaign:v1'
          ? JSON.stringify({ selectedLocale: 'fr', dataByLocale: { fr: { title: 'Old title' } } })
          : null
      },
    }

    expect(loadPersistedState('social/campaign', definition, storage)).toBeNull()
    expect(requestedKeys).toEqual(['framekit:social/campaign:v2'])
  })
})
