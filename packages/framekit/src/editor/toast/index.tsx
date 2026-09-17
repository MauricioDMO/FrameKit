import { createRoot } from 'react-dom/client'
import type { ReactNode } from 'react'

import { ErrorToast, InfoToast, SuccessToast } from './components'
import { ToastPortal } from './portal'
import type { ToastHandle, ToastOptions, ToastRecord } from './types'

const defaultDuration = 4000
const defaultCloseLabel = 'Close notification'

let nextToastId = 1
let activeToasts: ToastRecord[] = []
let portalRoot: ReturnType<typeof createRoot> | undefined
const timers = new Map<number, ReturnType<typeof setTimeout>>()
const listeners = new Set<() => void>()

function notify (): void {
  listeners.forEach((listener) => listener())
}

function subscribe (listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function getToasts (): readonly ToastRecord[] {
  return activeToasts
}

function dismissToast (id: number): void {
  const timer = timers.get(id)
  if (timer !== undefined) clearTimeout(timer)
  timers.delete(id)

  const nextToasts = activeToasts.filter((toast) => toast.id !== id)
  if (nextToasts.length === activeToasts.length) return
  activeToasts = nextToasts
  notify()

  if (activeToasts.length === 0 && portalRoot !== undefined) {
    const root = portalRoot
    queueMicrotask(() => {
      if (activeToasts.length > 0 || portalRoot !== root) return
      portalRoot = undefined
      root.unmount()
    })
  }
}

function ensurePortalRoot (): void {
  if (portalRoot !== undefined || typeof document === 'undefined' || !document.body) return

  const mountNode = document.createElement('div')
  portalRoot = createRoot(mountNode)
  portalRoot.render(<ToastPortal getToasts={getToasts} subscribe={subscribe} onDismiss={dismissToast} />)
}

function showToast (content: ReactNode, options: ToastOptions = {}): ToastHandle {
  if (typeof document === 'undefined' || !document.body) return () => {}

  const id = nextToastId++
  activeToasts = [...activeToasts, {
    id,
    content,
    position: options.position ?? 'top-right',
    closeLabel: options.closeLabel ?? defaultCloseLabel,
    role: options.role ?? 'status'
  }]

  ensurePortalRoot()
  notify()

  const duration = options.duration ?? defaultDuration
  if (duration !== Infinity && duration > 0) {
    timers.set(id, setTimeout(() => dismissToast(id), duration))
  }

  return () => dismissToast(id)
}

export const toast = Object.assign(showToast, {
  success: (message: string, options?: ToastOptions): ToastHandle => showToast(<SuccessToast message={message} />, { ...options, role: options?.role ?? 'status' }),
  error: (message: string, options?: ToastOptions): ToastHandle => showToast(<ErrorToast message={message} />, { ...options, role: options?.role ?? 'alert' }),
  info: (message: string, options?: ToastOptions): ToastHandle => showToast(<InfoToast message={message} />, { ...options, role: options?.role ?? 'status' })
})

export { ErrorToast, InfoToast, SuccessToast }
export type { BasicToastProps, ToastHandle, ToastOptions, ToastPosition } from './types'
