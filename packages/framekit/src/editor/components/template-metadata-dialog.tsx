import { IconX } from '@tabler/icons-react'
import { useEffect, useRef } from 'react'

import type { TemplateMeta } from '../../types'
import type { EditorMessages } from '../types'

interface TemplateMetadataDialogProps {
  open: boolean
  meta: TemplateMeta
  messages: EditorMessages
  onClose: () => void
}

export function TemplateMetadataDialog ({ open, meta, messages, onClose }: TemplateMetadataDialogProps) {
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    function closeOnEscape (event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', closeOnEscape)
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', closeOnEscape)
      previousFocus?.focus()
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#10271f]/60 p-4" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}>
      <div id="template-metadata-dialog" role="dialog" aria-modal="true" aria-labelledby="template-metadata-title" className="max-h-[80vh] w-full max-w-xl overflow-hidden rounded-2xl border border-black/10 bg-[#faf9f5] shadow-[0_24px_80px_rgba(16,39,31,0.32)] dark:border-white/10 dark:bg-[#1d2923]">
        <div className="flex items-start justify-between gap-4 border-b border-black/8 px-5 py-4 dark:border-white/10 sm:px-6">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#4d675a] uppercase dark:text-[#a4b8ac]">{messages.metadataLabel}</p>
            <h2 id="template-metadata-title" className="mt-1 text-xl font-black tracking-tight">{meta.title}</h2>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={messages.closeLabel} title={messages.closeLabel} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-[#4e5a53] transition hover:bg-[#efeee9] focus:ring-2 focus:ring-[#7fae98] focus:outline-none dark:text-[#d7e2dc] dark:hover:bg-[#2d4036] dark:focus:ring-[#c8f7d9]"><IconX size={18} aria-hidden="true" /></button>
        </div>
        <div className="max-h-[60vh] space-y-6 overflow-y-auto p-5 sm:p-6">
          <TemplateTags meta={meta} messages={messages} />
          <TemplateMetadata meta={meta} messages={messages} />
        </div>
      </div>
    </div>
  )
}

function TemplateMetadata ({ meta, messages }: { meta: TemplateMeta, messages: EditorMessages }) {
  if (meta.description === undefined && meta.marketingDescription === undefined) return null

  return (
    <dl className="space-y-5 text-sm text-[#59665f] dark:text-[#b8c8be]">
      {meta.description !== undefined && (
        <div>
          <dt className="font-bold tracking-[0.12em] text-[#537568] uppercase dark:text-[#91ae9f]">{messages.descriptionLabel}</dt>
          <dd className="mt-1 leading-6">{meta.description}</dd>
        </div>
      )}
      {meta.marketingDescription !== undefined && (
        <div>
          <dt className="font-bold tracking-[0.12em] text-[#537568] uppercase dark:text-[#91ae9f]">{messages.marketingDescriptionLabel}</dt>
          <dd className="mt-1 leading-6">{meta.marketingDescription}</dd>
        </div>
      )}
    </dl>
  )
}

function TemplateTags ({ meta, messages }: { meta: TemplateMeta, messages: EditorMessages }) {
  if (!meta.tags || meta.tags.length === 0) return null

  return (
    <div>
      <p className="font-bold text-[10px] tracking-[0.12em] text-[#537568] uppercase dark:text-[#91ae9f]">{messages.tagsLabel}</p>
      <ul aria-label={messages.tagsLabel} className="mt-1 flex flex-wrap gap-1.5 text-xs text-[#59665f] dark:text-[#b8c8be]">
        {meta.tags.map((tag) => <li key={tag} className="rounded-full border border-[#cccec8] px-2 py-0.5 dark:border-white/15">{tag}</li>)}
      </ul>
    </div>
  )
}
