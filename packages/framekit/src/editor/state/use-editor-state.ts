import { useEffect, useRef, useState } from 'react'

import type { TemplateDefinition } from '../../types'
import { getInitialState, loadPersistedState, resetLocale, selectLocale, storageKey, updateField } from './editor-state'

export function useEditorState(slug: string, definition: TemplateDefinition) {
  const hydratedRef = useRef(false)
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return getInitialState(definition)

    try {
      return loadPersistedState(slug, definition, window.localStorage) ?? getInitialState(definition)
    } catch {
      return getInitialState(definition)
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    hydratedRef.current = true
  }, [])

  useEffect(() => {
    if (hydratedRef.current) {
      try {
        window.localStorage.setItem(storageKey(slug), JSON.stringify(state))
      } catch {
        // Storage can be unavailable or full; editing should continue in memory.
      }
    }
  }, [slug, state])

  function changeLocale(locale: string) {
    setState((current) => selectLocale(current, locale))
    setErrors({})
  }

  function clearLocale() {
    setState(resetLocale)
    setErrors({})
  }

  function changeField(key: string, value: string) {
    setState((current) => updateField(current, key, value))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  return { selectedLocale: state.selectedLocale, userEdits: state.dataByLocale[state.selectedLocale] ?? {}, errors, setErrors, changeLocale, clearLocale, changeField }
}
