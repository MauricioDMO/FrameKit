'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import type { FrameKitLocale } from '@/studio/i18n/messages'
import type { StudioUser } from '@/studio/types'
import { requestStudioJson } from './api'
import { Feedback, SettingsCard } from './settings-components'
import type { FeedbackState, ManagedStudioUser, SettingsMessages } from './types'
import { errorMessage, inputClass, jsonRequest, primaryButtonClass, readUsers, selectClass } from './settings-utils'
import { ManagedUserRow } from './managed-user-row'

type AdminUsersSettingsProps = {
  currentUser: StudioUser
  locale: FrameKitLocale
  messages: SettingsMessages['users']
  tokenMessages: SettingsMessages['tokens']
  errors: SettingsMessages['errors']
  onUserChange: (user: StudioUser) => void
  onSessionEnded: () => void
}

export function AdminUsersSettings ({ currentUser, locale, messages, tokenMessages, errors, onUserChange, onSessionEnded }: AdminUsersSettingsProps) {
  const [users, setUsers] = useState<ManagedStudioUser[]>([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<FeedbackState>()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<StudioUser['role']>('user')
  const [createPending, setCreatePending] = useState(false)
  const createPendingRef = useRef(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    readUsers().then((value) => {
      if (!cancelled) {
        setUsers(value)
        setFeedback(undefined)
      }
    }).catch((error) => {
      if (!cancelled) setFeedback({ message: errorMessage(error, errors), tone: 'error' })
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [errors])

  async function refreshUsers () {
    try {
      setUsers(await readUsers())
      setFeedback(undefined)
    } catch (error) {
      setFeedback({ message: errorMessage(error, errors), tone: 'error' })
    }
  }

  async function createUser (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (createPendingRef.current) return

    createPendingRef.current = true
    setCreatePending(true)
    setFeedback(undefined)
    try {
      await requestStudioJson<StudioUser>('/api/framekit/users', jsonRequest('POST', { username, password, role }))
      setUsername('')
      setPassword('')
      setRole('user')
      await refreshUsers()
    } catch (error) {
      setFeedback({ message: errorMessage(error, errors), tone: 'error' })
    } finally {
      createPendingRef.current = false
      setCreatePending(false)
    }
  }

  return (
    <SettingsCard id="framekit-settings-users" title={messages.title} description={messages.description} className="xl:col-span-2">
      <form onSubmit={createUser} aria-busy={createPending} className="mt-6 rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-fk-forest-100/60 sm:p-5">
        <h3 className="text-base font-black text-fk-forest-400 dark:text-fk-sage-100">{messages.createTitle}</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <label htmlFor="framekit-settings-new-user" className="block text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">
            {messages.usernameLabel}
            <input id="framekit-settings-new-user" name="username" type="text" autoComplete="off" required minLength={3} maxLength={64} value={username} disabled={createPending} onChange={(event) => setUsername(event.target.value)} className={inputClass} />
          </label>
          <label htmlFor="framekit-settings-new-password" className="block text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">
            {messages.passwordLabel}
            <input id="framekit-settings-new-password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={password} disabled={createPending} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
          </label>
          <label htmlFor="framekit-settings-new-role" className="block text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">
            {messages.roleLabel}
            <select id="framekit-settings-new-role" name="role" value={role} disabled={createPending} onChange={(event) => setRole(event.target.value as StudioUser['role'])} className={selectClass}>
              <option value="user">{messages.userRole}</option>
              <option value="admin">{messages.administratorRole}</option>
            </select>
          </label>
        </div>
        <button type="submit" disabled={createPending} className={`${primaryButtonClass} mt-4`}>{createPending ? messages.creatingLabel : messages.createLabel}</button>
      </form>
      <div className="mt-4"><Feedback {...feedback} /></div>

      <div className="mt-7 border-t border-black/5 pt-6 dark:border-white/10">
        {loading && <p aria-busy="true" className="mt-5 text-sm text-fk-sage-400 dark:text-fk-sage-200">{messages.loadingLabel}</p>}
        {!loading && users.length === 0 && <p className="mt-5 text-sm text-fk-sage-400 dark:text-fk-sage-200">{messages.empty}</p>}
        {!loading && users.length > 0 && (
          <ul className="mt-5 space-y-4">
            {users.map((managedUser) => (
              <ManagedUserRow key={managedUser.id} managedUser={managedUser} currentUser={currentUser} locale={locale} messages={messages} tokenMessages={tokenMessages} errors={errors} onRefresh={refreshUsers} onUserChange={onUserChange} onSessionEnded={onSessionEnded} />
            ))}
          </ul>
        )}
      </div>
    </SettingsCard>
  )
}
