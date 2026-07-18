import type { TemplateDefinition } from '../../types'

export interface EditorState {
  selectedLocale: string
  dataByLocale: Record<string, Record<string, string>>
}

export const storageKey = (slug: string) => `framekit:${slug}:v1`

export function getInitialState(definition: TemplateDefinition): EditorState {
  return { selectedLocale: Object.keys(definition.content)[0], dataByLocale: {} }
}

export function loadPersistedState(slug: string, definition: TemplateDefinition, storage: Pick<Storage, 'getItem'>): EditorState | null {
  try {
    const stored = storage.getItem(storageKey(slug))
    if (!stored) return null

    const parsed = JSON.parse(stored) as Partial<EditorState>
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

    const validLocales = new Set(Object.keys(definition.content))
    const selectedLocale = parsed.selectedLocale
    if (selectedLocale !== undefined && (typeof selectedLocale !== 'string' || !validLocales.has(selectedLocale))) return null

    const validFieldKeys = new Set(Object.keys(definition.fields))
    const dataByLocale: EditorState['dataByLocale'] = {}

    if (parsed.dataByLocale && typeof parsed.dataByLocale === 'object' && !Array.isArray(parsed.dataByLocale)) {
      for (const [locale, fields] of Object.entries(parsed.dataByLocale)) {
        if (!validLocales.has(locale) || !fields || typeof fields !== 'object' || Array.isArray(fields)) continue
        dataByLocale[locale] = Object.fromEntries(Object.entries(fields).filter(([key, value]) => validFieldKeys.has(key) && typeof value === 'string'))
      }
    }

    return { selectedLocale: selectedLocale ?? Object.keys(definition.content)[0], dataByLocale }
  } catch {
    // Stored sessions are untrusted; a malformed value must not prevent editing.
    return null
  }
}

export function selectLocale(state: EditorState, selectedLocale: string): EditorState {
  return { ...state, selectedLocale }
}

export function resetLocale(state: EditorState): EditorState {
  const dataByLocale = { ...state.dataByLocale }
  delete dataByLocale[state.selectedLocale]
  return { ...state, dataByLocale }
}

export function updateField(state: EditorState, key: string, value: string): EditorState {
  return {
    ...state,
    dataByLocale: {
      ...state.dataByLocale,
      [state.selectedLocale]: { ...state.dataByLocale[state.selectedLocale], [key]: value },
    },
  }
}
