import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { ComponentType } from 'react'

import { isAuthenticationEnabled } from '@/server/access/config'
import { getSession } from '@/server/access/sessions'
import { FrameKitLoginForm } from './login/login-form'
import type { FrameKitStudioSection, StudioUser } from './types'

const sessionCookieName = 'framekit_session'

interface StudioPageProps {
  params: Promise<{ section: string, slug?: string[] }>
}

function isStudioSection (section: string): section is FrameKitStudioSection {
  return section === 'editor' || section === 'brand' || section === 'settings'
}

export function createStudioPage (StudioClient: ComponentType<{ user?: StudioUser }>, env: NodeJS.ProcessEnv = process.env) {
  return async function StudioPage ({ params }: StudioPageProps) {
    const { section, slug } = await params
    if (!isStudioSection(section)) notFound()

    if (!isAuthenticationEnabled(env)) {
      if (section === 'settings') notFound()
      return <StudioClient />
    }

    if (section === 'settings') {
      if (slug === undefined || slug.length === 0) redirect('/settings/account')
      const validSubsection = slug.length === 1 && ['account', 'tokens', 'users'].includes(slug[0])
      const validUserEdit = slug.length === 2 && slug[0] === 'users' && slug[1].length > 0
      if (!validSubsection && !validUserEdit) notFound()
    }

    const cookieStore = await cookies()
    const sessionUser = getSession(cookieStore.get(sessionCookieName)?.value, { env })
    if (sessionUser === undefined) redirect('/login')
    if (section === 'settings' && slug?.[0] === 'users' && sessionUser.role !== 'admin') notFound()

    return <StudioClient user={sessionUser} />
  }
}

export function createLoginPage (env: NodeJS.ProcessEnv = process.env) {
  return async function LoginPage () {
    if (!isAuthenticationEnabled(env)) redirect('/editor')

    const cookieStore = await cookies()
    const sessionUser = getSession(cookieStore.get(sessionCookieName)?.value, { env })
    if (sessionUser !== undefined) redirect('/editor')

    return <FrameKitLoginForm />
  }
}
