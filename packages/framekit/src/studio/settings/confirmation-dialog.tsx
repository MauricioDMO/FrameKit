'use client'

import { useEffect, useRef, useState } from 'react'

import { dangerButtonClass, secondaryButtonClass } from './settings-utils'

export function ConfirmationDialog ({ open, title, description, confirmLabel, cancelLabel, onCancel, onConfirm }: { open: boolean, title: string, description: string, confirmLabel: string, cancelLabel: string, onCancel: () => void, onConfirm: () => Promise<void> }) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const cancelRef = useRef<HTMLButtonElement>(null)
  const confirmRef = useRef<HTMLButtonElement>(null)
  const onCancelRef = useRef(onCancel)
  const pendingRef = useRef(false)
  const [pending, setPending] = useState(false)

  onCancelRef.current = onCancel

  useEffect(() => {
    if (pending) dialogRef.current?.focus()
  }, [pending])

  useEffect(() => {
    if (!open) return

    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    function handleKeyDown (event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (pendingRef.current) return
        event.preventDefault()
        onCancelRef.current()
        return
      }

      if (event.key !== 'Tab') return

      const focusable: HTMLElement[] = pendingRef.current
        ? [dialogRef.current].filter((element): element is HTMLDivElement => element !== null)
        : [cancelRef.current, confirmRef.current].filter((button): button is HTMLButtonElement => button !== null && !button.disabled)
      if (focusable.length === 0) return

      const currentIndex = focusable.indexOf(document.activeElement as HTMLElement)
      const nextIndex = event.shiftKey
        ? currentIndex <= 0 ? focusable.length - 1 : currentIndex - 1
        : currentIndex < 0 ? 0 : (currentIndex + 1) % focusable.length
      event.preventDefault()
      focusable[nextIndex].focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    cancelRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [open])

  if (!open) return null

  async function confirm () {
    if (pendingRef.current) return
    pendingRef.current = true
    setPending(true)
    try {
      await onConfirm()
    } finally {
      pendingRef.current = false
      setPending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-fk-forest-400/60 p-5" role="presentation">
      <div ref={dialogRef} role="dialog" tabIndex={pending ? 0 : -1} aria-modal="true" aria-labelledby="framekit-confirm-title" aria-describedby="framekit-confirm-description" className="w-full max-w-md rounded-lg border border-fk-ivory-400 bg-fk-ivory-100 p-5 shadow-lg dark:border-white/10 dark:bg-fk-forest-200 sm:p-6">
        <h2 id="framekit-confirm-title" className="text-2xl font-black tracking-[-0.03em] text-fk-forest-400 dark:text-fk-sage-100">{title}</h2>
        <p id="framekit-confirm-description" className="mt-2 leading-6 text-fk-sage-400 dark:text-fk-sage-200">{description}</p>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button ref={cancelRef} type="button" disabled={pending} onClick={onCancel} className={secondaryButtonClass}>{cancelLabel}</button>
          <button ref={confirmRef} type="button" disabled={pending} onClick={() => { confirm() }} className={dangerButtonClass}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
