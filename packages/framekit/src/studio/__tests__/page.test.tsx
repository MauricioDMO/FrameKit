import type { ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createLoginPage, createStudioPage } from '@/studio/page'
import { FrameKitLoginForm } from '@/studio/login/login-form'

const pageMocks = vi.hoisted(() => {
  const notFoundError = new Error('NEXT_NOT_FOUND')
  const redirectError = new Error('NEXT_REDIRECT')
  const state: {
    cookieValue: string | undefined
    sessionUser: { id: string, username: string, role: 'admin' | 'user' } | undefined
  } = {
    cookieValue: 'valid-session',
    sessionUser: { id: 'user-1', username: 'admin', role: 'admin' as const }
  }
  const cookieStore = {
    get: vi.fn((name: string) => name === 'framekit_session' && state.cookieValue !== undefined
      ? { value: state.cookieValue }
      : undefined)
  }

  return {
    cookieStore,
    cookies: vi.fn(async () => cookieStore),
    getSession: vi.fn(() => state.sessionUser),
    notFound: vi.fn(() => {
      throw notFoundError
    }),
    notFoundError,
    redirect: vi.fn(() => {
      throw redirectError
    }),
    redirectError,
    state,
    useRouter: vi.fn(() => ({ replace: vi.fn() }))
  }
})

vi.mock('next/headers', () => ({ cookies: pageMocks.cookies }))
vi.mock('next/navigation', () => ({ notFound: pageMocks.notFound, redirect: pageMocks.redirect, useRouter: pageMocks.useRouter }))
vi.mock('@/server/access/sessions', () => ({ getSession: pageMocks.getSession }))

function StudioClient () {
  return <div data-testid="studio-client" />
}

async function renderPage (params: { section: string, slug?: string[] }) {
  return createStudioPage(StudioClient, { ...process.env })({ params: Promise.resolve(params) })
}

async function renderLoginPage () {
  return createLoginPage({ ...process.env })()
}

beforeEach(() => {
  vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'true')
  pageMocks.state.cookieValue = 'valid-session'
  pageMocks.state.sessionUser = { id: 'user-1', username: 'admin', role: 'admin' }
  pageMocks.cookieStore.get.mockClear()
  pageMocks.cookies.mockClear()
  pageMocks.getSession.mockClear()
  pageMocks.notFound.mockClear()
  pageMocks.redirect.mockClear()
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('createStudioPage', () => {
  it('renders the client with only the safe session DTO for editor and brand', async () => {
    for (const section of ['editor', 'brand']) {
      const element = await renderPage({ section, slug: ['social', 'post'] }) as ReactElement

      expect(element.type).toBe(StudioClient)
      expect(element.props).toEqual({ user: { id: 'user-1', username: 'admin', role: 'admin' } })
    }

    expect(pageMocks.notFound).not.toHaveBeenCalled()
    expect(pageMocks.redirect).not.toHaveBeenCalled()
    expect(pageMocks.getSession).toHaveBeenCalledTimes(2)
  })

  it('redirects the settings root to the account subsection', async () => {
    await expect(renderPage({ section: 'settings' })).rejects.toBe(pageMocks.redirectError)

    expect(pageMocks.redirect).toHaveBeenCalledOnce()
    expect(pageMocks.redirect).toHaveBeenCalledWith('/settings/account')
    expect(pageMocks.cookies).not.toHaveBeenCalled()
    expect(pageMocks.getSession).not.toHaveBeenCalled()
  })

  it('renders valid settings subsections for an administrator', async () => {
    for (const subsection of ['account', 'tokens', 'users']) {
      const element = await renderPage({ section: 'settings', slug: [subsection] }) as ReactElement

      expect(element.type).toBe(StudioClient)
      expect(element.props).toEqual({ user: { id: 'user-1', username: 'admin', role: 'admin' } })
    }

    const editElement = await renderPage({ section: 'settings', slug: ['users', 'user-2'] }) as ReactElement
    expect(editElement.type).toBe(StudioClient)
    expect(editElement.props).toEqual({ user: { id: 'user-1', username: 'admin', role: 'admin' } })

    expect(pageMocks.notFound).not.toHaveBeenCalled()
    expect(pageMocks.redirect).not.toHaveBeenCalled()
    expect(pageMocks.getSession).toHaveBeenCalledTimes(4)
  })

  it('calls notFound for every section other than editor, brand, and settings', async () => {
    vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'invalid')

    for (const section of ['', 'Editor', 'preview', 'editor/other']) {
      await expect(renderPage({ section })).rejects.toBe(pageMocks.notFoundError)
    }

    expect(pageMocks.notFound).toHaveBeenCalledTimes(4)
    expect(pageMocks.cookies).not.toHaveBeenCalled()
    expect(pageMocks.getSession).not.toHaveBeenCalled()
  })

  it('renders editor and brand without authentication', async () => {
    vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'false')

    for (const section of ['editor', 'brand']) {
      const element = await renderPage({ section }) as ReactElement

      expect(element.type).toBe(StudioClient)
      expect(element.props).toEqual({})
    }

    expect(pageMocks.notFound).not.toHaveBeenCalled()
    expect(pageMocks.redirect).not.toHaveBeenCalled()
    expect(pageMocks.cookies).not.toHaveBeenCalled()
    expect(pageMocks.getSession).not.toHaveBeenCalled()
  })

  it('calls notFound for settings without authentication', async () => {
    vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'false')

    await expect(renderPage({ section: 'settings' })).rejects.toBe(pageMocks.notFoundError)

    expect(pageMocks.notFound).toHaveBeenCalledOnce()
    expect(pageMocks.cookies).not.toHaveBeenCalled()
    expect(pageMocks.getSession).not.toHaveBeenCalled()
  })

  it('calls notFound for unknown settings subsections', async () => {
    for (const slug of [['unknown'], ['account', 'extra'], ['users', ''], ['users', 'user-1', 'extra']]) {
      await expect(renderPage({ section: 'settings', slug })).rejects.toBe(pageMocks.notFoundError)
    }

    expect(pageMocks.notFound).toHaveBeenCalledTimes(4)
    expect(pageMocks.cookies).not.toHaveBeenCalled()
    expect(pageMocks.getSession).not.toHaveBeenCalled()
  })

  it('denies the users subsection to non-administrator sessions', async () => {
    pageMocks.state.sessionUser = { id: 'user-1', username: 'user', role: 'user' }

    for (const subsection of ['account', 'tokens']) {
      const element = await renderPage({ section: 'settings', slug: [subsection] }) as ReactElement

      expect(element.type).toBe(StudioClient)
    }

    for (const slug of [['users'], ['users', 'user-2']]) {
      await expect(renderPage({ section: 'settings', slug })).rejects.toBe(pageMocks.notFoundError)
    }

    expect(pageMocks.notFound).toHaveBeenCalledTimes(2)
    expect(pageMocks.getSession).toHaveBeenCalledTimes(4)
  })

  it('throws for invalid authentication configuration before request work', async () => {
    vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'invalid')

    await expect(renderPage({ section: 'editor' })).rejects.toThrow('FRAMEKIT_AUTH_ENABLED must be exactly "true" or "false" when set')
    await expect(renderLoginPage()).rejects.toThrow('FRAMEKIT_AUTH_ENABLED must be exactly "true" or "false" when set')

    expect(pageMocks.cookies).not.toHaveBeenCalled()
    expect(pageMocks.getSession).not.toHaveBeenCalled()
  })

  it('redirects missing or invalid sessions to login', async () => {
    for (const cookieValue of [undefined, 'malformed-session', 'expired-session']) {
      pageMocks.state.cookieValue = cookieValue
      pageMocks.state.sessionUser = undefined

      await expect(renderPage({ section: 'editor' })).rejects.toBe(pageMocks.redirectError)
    }

    expect(pageMocks.redirect).toHaveBeenCalledTimes(3)
    expect(pageMocks.redirect).toHaveBeenCalledWith('/login')
    expect(pageMocks.cookieStore.get).toHaveBeenCalledTimes(3)
    expect(pageMocks.cookieStore.get).toHaveBeenCalledWith('framekit_session')
    expect(pageMocks.getSession).toHaveBeenCalledTimes(3)
  })
})

describe('createLoginPage', () => {
  it('redirects an existing session to the editor', async () => {
    await expect(renderLoginPage()).rejects.toBe(pageMocks.redirectError)

    expect(pageMocks.redirect).toHaveBeenCalledOnce()
    expect(pageMocks.redirect).toHaveBeenCalledWith('/editor')
    expect(pageMocks.cookieStore.get).toHaveBeenCalledOnce()
    expect(pageMocks.cookieStore.get).toHaveBeenCalledWith('framekit_session')
    expect(pageMocks.getSession).toHaveBeenCalledOnce()
  })

  it('renders the reusable form when no valid session exists', async () => {
    pageMocks.state.cookieValue = 'invalid-session'
    pageMocks.state.sessionUser = undefined

    const element = await renderLoginPage() as ReactElement

    expect(element.type).toBe(FrameKitLoginForm)
    expect(element.props).toEqual({})
    expect(pageMocks.redirect).not.toHaveBeenCalled()
  })

  it('redirects directly to the editor without authentication', async () => {
    vi.stubEnv('FRAMEKIT_AUTH_ENABLED', 'false')

    await expect(renderLoginPage()).rejects.toBe(pageMocks.redirectError)

    expect(pageMocks.redirect).toHaveBeenCalledOnce()
    expect(pageMocks.redirect).toHaveBeenCalledWith('/editor')
    expect(pageMocks.cookies).not.toHaveBeenCalled()
    expect(pageMocks.getSession).not.toHaveBeenCalled()
  })
})
