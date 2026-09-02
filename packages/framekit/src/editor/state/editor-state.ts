import type { TemplateBase } from '../../types'
import { validateNumberValue } from '../../core/validation/data'

export interface EditorState {
  selectedVariant: string
  dataByVariant: Record<string, Record<string, string | number | boolean>>
}

export const storageKey = (slug: string) => `framekit:${slug}:v2`

export function getInitialState(definition: TemplateBase): EditorState {
  return { selectedVariant: definition.variants.default, dataByVariant: {} }
}

function filterFieldData(definition: TemplateBase, fields: Record<string, unknown>): Record<string, string | number | boolean> {
  const data: Record<string, string | number | boolean> = {}
  for (const [key, value] of Object.entries(fields)) {
    const field = definition.fields[key]
    if (!field) continue
    if (field.kind === 'number') {
      if (validateNumberValue(value, field) === undefined) data[key] = value as number
    } else if (field.kind === 'choice') {
      if (field.options.some((option) => option.value === value)) data[key] = value as string
    } else if (typeof value === (field.kind === 'boolean' ? 'boolean' : 'string')) {
      data[key] = value as string | boolean
    }
  }
  return data
}

export function rebaseState(state: EditorState, definition: TemplateBase): EditorState {
  const validVariants = new Set(Object.keys(definition.content))
  const dataByVariant: EditorState['dataByVariant'] = {}

  for (const [variant, fields] of Object.entries(state.dataByVariant)) {
    if (validVariants.has(variant)) dataByVariant[variant] = filterFieldData(definition, fields)
  }

  return {
    selectedVariant: validVariants.has(state.selectedVariant) ? state.selectedVariant : definition.variants.default,
    dataByVariant,
  }
}

export function loadPersistedState(slug: string, definition: TemplateBase, storage: Pick<Storage, 'getItem'>): EditorState | null {
  try {
    const stored = storage.getItem(storageKey(slug))
    if (!stored) return null

    const parsed = JSON.parse(stored) as Partial<EditorState>
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null

    const validVariants = new Set(Object.keys(definition.content))
    const selectedVariant = parsed.selectedVariant
    if (selectedVariant !== undefined && (typeof selectedVariant !== 'string' || !validVariants.has(selectedVariant))) return null

    const dataByVariant: EditorState['dataByVariant'] = {}

    if (parsed.dataByVariant && typeof parsed.dataByVariant === 'object' && !Array.isArray(parsed.dataByVariant)) {
      for (const [variant, fields] of Object.entries(parsed.dataByVariant)) {
        if (!validVariants.has(variant) || !fields || typeof fields !== 'object' || Array.isArray(fields)) continue
        dataByVariant[variant] = filterFieldData(definition, fields)
      }
    }

    return { selectedVariant: selectedVariant ?? definition.variants.default, dataByVariant }
  } catch {
    // Stored sessions are untrusted; a malformed value must not prevent editing.
    return null
  }
}

export function selectVariant(state: EditorState, selectedVariant: string): EditorState {
  return { ...state, selectedVariant }
}

export function resetVariant(state: EditorState): EditorState {
  const dataByVariant = { ...state.dataByVariant }
  delete dataByVariant[state.selectedVariant]
  return { ...state, dataByVariant }
}

export function updateField(state: EditorState, key: string, value: string | number | boolean): EditorState {
  return {
    ...state,
    dataByVariant: {
      ...state.dataByVariant,
      [state.selectedVariant]: { ...state.dataByVariant[state.selectedVariant], [key]: value },
    },
  }
}
