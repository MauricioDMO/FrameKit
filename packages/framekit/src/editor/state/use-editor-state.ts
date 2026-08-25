import { useEffect, useRef, useState } from 'react'

import type { TemplateDefinition } from '../../types'
import { getInitialState, loadPersistedState, resetVariant, selectVariant, storageKey, updateField } from './editor-state'

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

  function changeVariant(variant: string) {
    setState((current) => selectVariant(current, variant))
    setErrors({})
  }

  function clearVariant() {
    setState(resetVariant)
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

  return { selectedVariant: state.selectedVariant, userEdits: state.dataByVariant[state.selectedVariant] ?? {}, errors, setErrors, changeVariant, clearVariant, changeField }
}
