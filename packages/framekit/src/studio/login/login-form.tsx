'use client'

import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { useFrameKitLocale } from '@/studio/i18n/locale-provider'
import { FrameKitLogo } from '@/studio/shell/framekit-logo'

type LoginStatus = 'idle' | 'pending' | 'invalid' | 'error'

export function FrameKitLoginForm () {
  const router = useRouter()
  const { messages } = useFrameKitLocale()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<LoginStatus>('idle')
  const pendingRef = useRef(false)
  const pending = status === 'pending'
  const feedback = status === 'invalid'
    ? messages.login.invalidCredentials
    : status === 'error'
      ? messages.login.serverError
      : undefined

  function clearFeedback () {
    if (status !== 'pending') setStatus('idle')
  }

  async function handleSubmit (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (pendingRef.current) return

    pendingRef.current = true
    setStatus('pending')

    try {
      const response = await fetch('/api/framekit/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ username, password })
      })

      if (response.ok) {
        router.replace('/editor')
        return
      }

      setStatus(response.status === 401 ? 'invalid' : 'error')
    } catch {
      setStatus('error')
    } finally {
      pendingRef.current = false
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-fk-ivory-200 px-5 py-12 dark:bg-fk-forest-400 sm:px-8">
      <section aria-labelledby="framekit-login-title" className="w-full max-w-md rounded-3xl border border-black/5 bg-fk-ivory-100 p-6 shadow-2xl dark:border-white/10 dark:bg-fk-forest-200 sm:p-9">
        <div className="flex flex-col items-center text-center">
          <FrameKitLogo aria-hidden="true" className="size-16 text-fk-forest-300 dark:text-fk-mint-200" />
          <p className="mt-5 text-xs font-bold tracking-[0.24em] text-fk-sage-400 uppercase dark:text-fk-sage-300">FrameKit</p>
          <h1 id="framekit-login-title" className="mt-3 text-3xl font-black tracking-[-0.04em] text-fk-forest-400 dark:text-fk-sage-100">{messages.login.title}</h1>
          <p className="mt-3 leading-7 text-fk-sage-400 dark:text-fk-sage-200">{messages.login.description}</p>
        </div>

        <form onSubmit={handleSubmit} aria-busy={pending} className="mt-8 space-y-5">
          <div>
            <label htmlFor="framekit-login-username" className="text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">{messages.login.usernameLabel}</label>
            <input
              id="framekit-login-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              value={username}
              disabled={pending}
              onChange={(event) => {
                setUsername(event.target.value)
                clearFeedback()
              }}
              className="mt-2 min-h-12 w-full rounded-xl border border-fk-ivory-400 bg-white px-4 text-base text-fk-forest-400 outline-none transition placeholder:text-fk-sage-400 focus:ring-2 focus:ring-fk-forest-300 dark:border-white/15 dark:bg-fk-forest-100 dark:text-white dark:placeholder:text-fk-sage-300 dark:focus:ring-fk-mint-200"
            />
          </div>

          <div>
            <label htmlFor="framekit-login-password" className="text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">{messages.login.passwordLabel}</label>
            <input
              id="framekit-login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              disabled={pending}
              onChange={(event) => {
                setPassword(event.target.value)
                clearFeedback()
              }}
              className="mt-2 min-h-12 w-full rounded-xl border border-fk-ivory-400 bg-white px-4 text-base text-fk-forest-400 outline-none transition placeholder:text-fk-sage-400 focus:ring-2 focus:ring-fk-forest-300 dark:border-white/15 dark:bg-fk-forest-100 dark:text-white dark:placeholder:text-fk-sage-300 dark:focus:ring-fk-mint-200"
            />
          </div>

          {feedback && <p role="alert" aria-live="polite" className="rounded-xl border border-red-700/20 bg-red-50 px-4 py-3 text-sm leading-6 text-red-800 dark:border-red-200/20 dark:bg-red-950/30 dark:text-red-100">{feedback}</p>}

          <button type="submit" disabled={pending} className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-fk-forest-300 px-4 text-sm font-bold text-white transition hover:bg-fk-forest-400 focus:ring-2 focus:ring-fk-mint-300 focus:outline-none disabled:cursor-wait disabled:opacity-60">
            {pending ? messages.login.pendingLabel : messages.login.submitLabel}
          </button>
        </form>
      </section>
    </main>
  )
}
