// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { defineTemplate, field } from '../../index'

import { getInitialState, loadPersistedState, resetVariant, selectVariant, updateField } from './editor-state'

const definition = defineTemplate({
  meta: { title: 'Editor state' },
  width: 100,
  height: 100,
  fields: { title: field.text({ label: 'Title' }), color: field.color({ label: 'Color' }) },
  content: { en: {}, fr: {} },
  variants: { default: 'en', labels: { en: 'English', fr: 'French' } },
  render: () => null,
})

describe('editor state', () => {
  it('keeps variant changes and edits isolated', () => {
    const initial = getInitialState(definition)
    const english = updateField(initial, 'title', 'English\ntitle')
    const french = updateField(selectVariant(english, 'fr'), 'title', 'Titre français')

    expect(french.dataByVariant).toEqual({ en: { title: 'English\ntitle' }, fr: { title: 'Titre français' } })
  })

  it('resets only the active variant without mutating the previous state', () => {
    const state = { selectedVariant: 'fr', dataByVariant: { en: { title: 'English title' }, fr: { title: 'Titre français' } } }
    const reset = resetVariant(state)

    expect(reset.dataByVariant).toEqual({ en: { title: 'English title' } })
    expect(state.dataByVariant).toEqual({ en: { title: 'English title' }, fr: { title: 'Titre français' } })
  })

  it('discards malformed persisted variants, fields, and values', () => {
    const storage = { getItem: () => JSON.stringify({ selectedVariant: 'en', dataByVariant: { en: { title: 'Saved', unknown: 'discarded', color: 7 }, unknown: { title: 'discarded' } } }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toEqual({ selectedVariant: 'en', dataByVariant: { en: { title: 'Saved' } } })
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
