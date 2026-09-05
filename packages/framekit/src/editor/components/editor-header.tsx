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
    <header className="flex min-h-20.5 shrink-0 flex-wrap items-center justify-between gap-4 border-b border-black/8 bg-[#faf9f5] px-5 py-4 sm:px-7 dark:border-white/10 dark:bg-[#1d2923]">
      <div>
        <div className="flex flex-wrap items-start gap-x-10 gap-y-2">
          <div>
            <p className="text-[10px] font-bold tracking-[0.2em] text-[#4d675a] uppercase dark:text-[#a4b8ac]">{messages.templateEditor}</p>
            <h1 className="mt-1 text-xl font-black tracking-tight">{title}</h1>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {hasMetadata && <button type="button" onClick={onOpenMetadata} aria-haspopup="dialog" aria-controls="template-metadata-dialog" className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9] focus:ring-2 focus:ring-[#7fae98] focus:outline-none dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036] dark:focus:ring-[#c8f7d9]"><IconInfoCircle size={15} aria-hidden="true" />{messages.metadataLabel}</button>}
        <button type="button" onClick={onReset} className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9] dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]"><IconRotate size={15} />{messages.reset}</button>
        <button type="button" disabled={exporting} onClick={onExport} className="inline-flex items-center gap-2 rounded-xl bg-[#173d31] px-3.5 py-2.5 text-sm font-bold text-white transition hover:bg-[#0f2c23] disabled:cursor-not-allowed disabled:opacity-50"><IconDownload size={15} />{exporting ? messages.generating : messages.downloadPng}</button>
        <button type="button" disabled={exporting} onClick={onCopy} className="inline-flex items-center gap-2 rounded-xl border border-[#cccec8] bg-white px-3.5 py-2.5 text-sm font-bold text-[#4e5a53] transition hover:bg-[#efeee9] disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/15 dark:bg-[#24342c] dark:text-[#d7e2dc] dark:hover:bg-[#2d4036]"><IconCopy size={15} />{exporting ? messages.generating : messages.copyPng}</button>
      </div>
    </header>
  )
}
