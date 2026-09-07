'use client'

import { Component, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

import { validateTemplateDefinition } from '@mauriciodmo/framekit'
import { TemplateCanvas } from '@mauriciodmo/framekit/editor'
import type { TemplateDefinition } from '@mauriciodmo/framekit'
import type { ResolvedRenderPayload } from '@mauriciodmo/framekit/server'
import { templates } from '@framekit/generated/templates'

interface RenderClientProps {
  payload: ResolvedRenderPayload
}

type RenderErrorCode =
  | 'template_not_found'
  | 'template_load_failed'
  | 'invalid_definition'
  | 'job_definition_mismatch'
  | 'render_component_failed'

type RenderState =
  | { status: 'loading'; definition?: TemplateDefinition }
  | { status: 'ready'; definition: TemplateDefinition }
  | { status: 'error'; code: RenderErrorCode }

interface RenderErrorBoundaryProps {
  children: ReactNode
}

interface RenderErrorBoundaryState {
  hasError: boolean
}

class RenderErrorBoundary extends Component<RenderErrorBoundaryProps, RenderErrorBoundaryState> {
  state: RenderErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError (): RenderErrorBoundaryState {
    return { hasError: true }
  }

  render () {
    if (this.state.hasError) {
      return <main data-framekit-render-state="error" data-framekit-render-error="render_component_failed" />
    }
    return this.props.children
  }
}

interface RenderSnapshot {
  payload: ResolvedRenderPayload
  state: RenderState
}

export function RenderClient ({ payload }: RenderClientProps) {
  const [snapshot, setSnapshot] = useState<RenderSnapshot>({ payload, state: { status: 'loading' } })
  const state = snapshot.payload === payload ? snapshot.state : { status: 'loading' as const }

  useEffect(() => {
    let cancelled = false
    const updateState = (nextState: RenderState) => {
      if (!cancelled) setSnapshot({ payload, state: nextState })
    }

    updateState({ status: 'loading' })
    const entry = templates.find((candidate) => candidate.slug === payload.template)
    if (!entry) {
      updateState({ status: 'error', code: 'template_not_found' })
      return () => { cancelled = true }
    }

    void Promise.resolve()
      .then(() => entry.load())
      .then((module) => {
        if (cancelled) return

        const result = validateTemplateDefinition(module.default)
        if (!result.success) {
          updateState({ status: 'error', code: 'invalid_definition' })
          return
        }

        const definition = result.definition
        if (
          definition.width !== payload.width ||
          definition.height !== payload.height ||
          !Object.prototype.hasOwnProperty.call(definition.content, payload.variant)
        ) {
          updateState({ status: 'error', code: 'job_definition_mismatch' })
          return
        }

        updateState({ status: 'loading', definition })
      })
      .catch(() => {
        updateState({ status: 'error', code: 'template_load_failed' })
      })

    return () => { cancelled = true }
  }, [payload])

  useEffect(() => {
    const snapshotState = snapshot.state
    if (snapshot.payload !== payload || snapshotState.status !== 'loading' || snapshotState.definition === undefined) return
    const definition = snapshotState.definition
    setSnapshot((current) => {
      const currentState = current.state
      if (current.payload !== payload || currentState.status !== 'loading' || currentState.definition !== definition) return current
      return { payload, state: { status: 'ready', definition } }
    })
  }, [payload, snapshot])

  if (state.status === 'error') {
    return <main data-framekit-render-state="error" data-framekit-render-error={state.code} />
  }

  if (state.definition === undefined) {
    return <main data-framekit-render-state="loading" />
  }

  return (
    <RenderErrorBoundary>
      <main data-framekit-render-state={state.status}>
        <TemplateCanvas<TemplateDefinition>
          definition={state.definition}
          data={payload.data}
          assets={payload.assets}
          variant={payload.variant}
        />
      </main>
    </RenderErrorBoundary>
  )
}
