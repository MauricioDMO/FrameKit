import { IconCopy, IconDownload, IconInfoCircle, IconRotate } from '@tabler/icons-react'

import type { EditorMessages } from '../types'

interface EditorHeaderProps {
  title: string
  messages: EditorMessages
  hasMetadata: boolean
  exporting: boolean
  onOpenMetadata: () => void
  onReset: () => void
  onExport: () => void
  onCopy: () => void
}

export function EditorHeader ({ title, messages, hasMetadata, exporting, onOpenMetadata, onReset, onExport, onCopy }: EditorHeaderProps) {
  return (
    <header className="flex min-h-20.5 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-fk-ivory-100 px-5 py-4 dark:border-white/10 dark:bg-fk-forest-200 sm:px-7">
      <div>
        <div className="flex flex-wrap items-start gap-x-10 gap-y-2">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.templateEditor}</p>
            <h1 className="mt-1 text-xl font-black tracking-tight">{title}</h1>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {hasMetadata && <button type="button" onClick={onOpenMetadata} aria-haspopup="dialog" aria-controls="template-metadata-dialog" className="inline-flex items-center gap-2 rounded-xl border border-fk-ivory-400 bg-fk-ivory-100 px-3.5 py-2.5 text-sm font-bold text-fk-sage-400 transition hover:bg-fk-ivory-200 focus:ring-2 focus:ring-fk-mint-300 focus:outline-none dark:border-white/15 dark:bg-fk-forest-200 dark:text-fk-sage-100 dark:hover:bg-fk-forest-100"><IconInfoCircle size={15} aria-hidden="true" />{messages.metadataLabel}</button>}
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-fk-ivory-400 bg-fk-ivory-100 px-3.5 py-2.5 text-sm font-bold text-fk-sage-400 transition hover:bg-fk-ivory-200 dark:border-white/15 dark:bg-fk-forest-200 dark:text-fk-sage-100 dark:hover:bg-fk-forest-100"><IconRotate size={15} />{messages.reset}</button>
        <button type="button" disabled={exporting} onClick={onExport} className="inline-flex items-center gap-2 rounded-xl bg-fk-forest-300 px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-fk-forest-400 disabled:cursor-not-allowed disabled:opacity-50"><IconDownload size={15} />{exporting ? messages.generating : messages.downloadPng}</button>
        <button type="button" disabled={exporting} onClick={onCopy} className="inline-flex items-center gap-2 rounded-xl border border-fk-ivory-400 bg-fk-ivory-100 px-3.5 py-2.5 text-sm font-bold text-fk-sage-400 transition hover:bg-fk-ivory-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-fk-forest-200 dark:text-fk-sage-100 dark:hover:bg-fk-forest-100"><IconCopy size={15} />{exporting ? messages.generating : messages.copyPng}</button>
      </div>
    </header>
  )
}
