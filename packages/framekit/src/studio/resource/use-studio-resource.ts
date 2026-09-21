'use client'

import type { ComponentType } from 'react'
import { useEffect, useState } from 'react'

import { validateTemplateDefinition } from '@/core/validation'
import type { TemplateDefinition, TemplateRegistryEntry } from '@/types'
import type { FrameKitStudioBrand, FrameKitStudioSection } from '@/studio/types'

export type StudioResourceState =
  | { status: 'loading' }
  | { status: 'not-found' }
  | { status: 'error', kind: 'template' | 'brand' }
  | { status: 'invalid' }
  | { status: 'ready', kind: 'template', entry: TemplateRegistryEntry, definition: TemplateDefinition }
  | { status: 'ready', kind: 'brand', preview: ComponentType, component: FrameKitStudioBrand }

type LoadSnapshot = { routeKey: string, state: StudioResourceState }

export type StudioResourceInput = {
  slug: string | undefined
  section: FrameKitStudioSection
  templates: readonly TemplateRegistryEntry[]
  brands: readonly FrameKitStudioBrand[]
}

export function useStudioResource ({ slug, section, templates, brands }: StudioResourceInput): StudioResourceState {
  const routeKey = `${section}:${slug ?? ''}`
  const [loadSnapshot, setLoadSnapshot] = useState<LoadSnapshot>({ routeKey, state: { status: 'loading' } })
  const loadState = loadSnapshot.routeKey === routeKey ? loadSnapshot.state : { status: 'loading' as const }

  useEffect(() => {
    const routeKey = `${section}:${slug ?? ''}`
    let cancelled = false
    function updateLoadState (state: StudioResourceState) {
      if (!cancelled) setLoadSnapshot({ routeKey, state })
    }

    if (section === 'settings' || !slug) return

    updateLoadState({ status: 'loading' })
    if (section === 'brand') {
      const entry = brands.find((candidate) => candidate.slug === slug)
      if (!entry) return updateLoadState({ status: 'not-found' })

      entry.load().then((module) => {
        updateLoadState({ status: 'ready', kind: 'brand', preview: module.default as ComponentType, component: entry })
      }).catch(() => {
        updateLoadState({ status: 'error', kind: 'brand' })
      })
    } else {
      const entry = templates.find((candidate) => candidate.slug === slug)
      if (!entry) return updateLoadState({ status: 'not-found' })

      entry.load().then((module) => {
        if (cancelled) return
        const result = validateTemplateDefinition(module.default as TemplateDefinition)
        if (!result.success || result.definition.width !== entry.width || result.definition.height !== entry.height) {
          updateLoadState({ status: 'invalid' })
          return
        }
        updateLoadState({ status: 'ready', kind: 'template', entry, definition: result.definition })
      }).catch(() => {
        updateLoadState({ status: 'error', kind: 'template' })
      })
    }

    return () => { cancelled = true }
  }, [slug, section, templates, brands])

  return loadState
}
