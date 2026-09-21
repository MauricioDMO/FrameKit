'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { AccountSettings } from './account-settings'
import { AdminUsersSettings } from './admin-users-settings'
import type { SettingsMessages } from './types'
import { TokenSettings } from './token-settings'
import type { StudioUser } from '../types'
import type { FrameKitLocale } from '../i18n/messages'

export function FrameKitStudioSettings ({ user, locale, messages }: { user: StudioUser, locale: FrameKitLocale, messages: SettingsMessages }) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState(user)

  useEffect(() => {
    setCurrentUser(user)
  }, [user])

  function updateUser (nextUser: StudioUser) {
    setCurrentUser((current) => current.id === nextUser.id ? nextUser : current)
  }

  function endSession () {
    router.replace('/login')
  }

  return (
    <div className="min-h-screen bg-fk-ivory-200 p-4 text-fk-forest-400 dark:bg-fk-forest-400 dark:text-fk-sage-100 sm:p-6 lg:p-8 xl:h-full xl:min-h-0 xl:overflow-y-auto">
      <div className="mx-auto max-w-6xl">
        <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-[0.24em] text-fk-sage-400 uppercase dark:text-fk-sage-300">FrameKit</p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-fk-forest-400 dark:text-fk-sage-100">{messages.title}</h1>
            <p className="mt-2 max-w-2xl leading-7 text-fk-sage-400 dark:text-fk-sage-200">{messages.description}</p>
          </div>
          <nav aria-label={messages.navigationLabel} className="flex max-w-full flex-wrap gap-2 text-sm font-bold">
            <a href="#framekit-settings-account" className="rounded-lg px-3 py-2 text-fk-forest-300 underline-offset-4 hover:underline focus:ring-2 focus:ring-fk-forest-300 focus:outline-none dark:text-fk-mint-200 dark:focus:ring-fk-mint-200">{messages.account.title}</a>
            <a href="#framekit-settings-tokens" className="rounded-lg px-3 py-2 text-fk-forest-300 underline-offset-4 hover:underline focus:ring-2 focus:ring-fk-forest-300 focus:outline-none dark:text-fk-mint-200 dark:focus:ring-fk-mint-200">{messages.tokens.title}</a>
            {currentUser.role === 'admin' && <a href="#framekit-settings-users" className="rounded-lg px-3 py-2 text-fk-forest-300 underline-offset-4 hover:underline focus:ring-2 focus:ring-fk-forest-300 focus:outline-none dark:text-fk-mint-200 dark:focus:ring-fk-mint-200">{messages.users.title}</a>}
          </nav>
        </header>

        <div className="grid gap-5 xl:grid-cols-2">
          <AccountSettings user={currentUser} messages={messages.account} errors={messages.errors} onUserChange={updateUser} onSessionEnded={endSession} />
          <TokenSettings locale={locale} messages={messages.tokens} errors={messages.errors} enabled />
          {currentUser.role === 'admin' && <AdminUsersSettings currentUser={currentUser} locale={locale} messages={messages.users} tokenMessages={messages.tokens} errors={messages.errors} onUserChange={updateUser} onSessionEnded={endSession} />}
        </div>
      </div>
    </div>
  )
}
