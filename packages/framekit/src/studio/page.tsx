import { cookies } from 'next/headers'
import { notFound, redirect } from 'next/navigation'
import type { ComponentType } from 'react'

import { getSession } from '../server/access/sessions'
import { FrameKitLoginForm } from './login/login-form'
import type { FrameKitStudioSection, StudioUser } from './types'

const sessionCookieName = 'framekit_session'

interface StudioPageProps {
  params: Promise<{ section: string, slug?: string[] }>
}

function isStudioSection (section: string): section is FrameKitStudioSection {
  return section === 'editor' || section === 'brand' || section === 'settings'
}

export function createStudioPage (StudioClient: ComponentType<{ user: StudioUser }>) {
  return async function StudioPage ({ params }: StudioPageProps) {
    const { section } = await params
    if (!isStudioSection(section)) notFound()

    const cookieStore = await cookies()
    const sessionUser = getSession(cookieStore.get(sessionCookieName)?.value)
    if (sessionUser === undefined) redirect('/login')

    return <StudioClient user={sessionUser} />
  }
}

export function createLoginPage () {
  return async function LoginPage () {
    const cookieStore = await cookies()
    const sessionUser = getSession(cookieStore.get(sessionCookieName)?.value)
    if (sessionUser !== undefined) redirect('/editor')

    return <FrameKitLoginForm />
  }
}
