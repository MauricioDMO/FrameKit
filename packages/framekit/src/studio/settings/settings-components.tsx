'use client'

import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import type { FeedbackTone } from './types'

export function Feedback ({ message, tone = 'error' }: { message?: string, tone?: FeedbackTone }) {
  const feedbackRef = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (message && tone === 'error') feedbackRef.current?.focus()
  }, [message, tone])

  if (!message) return null

  return (
    <p
      ref={feedbackRef}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live="polite"
      tabIndex={tone === 'error' ? -1 : undefined}
      className={tone === 'error'
        ? 'rounded-xl border border-red-700/20 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-200/20 dark:bg-red-950/30 dark:text-red-100'
        : 'rounded-xl border border-fk-mint-300/40 bg-fk-mint-100/30 px-4 py-3 text-sm leading-6 text-fk-forest-400 dark:border-fk-mint-200/30 dark:bg-fk-mint-200/10 dark:text-fk-mint-100'}
    >
      {message}
    </p>
  )
}

export function SettingsCard ({ id, title, description, children, className = '' }: { id: string, title: string, description: string, children: ReactNode, className?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={`rounded-3xl border border-black/5 bg-fk-ivory-100 p-5 shadow-xl dark:border-white/10 dark:bg-fk-forest-200 sm:p-7 ${className}`}>
      <header>
        <h2 id={`${id}-title`} className="text-2xl font-black tracking-[-0.03em] text-fk-forest-400 dark:text-fk-sage-100">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-fk-sage-400 dark:text-fk-sage-200">{description}</p>
      </header>
      {children}
    </section>
  )
}
