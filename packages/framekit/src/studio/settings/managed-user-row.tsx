'use client'

import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'

import type { FrameKitLocale } from '@/studio/i18n/messages'
import type { StudioUser } from '@/studio/types'
import { requestStudioJson } from './api'
import { ConfirmationDialog } from './confirmation-dialog'
import { Feedback } from './settings-components'
import type { FeedbackState, ManagedStudioUser, SettingsMessages, StudioTokenMetadata } from './types'
import { dangerButtonClass, errorMessage, inputClass, jsonRequest, primaryButtonClass, roleLabel, secondaryButtonClass, selectClass } from './settings-utils'
import { UserTokens } from './token-list'

type ManagedUserRowProps = {
  managedUser: ManagedStudioUser
  currentUser: StudioUser
  locale: FrameKitLocale
  messages: SettingsMessages['users']
  tokenMessages: SettingsMessages['tokens']
  errors: SettingsMessages['errors']
  onRefresh: () => Promise<void>
  onUserChange: (user: StudioUser) => void
  onSessionEnded: () => void
}

export function ManagedUserRow ({ managedUser, currentUser, locale, messages, tokenMessages, errors, onRefresh, onUserChange, onSessionEnded }: ManagedUserRowProps) {
  const [username, setUsername] = useState(managedUser.username)
  const [role, setRole] = useState<StudioUser['role']>(managedUser.role)
  const [active, setActive] = useState(managedUser.active)
  const [password, setPassword] = useState('')
  const [feedback, setFeedback] = useState<FeedbackState>()
  const [tokens, setTokens] = useState<StudioTokenMetadata[]>()
  const [tokensLoading, setTokensLoading] = useState(false)
  const [confirmingAction, setConfirmingAction] = useState<'delete' | StudioTokenMetadata>()
  const [pendingAction, setPendingAction] = useState(false)
  const updatePendingRef = useRef(false)
  const resetPendingRef = useRef(false)
  const tokenPendingRef = useRef(false)
  const rowId = managedUser.id.replace(/[^a-zA-Z0-9_-]/g, '-')
  const isCurrentUser = managedUser.id === currentUser.id

  useEffect(() => {
    setUsername(managedUser.username)
    setRole(managedUser.role)
    setActive(managedUser.active)
  }, [managedUser.username, managedUser.role, managedUser.active])

  async function updateManagedUser (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (updatePendingRef.current) return

    updatePendingRef.current = true
    setPendingAction(true)
    setFeedback(undefined)
    try {
      const updated = await requestStudioJson<StudioUser>(`/api/framekit/users/${encodeURIComponent(managedUser.id)}`, jsonRequest('PATCH', { username, role, active }))
      onUserChange(updated)
      await onRefresh()
      if (isCurrentUser && !active) onSessionEnded()
      else setFeedback({ message: messages.saveLabel, tone: 'success' })
    } catch (error) {
      setFeedback({ message: errorMessage(error, errors), tone: 'error' })
    } finally {
      updatePendingRef.current = false
      setPendingAction(false)
    }
  }

  async function resetPassword (event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (resetPendingRef.current) return

    resetPendingRef.current = true
    setPendingAction(true)
    setFeedback(undefined)
    try {
      await requestStudioJson<{ status: string }>(`/api/framekit/users/${encodeURIComponent(managedUser.id)}/password`, jsonRequest('POST', { password }))
      setPassword('')
      if (isCurrentUser) onSessionEnded()
      else setFeedback({ message: messages.resetPasswordTitle, tone: 'success' })
    } catch (error) {
      setFeedback({ message: errorMessage(error, errors), tone: 'error' })
    } finally {
      resetPendingRef.current = false
      setPendingAction(false)
    }
  }

  async function loadUserTokens () {
    setTokensLoading(true)
    setFeedback(undefined)
    try {
      setTokens(await requestStudioJson<StudioTokenMetadata[]>(`/api/framekit/users/${encodeURIComponent(managedUser.id)}/tokens`, { method: 'GET' }))
    } catch (error) {
      setFeedback({ message: errorMessage(error, errors), tone: 'error' })
    } finally {
      setTokensLoading(false)
    }
  }

  async function deleteUser () {
    if (confirmingAction !== 'delete' || tokenPendingRef.current) return

    tokenPendingRef.current = true
    setPendingAction(true)
    try {
      await requestStudioJson<{ status: string }>(`/api/framekit/users/${encodeURIComponent(managedUser.id)}`, { method: 'DELETE' })
      setConfirmingAction(undefined)
      if (isCurrentUser) onSessionEnded()
      else await onRefresh()
    } catch (error) {
      setFeedback({ message: errorMessage(error, errors), tone: 'error' })
      setConfirmingAction(undefined)
    } finally {
      tokenPendingRef.current = false
      setPendingAction(false)
    }
  }

  async function revokeUserToken () {
    if (!confirmingAction || confirmingAction === 'delete' || tokenPendingRef.current) return

    tokenPendingRef.current = true
    setPendingAction(true)
    try {
      await requestStudioJson<{ status: string }>(`/api/framekit/tokens/${encodeURIComponent(confirmingAction.id)}`, { method: 'DELETE' })
      setConfirmingAction(undefined)
      await loadUserTokens()
    } catch (error) {
      setFeedback({ message: errorMessage(error, errors), tone: 'error' })
      setConfirmingAction(undefined)
    } finally {
      tokenPendingRef.current = false
      setPendingAction(false)
    }
  }

  const confirmIsDelete = confirmingAction === 'delete'
  const confirmedToken = typeof confirmingAction === 'object' ? confirmingAction : undefined

  return (
    <li className="rounded-2xl border border-black/5 bg-white/60 p-4 dark:border-white/10 dark:bg-fk-forest-100/60 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-all font-bold text-fk-forest-400 dark:text-fk-sage-100">{managedUser.username}</h3>
          <p className="mt-1 text-sm text-fk-sage-400 dark:text-fk-sage-300">{roleLabel(managedUser.role, messages)} · {managedUser.active ? messages.activeLabel : messages.inactiveLabel}</p>
        </div>
      </div>

      <form onSubmit={updateManagedUser} aria-busy={pendingAction} className="mt-5 grid gap-4 border-t border-black/5 pt-5 dark:border-white/10 sm:grid-cols-2 xl:grid-cols-4">
        <label htmlFor={`framekit-user-${rowId}-username`} className="block text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">
          {messages.usernameLabel}
          <input id={`framekit-user-${rowId}-username`} name="username" type="text" required minLength={3} maxLength={64} value={username} disabled={pendingAction} onChange={(event) => setUsername(event.target.value)} className={inputClass} />
        </label>
        <label htmlFor={`framekit-user-${rowId}-role`} className="block text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">
          {messages.roleLabel}
          <select id={`framekit-user-${rowId}-role`} name="role" value={role} disabled={pendingAction} onChange={(event) => setRole(event.target.value as StudioUser['role'])} className={selectClass}>
            <option value="user">{messages.userRole}</option>
            <option value="admin">{messages.administratorRole}</option>
          </select>
        </label>
        <label htmlFor={`framekit-user-${rowId}-active`} className="flex min-h-11 items-center gap-3 self-end rounded-xl border border-fk-ivory-400 px-3 text-sm font-bold text-fk-forest-400 dark:border-white/15 dark:text-fk-sage-100">
          <input id={`framekit-user-${rowId}-active`} name="active" type="checkbox" checked={active} disabled={pendingAction} onChange={(event) => setActive(event.target.checked)} className="size-4 accent-fk-forest-300" />
          {messages.activeLabel}
        </label>
        <button type="submit" disabled={pendingAction} className={`${primaryButtonClass} self-end`}>{pendingAction ? messages.savingLabel : messages.saveLabel}</button>
      </form>

      <form onSubmit={resetPassword} aria-busy={pendingAction} className="mt-5 grid gap-4 border-t border-black/5 pt-5 sm:grid-cols-[1fr_auto] dark:border-white/10">
        <label htmlFor={`framekit-user-${rowId}-password`} className="block text-sm font-bold text-fk-forest-400 dark:text-fk-sage-100">
          {messages.resetPasswordLabel}
          <input id={`framekit-user-${rowId}-password`} name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={256} value={password} disabled={pendingAction} onChange={(event) => setPassword(event.target.value)} className={inputClass} />
        </label>
        <button type="submit" disabled={pendingAction} className={`${secondaryButtonClass} self-end`}>{pendingAction ? messages.resettingPasswordLabel : messages.resetPasswordTitle}</button>
      </form>

      <div className="mt-5 flex flex-wrap gap-3 border-t border-black/5 pt-5 dark:border-white/10">
        <button type="button" onClick={() => { loadUserTokens() }} aria-expanded={tokens !== undefined} className={secondaryButtonClass}>{messages.tokensLabel}</button>
        <button type="button" onClick={() => setConfirmingAction('delete')} className={dangerButtonClass}>{messages.deleteLabel}</button>
      </div>
      <div className="mt-4"><Feedback {...feedback} /></div>

      {tokensLoading && <p aria-busy="true" className="mt-4 text-sm text-fk-sage-400 dark:text-fk-sage-200">{tokenMessages.loadingLabel}</p>}
      {tokens !== undefined && !tokensLoading && <UserTokens tokens={tokens} locale={locale} messages={tokenMessages} emptyLabel={messages.noTokens} onRequestRevoke={(token) => setConfirmingAction(token)} />}

      <ConfirmationDialog
        open={confirmIsDelete || confirmedToken !== undefined}
        title={confirmIsDelete ? messages.deleteTitle : tokenMessages.revokeTitle}
        description={confirmIsDelete ? messages.deleteDescription : tokenMessages.revokeDescription}
        confirmLabel={confirmIsDelete ? messages.confirmDeleteLabel : tokenMessages.confirmRevokeLabel}
        cancelLabel={tokenMessages.cancelLabel}
        onCancel={() => setConfirmingAction(undefined)}
        onConfirm={confirmIsDelete ? deleteUser : revokeUserToken}
      />
    </li>
  )
}
