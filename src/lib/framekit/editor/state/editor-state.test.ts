import { describe, expect, it } from 'vitest'

import { defineTemplate, fields } from '@/lib/framekit'

import { getInitialState, loadPersistedState, resetLocale, selectLocale, updateField } from './editor-state'

const definition = defineTemplate({
  width: 100,
  height: 100,
  fields: { title: fields.text({ label: 'Title' }), color: fields.color({ label: 'Color' }) },
  content: { en: { language: 'English' }, fr: { language: 'French' } },
  render: () => null,
})

describe('editor state', () => {
  it('keeps locale changes and edits isolated', () => {
    const initial = getInitialState(definition)
    const english = updateField(initial, 'title', 'English title')
    const french = updateField(selectLocale(english, 'fr'), 'title', 'Titre français')

    expect(french.dataByLocale).toEqual({ en: { title: 'English title' }, fr: { title: 'Titre français' } })
  })

  it('resets only the active locale without mutating the previous state', () => {
    const state = { selectedLocale: 'fr', dataByLocale: { en: { title: 'English title' }, fr: { title: 'Titre français' } } }
    const reset = resetLocale(state)

    expect(reset.dataByLocale).toEqual({ en: { title: 'English title' } })
    expect(state.dataByLocale).toEqual({ en: { title: 'English title' }, fr: { title: 'Titre français' } })
  })

  it('discards malformed persisted locales, fields, and values', () => {
    const storage = { getItem: () => JSON.stringify({ selectedLocale: 'en', dataByLocale: { en: { title: 'Saved', unknown: 'discarded', color: 7 }, unknown: { title: 'discarded' } } }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toEqual({ selectedLocale: 'en', dataByLocale: { en: { title: 'Saved' } } })
  })

  it('rejects a persisted selected locale that is no longer declared', () => {
    const storage = { getItem: () => JSON.stringify({ selectedLocale: 'removed', dataByLocale: {} }) }

    expect(loadPersistedState('social/campaign', definition, storage)).toBeNull()
  })
})
