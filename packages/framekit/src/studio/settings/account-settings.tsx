'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import { toast } from '@/editor/toast'
import type { StudioUser } from '@/studio/types'
import { requestStudioJson } from './api'
import { SettingsCard } from './settings-components'
import type { SettingsMessages } from './types'
import { errorMessage, inputClass, jsonRequest, primaryButtonClass, roleLabel, secondaryButtonClass } from './settings-utils'

type AccountSettingsProps = {
  user: StudioUser
  closeLabel: string
  messages: SettingsMessages['account']
  errors: SettingsMessages['errors']
  onUserChange: (user: StudioUser) => void
  onSessionEnded: () => void
}

export function AccountSettings ({ user, closeLabel, messages, errors, onUserChange, onSessionEnded }: AccountSettingsProps) {
  const [username, setUsername] = useState(user.username)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [usernamePending, setUsernamePending] = useState(false)
  const [passwordPending, setPasswordPending] = useState(false)
  const [logoutPending, setLogoutPending] = useState(false)
  const usernamePendingRef = useRef(false)
  const passwordPendingRef = useRef(false)
  const logoutPendingRef = useRef(false)
  const toastOptions = { closeLabel, position: 'top-center' as const }

  useEffect(() => {
    setUsername(user.username)
  }, [user.username])

  async function updateUsername (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (usernamePendingRef.current) return

    usernamePendingRef.current = true
    setUsernamePending(true)
    try {
      const updated = await requestStudioJson<StudioUser>('/api/framekit/account', jsonRequest('PATCH', { username }))
      onUserChange(updated)
      setUsername(updated.username)
      toast.success(messages.usernameUpdated, toastOptions)
    } catch (error) {
      toast.error(errorMessage(error, errors), toastOptions)
    } finally {
      usernamePendingRef.current = false
      setUsernamePending(false)
    }
  }

  async function updatePassword (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (passwordPendingRef.current) return

    passwordPendingRef.current = true
    setPasswordPending(true)
    try {
      await requestStudioJson<{ status: string }>('/api/framekit/account/password', jsonRequest('POST', { currentPassword, newPassword }))
      onSessionEnded()
    } catch (error) {
      toast.error(errorMessage(error, errors), toastOptions)
    } finally {
      passwordPendingRef.current = false
      setPasswordPending(false)
    }
  }

  async function logout (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (logoutPendingRef.current) return

    logoutPendingRef.current = true
    setLogoutPending(true)
    try {
      await requestStudioJson<{ status: string }>('/api/framekit/logout', { method: 'POST' })
      onSessionEnded()
    } catch (error) {
      toast.error(errorMessage(error, errors), toastOptions)
    } finally {
      logoutPendingRef.current = false
      setLogoutPending(false)
    }
  }

  return (
    <SettingsCard id="framekit-settings-account" title={messages.title} description={messages.description}>
      <dl className="mt-6 grid gap-4 border-y border-fk-ivory-400 py-4 dark:border-white/10 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-bold tracking-[0.14em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.usernameLabel}</dt>
          <dd className="mt-1 break-all text-base font-bold text-fk-forest-400 dark:text-fk-sage-100">{user.username}</dd>
        </div>
        <div>
          <dt className="text-xs font-bold tracking-[0.14em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.roleLabel}</dt>
          <dd className="mt-1 text-base font-bold text-fk-forest-400 dark:text-fk-sage-100">{roleLabel(user.role, messages)}</dd>
        </div>
      </dl>

      <form onSubmit={updateUsername} aria-busy={usernamePending} className="pt-5 dark:border-white/10">
        <h3 className="text-base font-black text-fk-forest-400 dark:text-fk-sage-100">{messages.usernameLabel}</h3>
        <label htmlFor="framekit-settings-username" className="mt-3 block text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">{messages.usernameLabel}</label>
        <input id="framekit-settings-username" name="username" type="text" autoComplete="username" required minLength={3} maxLength={64} value={username} disabled={usernamePending} onChange={(event) => setUsername(event.target.value)} className={inputClass} />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={usernamePending} className={primaryButtonClass}>{usernamePending ? messages.savingUsernameLabel : messages.saveUsernameLabel}</button>
        </div>
      </form>

      <form onSubmit={updatePassword} aria-busy={passwordPending} className="mt-6 border-t border-fk-ivory-400 pt-5 dark:border-white/10">
        <h3 className="text-base font-black text-fk-forest-400 dark:text-fk-sage-100">{messages.passwordTitle}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">
            {messages.currentPasswordLabel}
            <input name="currentPassword" type="password" autoComplete="current-password" required value={currentPassword} disabled={passwordPending} onChange={(event) => setCurrentPassword(event.target.value)} className={inputClass} />
          </label>
          <label className="block text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">
            {messages.newPasswordLabel}
            <input name="newPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={newPassword} disabled={passwordPending} onChange={(event) => setNewPassword(event.target.value)} className={inputClass} />
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="submit" disabled={passwordPending} className={primaryButtonClass}>{passwordPending ? messages.changingPasswordLabel : messages.changePasswordLabel}</button>
        </div>
      </form>

      <form onSubmit={logout} className="mt-6 border-t border-fk-ivory-400 pt-5 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button type="submit" disabled={logoutPending} className={secondaryButtonClass}>{logoutPending ? messages.loggingOutLabel : messages.logoutLabel}</button>
        </div>
      </form>
    </SettingsCard>
  )
}
