import { IconCopy, IconDownload, IconInfoCircle } from '@tabler/icons-react'
import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'

import type { EditorMessages } from '../types'

interface EditorHeaderProps {
  title: string
  messages: EditorMessages
  hasMetadata: boolean
  exporting: boolean
  onOpenMetadata: () => void
  onExport: () => void
  onCopy: () => void
}

export function EditorHeader ({ title, messages, hasMetadata, exporting, onOpenMetadata, onExport, onCopy }: EditorHeaderProps) {
  const [actionsOpen, setActionsOpen] = useState(false)
  const touchReveal = useRef(false)

  function handleExportPointerDown (event: PointerEvent<HTMLButtonElement>) {
    if (event.pointerType === 'touch' && !actionsOpen) {
      touchReveal.current = true
      setActionsOpen(true)
    }
  }

  function handleExportClick () {
    if (touchReveal.current) {
      touchReveal.current = false
      return
    }
    setActionsOpen(false)
    onExport()
  }

  const copyPanelVisibility = actionsOpen
    ? 'h-auto pointer-events-auto'
    : 'h-0 pointer-events-none group-hover:h-auto group-hover:pointer-events-auto group-focus-within:h-auto group-focus-within:pointer-events-auto'

  const copyVisibility = actionsOpen
    ? 'pointer-events-auto translate-y-0 opacity-100'
    : 'pointer-events-none -translate-y-1 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100'

  return (
    <header className="flex min-h-20.5 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-fk-ivory-100 py-4 pl-5 pr-4 dark:border-white/10 dark:bg-fk-forest-200 sm:pl-7">
      <div className="min-w-0">
        <p className="text-[10px] font-bold tracking-[0.2em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.templateEditor}</p>
        <div className="mt-1 flex min-w-0 items-center gap-2">
          <h1 className="min-w-0 text-xl font-black tracking-tight">{title}</h1>
          {hasMetadata &&
            <button
              type="button"
              title={messages.metadataLabel}
              onClick={onOpenMetadata}
              aria-label={messages.metadataLabel}
              aria-haspopup="dialog"
              aria-controls="template-metadata-dialog"
              className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-fk-sage-400 transition hover:bg-fk-ivory-200 focus:ring-2 focus:ring-fk-mint-300 focus:outline-none dark:text-fk-sage-100 dark:hover:bg-fk-forest-100"
              >
                <IconInfoCircle size={18} aria-hidden="true" />
              </button>
          }
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <div
          className="group relative w-40"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setActionsOpen(false)
          }}
        >
          <button
            type="button"
            disabled={exporting}
            onPointerDown={handleExportPointerDown}
            onPointerCancel={() => { touchReveal.current = false }}
            onClick={handleExportClick}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-fk-ivory-400 bg-fk-ivory-100 px-3.5 py-2.5 text-sm font-bold whitespace-nowrap text-fk-sage-400 transition hover:bg-fk-ivory-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-fk-forest-200 dark:text-fk-sage-100 dark:hover:bg-fk-forest-100"
          >
            <IconDownload size={15} aria-hidden="true" />
            {exporting ? messages.generating : messages.downloadPng}
          </button>
          {!exporting &&
            <div className={`absolute top-full right-0 z-10 w-full overflow-hidden pt-1 transition-[height] duration-150 ease-out [interpolate-size:allow-keywords] motion-reduce:transition-none ${copyPanelVisibility}`}>
              <button
                type="button"
                onClick={() => { setActionsOpen(false); onCopy() }}
                className={`inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-fk-ivory-400 bg-fk-ivory-100 px-3.5 py-2.5 text-sm font-bold text-fk-sage-400 transition-[opacity,transform] duration-150 ease-out motion-reduce:transition-none dark:border-white/15 dark:bg-fk-forest-200 dark:text-fk-sage-100 dark:hover:bg-fk-forest-100 ${copyVisibility}`}
              >
                <IconCopy size={15} aria-hidden="true" />
                {messages.copyPng}
              </button>
            </div>}
        </div>
      </div>
    </header>
  )
}
