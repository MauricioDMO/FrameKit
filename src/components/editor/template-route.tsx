'use client'

import { useEffect, useState } from 'react'

import { useLocale } from '@/i18n/locale-provider'
import type { TemplateDefinition } from '@/lib/framekit'
import { validateTemplateDefinition } from '@/lib/framekit'
import { templateRegistry } from '@/.framekit/registry'

import { FrameKitEditor } from './framekit-editor'

interface TemplateRouteProps {
  slug: string
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error'; message?: string }
  | { status: 'invalid'; message: string }
  | { status: 'ready'; definition: TemplateDefinition }

export function TemplateRoute({ slug }: TemplateRouteProps) {
  const [loadState, setLoadState] = useState<LoadState>({ status: 'loading' })
  const { messages: allMessages } = useLocale()
  const messages = allMessages.editor

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const loader = templateRegistry[slug]
        if (!loader) {
          if (!cancelled) setLoadState({ status: 'error' })
          return
        }

        const loaded = await loader()
        const validation = validateTemplateDefinition(loaded.default)

        if (!validation.success) {
          if (!cancelled) setLoadState({ status: 'invalid', message: validation.error })
          return
        }

        if (!cancelled) setLoadState({ status: 'ready', definition: validation.definition })
      } catch (err) {
        if (!cancelled) setLoadState({ status: 'error', message: String(err) })
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loadState.status === 'loading') {
    return <div>{messages.loadingLabel}</div>
  }

  if (loadState.status === 'error') {
    return <div>{loadState.message ?? messages.loadError}</div>
  }

  if (loadState.status === 'invalid') {
    return <div>{messages.invalidDefinition}</div>
  }

  return <FrameKitEditor slug={slug} definition={loadState.definition} messages={messages} />
}
