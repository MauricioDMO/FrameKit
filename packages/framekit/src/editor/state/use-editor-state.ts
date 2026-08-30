import { useEffect, useRef, useState } from 'react'

import type { TemplateBase } from '../../types'
import { getInitialState, loadPersistedState, rebaseState, resetVariant, selectVariant, storageKey, updateField } from './editor-state'

export function useEditorState(slug: string, definition: TemplateBase) {
  const hydratedRef = useRef(false)
  const definitionRef = useRef(definition)
  const [state, setState] = useState(() => {
    if (typeof window === 'undefined') return getInitialState(definition)

    try {
      return loadPersistedState(slug, definition, window.localStorage) ?? getInitialState(definition)
    } catch {
      return getInitialState(definition)
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [resetVersion, setResetVersion] = useState(0)
  const renderedState = definitionRef.current === definition ? state : rebaseState(state, definition)

  useEffect(() => {
    hydratedRef.current = true
  }, [])

  useEffect(() => {
    if (definitionRef.current === definition) return
    definitionRef.current = definition
    setState((current) => rebaseState(current, definition))
    setErrors({})
    setResetVersion((current) => current + 1)
  }, [definition])

  useEffect(() => {
    if (hydratedRef.current) {
      try {
        window.localStorage.setItem(storageKey(slug), JSON.stringify(renderedState))
      } catch {
        // Storage can be unavailable or full; editing should continue in memory.
      }
    }
  }, [slug, renderedState])

  function changeVariant(variant: string) {
    setState((current) => selectVariant(current, variant))
    setErrors({})
  }

  function clearVariant() {
    setState(resetVariant)
    setResetVersion((current) => current + 1)
    setErrors({})
  }

  function changeField(key: string, value: string | number | boolean) {
    setState((current) => updateField(current, key, value))
    setErrors((current) => {
      if (!current[key]) return current
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  return { selectedVariant: renderedState.selectedVariant, userEdits: renderedState.dataByVariant[renderedState.selectedVariant] ?? {}, errors, setErrors, changeVariant, clearVariant, changeField, resetVersion }
}
