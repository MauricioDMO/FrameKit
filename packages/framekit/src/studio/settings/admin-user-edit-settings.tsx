'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import type { FrameKitLocale } from '@/studio/i18n/messages'
import type { StudioUser } from '@/studio/types'
import { ManagedUserRow } from './managed-user-row'
import { Feedback, SettingsCard } from './settings-components'
import type { FeedbackState, ManagedStudioUser, SettingsMessages } from './types'
import { errorMessage, readUsers, secondaryButtonClass } from './settings-utils'

type AdminUserEditSettingsProps = {
  userId: string
  currentUser: StudioUser
  locale: FrameKitLocale
  messages: SettingsMessages['users']
  tokenMessages: SettingsMessages['tokens']
  errors: SettingsMessages['errors']
  onUserChange: (user: StudioUser) => void
  onSessionEnded: () => void
}

export function AdminUserEditSettings ({ userId, currentUser, locale, messages, tokenMessages, errors, onUserChange, onSessionEnded }: AdminUserEditSettingsProps) {
  const [managedUser, setManagedUser] = useState<ManagedStudioUser>()
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<FeedbackState>()

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setManagedUser(undefined)
    setFeedback(undefined)
    readUsers().then((users) => {
      if (cancelled) return
      const selectedUser = users.find((candidate) => candidate.id === userId)
      setManagedUser(selectedUser)
      if (!selectedUser) setFeedback({ message: errors.notFound, tone: 'error' })
    }).catch((error) => {
      if (!cancelled) setFeedback({ message: errorMessage(error, errors), tone: 'error' })
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [errors, userId])

  async function refreshUser () {
    try {
      const selectedUser = (await readUsers()).find((candidate) => candidate.id === userId)
      setManagedUser(selectedUser)
      setFeedback(selectedUser ? undefined : { message: errors.notFound, tone: 'error' })
    } catch (error) {
      setFeedback({ message: errorMessage(error, errors), tone: 'error' })
    }
  }

  return (
    <SettingsCard id="framekit-settings-user-edit" title={messages.title} description={messages.description} className="xl:col-span-2">
      <div className="mt-5 border-b border-fk-ivory-400 pb-4 dark:border-white/10">
        <Link href="/settings/users" className={secondaryButtonClass}>{messages.title}</Link>
      </div>
      {loading && <p aria-busy="true" className="mt-4 text-sm text-fk-sage-400 dark:text-fk-sage-200">{messages.loadingLabel}</p>}
      {!loading && <div className="mt-3"><Feedback {...feedback} /></div>}
      {!loading && managedUser && (
        <ul className="mt-4 divide-y divide-fk-ivory-400 border-y border-fk-ivory-400 dark:divide-white/10 dark:border-white/10">
          <ManagedUserRow managedUser={managedUser} currentUser={currentUser} locale={locale} messages={messages} tokenMessages={tokenMessages} errors={errors} onRefresh={refreshUser} onUserChange={onUserChange} onSessionEnded={onSessionEnded} />
        </ul>
      )}
    </SettingsCard>
  )
}
