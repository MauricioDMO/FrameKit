'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { AccountSettings } from './account-settings'
import { AdminUserEditSettings } from './admin-user-edit-settings'
import { AdminUsersSettings } from './admin-users-settings'
import type { SettingsMessages } from './types'
import { TokenSettings } from './token-settings'
import type { StudioUser } from '@/studio/types'
import type { FrameKitLocale } from '@/studio/i18n/messages'

function getUserEditId (pathname: string): string | undefined {
  const match = /^\/settings\/users\/([^/]+)$/.exec(pathname)
  if (!match) return undefined

  try {
    return decodeURIComponent(match[1])
  } catch {
    return match[1]
  }
}

export function FrameKitStudioSettings ({ user, locale, messages, onUserChange }: { user: StudioUser, locale: FrameKitLocale, messages: SettingsMessages, onUserChange: (user: StudioUser) => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const userEditId = getUserEditId(pathname)
  const adminUsersRoute = pathname === '/settings/users' || pathname.startsWith('/settings/users/')

  useEffect(() => {
    if (adminUsersRoute && user.role !== 'admin') router.replace('/settings/account')
  }, [adminUsersRoute, router, user.role])

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
        </header>

        <div>
          {pathname === '/settings/tokens'
            ? <TokenSettings locale={locale} messages={messages.tokens} errors={messages.errors} enabled />
            : pathname === '/settings/users' && user.role === 'admin'
              ? <AdminUsersSettings messages={messages.users} errors={messages.errors} />
              : userEditId !== undefined && user.role === 'admin'
                ? <AdminUserEditSettings userId={userEditId} currentUser={user} locale={locale} messages={messages.users} tokenMessages={messages.tokens} errors={messages.errors} onUserChange={onUserChange} onSessionEnded={endSession} />
                : <AccountSettings user={user} messages={messages.account} errors={messages.errors} onUserChange={onUserChange} onSessionEnded={endSession} />}
        </div>
      </div>
    </div>
  )
}
