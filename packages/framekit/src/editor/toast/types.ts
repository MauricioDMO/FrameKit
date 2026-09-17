import type { ReactNode } from 'react'

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center-center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export interface ToastOptions {
  position?: ToastPosition
  duration?: number
  closeLabel?: string
  role?: 'status' | 'alert'
}

export interface BasicToastProps {
  message: string
}

export type ToastHandle = () => void

export interface ToastRecord {
  id: number
  content: ReactNode
  position: ToastPosition
  closeLabel: string
  role: 'status' | 'alert'
}
