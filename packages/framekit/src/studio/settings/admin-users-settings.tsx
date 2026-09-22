'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import Link from 'next/link'

import type { StudioUser } from '@/studio/types'
import { requestStudioJson } from './api'
import { Feedback, SettingsCard } from './settings-components'
import type { FeedbackState, ManagedStudioUser, SettingsMessages } from './types'
import { errorMessage, inputClass, jsonRequest, primaryButtonClass, readUsers, roleLabel, secondaryButtonClass, selectClass } from './settings-utils'

type AdminUsersSettingsProps = {
  messages: SettingsMessages['users']
  errors: SettingsMessages['errors']
}

export function AdminUsersSettings ({ messages, errors }: AdminUsersSettingsProps) {
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
      <form onSubmit={createUser} aria-busy={createPending} className="mt-5 border-y border-fk-ivory-400 py-4 dark:border-white/10 sm:py-5">
        <h3 className="text-base font-black text-fk-forest-400 dark:text-fk-sage-100">{messages.createTitle}</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
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
        <button type="submit" disabled={createPending} className={`${primaryButtonClass} mt-3`}>{createPending ? messages.creatingLabel : messages.createLabel}</button>
      </form>
      <div className="mt-3"><Feedback {...feedback} /></div>

      <div className="mt-6 border-t border-fk-ivory-400 pt-5 dark:border-white/10">
        {loading && <p aria-busy="true" className="mt-4 text-sm text-fk-sage-400 dark:text-fk-sage-200">{messages.loadingLabel}</p>}
        {!loading && users.length === 0 && <p className="mt-4 text-sm text-fk-sage-400 dark:text-fk-sage-200">{messages.empty}</p>}
        {!loading && users.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
              <caption className="sr-only">{messages.title}</caption>
              <thead className="border-y border-fk-ivory-400 dark:border-white/10">
                <tr>
                  <th scope="col" className="px-3 py-3 text-xs font-bold tracking-[0.12em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.usernameLabel}</th>
                  <th scope="col" className="px-3 py-3 text-xs font-bold tracking-[0.12em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.roleLabel}</th>
                  <th scope="col" className="px-3 py-3 text-xs font-bold tracking-[0.12em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.activeLabel}</th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-bold tracking-[0.12em] text-fk-sage-400 uppercase dark:text-fk-sage-300">{messages.editLabel}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-fk-ivory-400 dark:divide-white/10">
                {users.map((managedUser) => (
                  <tr key={managedUser.id}>
                    <th scope="row" className="max-w-[16rem] break-all px-3 py-3 text-left font-bold text-fk-forest-400 dark:text-fk-sage-100">{managedUser.username}</th>
                    <td className="whitespace-nowrap px-3 py-3 text-fk-sage-400 dark:text-fk-sage-200">{roleLabel(managedUser.role, messages)}</td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${managedUser.active ? 'bg-fk-mint-100 text-fk-forest-400 dark:bg-fk-mint-200/20 dark:text-fk-mint-100' : 'bg-fk-ivory-300 text-fk-forest-400 dark:bg-fk-forest-300 dark:text-fk-sage-200'}`}>
                        {managedUser.active ? messages.activeLabel : messages.inactiveLabel}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <Link href={`/settings/users/${encodeURIComponent(managedUser.id)}`} className={secondaryButtonClass}>{messages.editLabel}</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </SettingsCard>
  )
}
