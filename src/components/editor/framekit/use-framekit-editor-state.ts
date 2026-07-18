import { useEffect, useRef, useState } from 'react'

import type { TemplateDefinition } from '@/lib/framekit'

interface EditorState {
  selectedLocale: string
  dataByLocale: Record<string, Record<string, string>>
}

const storageKey = (slug: string) => `framekit:${slug}:v1`

function getInitialState(definition: TemplateDefinition): EditorState {
  return { selectedLocale: Object.keys(definition.content)[0], dataByLocale: {} }
}

function loadPersistedState(slug: string, definition: TemplateDefinition): EditorState | null {
  try {
    const stored = localStorage.getItem(storageKey(slug))
    if (!stored) return null

    const parsed = JSON.parse(stored) as Partial<EditorState>
    if (!parsed || typeof parsed !== 'object') return null

    const validLocales = new Set(Object.keys(definition.content))
    if (parsed.selectedLocale && !validLocales.has(parsed.selectedLocale)) return null

    const validFieldKeys = new Set(Object.keys(definition.fields))
    const dataByLocale: EditorState['dataByLocale'] = {}

    if (parsed.dataByLocale && typeof parsed.dataByLocale === 'object') {
      for (const [locale, fields] of Object.entries(parsed.dataByLocale)) {
        if (!validLocales.has(locale) || !fields || typeof fields !== 'object') continue

        dataByLocale[locale] = Object.fromEntries(
          Object.entries(fields).filter(([key, value]) => validFieldKeys.has(key) && typeof value === 'string'),
        )
      }
    }

    return { selectedLocale: parsed.selectedLocale ?? Object.keys(definition.content)[0], dataByLocale }
  } catch {
    return null
  }
}

export function useFramekitEditorState(slug: string, definition: TemplateDefinition) {
  const hydratedRef = useRef(false)
  const [state, setState] = useState<EditorState>(() => loadPersistedState(slug, definition) ?? getInitialState(definition))
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    hydratedRef.current = true
  }, [])

  useEffect(() => {
    if (hydratedRef.current) localStorage.setItem(storageKey(slug), JSON.stringify(state))
  }, [slug, state])

  function changeLocale(selectedLocale: string) {
    setState((current) => ({ ...current, selectedLocale }))
    setErrors({})
  }

  function resetLocale() {
    setState((current) => {
      const dataByLocale = { ...current.dataByLocale }
      delete dataByLocale[current.selectedLocale]
      return { ...current, dataByLocale }
    })
    setErrors({})
  }

  function updateField(key: string, value: string) {
    setState((current) => ({
      ...current,
      dataByLocale: {
        ...current.dataByLocale,
        [current.selectedLocale]: { ...current.dataByLocale[current.selectedLocale], [key]: value },
      },
    }))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  return {
    selectedLocale: state.selectedLocale,
    userEdits: state.dataByLocale[state.selectedLocale] ?? {},
    errors,
    setErrors,
    changeLocale,
    resetLocale,
    updateField,
  }
}
