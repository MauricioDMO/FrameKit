import { IconX } from '@tabler/icons-react'
import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import type { ToastPosition, ToastRecord } from './types'

interface ToastPortalProps {
  getToasts: () => readonly ToastRecord[]
  subscribe: (listener: () => void) => () => void
  onDismiss: (id: number) => void
}

const positionClasses: Record<ToastPosition, string> = {
  'top-left': 'top-0 left-0 items-start',
  'top-center': 'top-0 left-1/2 -translate-x-1/2 items-center',
  'top-right': 'top-0 right-0 items-end',
  'center-left': 'top-1/2 left-0 -translate-y-1/2 items-start',
  'center-center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 items-center',
  'center-right': 'top-1/2 right-0 -translate-y-1/2 items-end',
  'bottom-left': 'bottom-0 left-0 items-start',
  'bottom-center': 'bottom-0 left-1/2 -translate-x-1/2 items-center',
  'bottom-right': 'bottom-0 right-0 items-end'
}

function ToastItem ({ toast, onDismiss }: { toast: ToastRecord, onDismiss: (id: number) => void }) {
  return (
    <div
      role={toast.role}
      aria-atomic="true"
      className="pointer-events-auto relative w-full"
    >
      {toast.content}
      <button
        type="button"
        data-framekit-toast-dismiss="true"
        aria-label={toast.closeLabel}
        title={toast.closeLabel}
        onClick={() => onDismiss(toast.id)}
        className="absolute top-2 right-2 inline-flex size-7 items-center justify-center rounded-lg text-current/60 transition hover:bg-black/5 hover:text-current focus:ring-2 focus:ring-fk-mint-300 focus:outline-none dark:hover:bg-white/10 dark:focus:ring-fk-mint-200"
      >
        <IconX size={16} aria-hidden="true" />
      </button>
    </div>
  )
}

export function ToastPortal ({ getToasts, subscribe, onDismiss }: ToastPortalProps) {
  const activeToasts = useSyncExternalStore(subscribe, getToasts, () => [])

  if (typeof document === 'undefined' || !document.body) return null

  return createPortal(
    <>
      {Object.entries(positionClasses).map(([position, classes]) => {
        const positionToasts = activeToasts.filter((toast) => toast.position === position)
        if (positionToasts.length === 0) return null

        return (
          <div
            key={position}
            className={`pointer-events-none fixed z-[100] flex w-96 max-w-[calc(100vw-2rem)] flex-col gap-3 p-4 sm:p-6 ${classes}`}
          >
            {positionToasts.map((toast) => <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />)}
          </div>
        )
      })}
    </>,
    document.body
  )
}
