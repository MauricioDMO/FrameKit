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
  onError: () => void
}

interface RenderErrorBoundaryState {
  hasError: boolean
}

class RenderErrorBoundary extends Component<RenderErrorBoundaryProps, RenderErrorBoundaryState> {
  state: RenderErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError (): RenderErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch (): void {
    this.props.onError()
  }

  render () {
    return this.state.hasError ? null : this.props.children
  }
}

export function RenderClient ({ payload }: RenderClientProps) {
  const [state, setState] = useState<RenderState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false
    const setError = (code: RenderErrorCode) => {
      if (!cancelled) setState({ status: 'error', code })
    }

    setState({ status: 'loading' })
    const entry = templates.find((candidate) => candidate.slug === payload.template)
    if (!entry) {
      setError('template_not_found')
      return () => { cancelled = true }
    }

    void Promise.resolve()
      .then(() => entry.load())
      .then((module) => {
        if (cancelled) return

        const result = validateTemplateDefinition(module.default)
        if (!result.success) {
          setError('invalid_definition')
          return
        }

        const definition = result.definition
        if (
          definition.width !== payload.width ||
          definition.height !== payload.height ||
          !Object.prototype.hasOwnProperty.call(definition.content, payload.variant)
        ) {
          setError('job_definition_mismatch')
          return
        }

        setState({ status: 'loading', definition })
      })
      .catch(() => {
        setError('template_load_failed')
      })

    return () => { cancelled = true }
  }, [payload])

  useEffect(() => {
    if (state.status !== 'loading' || state.definition === undefined) return
    setState({ status: 'ready', definition: state.definition })
  }, [state])

  if (state.status === 'error') {
    return <main data-framekit-render-state="error" data-framekit-render-error={state.code} />
  }

  if (state.definition === undefined) {
    return <main data-framekit-render-state="loading" />
  }

  return (
    <main data-framekit-render-state={state.status}>
      <RenderErrorBoundary onError={() => setState({ status: 'error', code: 'render_component_failed' })}>
        <TemplateCanvas<TemplateDefinition>
          definition={state.definition}
          data={payload.data}
          assets={payload.assets}
          variant={payload.variant}
        />
      </RenderErrorBoundary>
    </main>
  )
}
