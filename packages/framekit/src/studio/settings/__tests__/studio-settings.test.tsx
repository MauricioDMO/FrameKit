// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FrameKitLocaleProvider } from '@/studio/i18n/locale-provider'
import type { FrameKitLocale } from '@/studio/i18n/messages'
import { frameKitMessages } from '@/studio/i18n/messages'
import { FrameKitStudioSettings } from '@/studio/settings/studio-settings'
import type { ManagedStudioUser, StudioTokenMetadata } from '@/studio/settings/types'
import type { StudioUser } from '@/studio/types'

const router = vi.hoisted(() => ({ replace: vi.fn() }))
const route = vi.hoisted(() => ({ pathname: '/settings/account' }))

vi.mock('next/navigation', () => ({
  usePathname: () => route.pathname,
  useRouter: () => router
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: React.PropsWithChildren<{ href: string }>) => <a href={href} {...props}>{children}</a>
}))

const normalUser: StudioUser = { id: 'user-1', username: 'owner', role: 'user' }
const administrator: StudioUser = { id: 'admin-1', username: 'administrator', role: 'admin' }

function apiResponse (body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function StatefulSettings ({ user, locale }: { user: StudioUser, locale: FrameKitLocale }) {
  const [currentUser, setCurrentUser] = useState(user)

  function updateUser (nextUser: StudioUser) {
    setCurrentUser((current) => current.id === nextUser.id ? nextUser : current)
  }

  return <FrameKitStudioSettings user={currentUser} locale={locale} messages={frameKitMessages[locale].settings} onUserChange={updateUser} />
}

function renderSettings (user = normalUser, pathname = '/settings/account', locale: FrameKitLocale = 'en') {
  route.pathname = pathname
  return render(
    <FrameKitLocaleProvider initialLocale={locale}>
      <StatefulSettings user={user} locale={locale} />
    </FrameKitLocaleProvider>
  )
}

function submitNamedForm (name: string) {
  fireEvent.submit(screen.getByRole('button', { name }).closest('form') as HTMLFormElement)
}

afterEach(() => {
  document.querySelectorAll<HTMLButtonElement>('[data-framekit-toast-dismiss]').forEach((button) => {
    act(() => fireEvent.click(button))
  })
  cleanup()
  vi.useRealTimers()
  route.pathname = '/settings/account'
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  router.replace.mockReset()
  if ('clipboard' in navigator) Reflect.deleteProperty(navigator, 'clipboard')
})

describe('FrameKitStudioSettings account workflows', () => {
  it('updates the displayed safe identity and sends the exact account body', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/account' && init?.method === 'PATCH') return apiResponse({ ...normalUser, username: 'renamed-owner' })
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/account')

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'renamed-owner' } })
    submitNamedForm('Save username')

    await waitFor(() => expect(screen.getByText('renamed-owner')).toBeTruthy())
    const successToast = await waitFor(() => screen.getByRole('status'))
    expect(successToast.textContent).toContain('Username updated.')
    expect(successToast.parentElement?.className).toContain('top-0')
    expect(successToast.parentElement?.className).toContain('left-1/2')
    const accountRequest = fetchMock.mock.calls.find(([url, init]) => url === '/api/framekit/account' && init?.method === 'PATCH')
    expect(accountRequest?.[1]).toMatchObject({
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'renamed-owner' })
    })
  })

  it('changes the password and navigates to login without displaying server details', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/account/password' && init?.method === 'POST') return apiResponse({ status: 'ok' })
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/account')

    fireEvent.change(screen.getByLabelText('Current password'), { target: { value: 'current password' } })
    fireEvent.change(screen.getByLabelText('New password'), { target: { value: 'new password with enough length' } })
    submitNamedForm('Change password')

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'))
    expect(fetchMock.mock.calls.find(([url]) => url === '/api/framekit/account/password')?.[1]).toMatchObject({
      method: 'POST',
      body: JSON.stringify({ currentPassword: 'current password', newPassword: 'new password with enough length' })
    })
  })

  it('logs out through the access endpoint and navigates to login', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/logout' && init?.method === 'POST') return apiResponse({ status: 'ok' })
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/account')

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }))

    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'))
    expect(fetchMock.mock.calls.find(([url]) => url === '/api/framekit/logout')?.[1]).toEqual({ method: 'POST' })
  })
})

describe('FrameKitStudioSettings token workflows', () => {
  it('shows a created secret once, copies it, refreshes metadata, and confirms revocation', async () => {
    const oldToken: StudioTokenMetadata = {
      id: 'token-old',
      name: 'Old token',
      tokenPrefix: 'fk_old',
      createdAt: 1,
      lastUsedAt: null,
      revokedAt: null
    }
    const createdToken = {
      ...oldToken,
      id: 'token-new',
      name: 'New token',
      tokenPrefix: 'fk_new',
      token: 'fk_secret_that_must_not_be_repeated'
    }
    const refreshedToken = { ...createdToken }
    delete (refreshedToken as Partial<typeof refreshedToken>).token
    let tokenList: StudioTokenMetadata[] = [oldToken]
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/tokens' && init?.method === 'POST') {
        tokenList = [oldToken, refreshedToken]
        return apiResponse(createdToken, 201)
      }
      if (url === '/api/framekit/tokens' && init?.method === 'DELETE') {
        tokenList = tokenList.map((token) => token.id === 'token-new' ? { ...token, revokedAt: 2 } : token)
        return apiResponse({ status: 'ok' })
      }
      if (url === '/api/framekit/tokens') return apiResponse(tokenList)
      return apiResponse({})
    })
    const writeText = vi.fn(async () => {})
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/tokens')

    await waitFor(() => expect(screen.getByText('Old token')).toBeTruthy())
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/framekit/tokens'])
    fireEvent.change(screen.getByLabelText('Token name'), { target: { value: 'New token' } })
    submitNamedForm('Create token')

    await waitFor(() => expect(screen.getByText(createdToken.token)).toBeTruthy())
    const creationToast = await waitFor(() => screen.getByRole('status'))
    expect(creationToast.textContent).toContain('Token created.')
    expect(creationToast.parentElement?.className).toContain('top-0')
    expect(creationToast.parentElement?.className).toContain('left-1/2')
    expect(screen.getByText('Old token')).toBeTruthy()
    expect(screen.queryByText('old secret')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Copy token' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(createdToken.token))
    await waitFor(() => expect(screen.getAllByRole('status').some((toast) => toast.textContent?.includes('Token copied.'))).toBe(true))
    fireEvent.click(screen.getByRole('button', { name: 'I have copied the token' }))
    expect(screen.queryByText(createdToken.token)).toBeNull()

    fireEvent.click(screen.getAllByRole('button', { name: 'Revoke' })[1])
    expect(screen.getByRole('dialog')).toBeTruthy()
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/tokens/token-new' && init?.method === 'DELETE')).toBe(false)
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Revoke token' }))

    await waitFor(() => expect(screen.getAllByText('Revoked').length).toBeGreaterThan(0))
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/tokens/token-new' && init?.method === 'DELETE')).toBe(true)
  })

  it('closes destructive confirmation on Escape and restores focus to the trigger', async () => {
    const token: StudioTokenMetadata = {
      id: 'token-1',
      name: 'Token',
      tokenPrefix: 'fk_token',
      createdAt: 1,
      lastUsedAt: null,
      revokedAt: null
    }
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'DELETE') return apiResponse({})
      return url === '/api/framekit/tokens' ? apiResponse([token]) : apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/tokens')

    const revoke = await waitFor(() => screen.getByRole('button', { name: 'Revoke' }))
    revoke.focus()
    fireEvent.click(revoke)
    const dialog = screen.getByRole('dialog')
    expect(document.activeElement).toBe(within(dialog).getByRole('button', { name: 'Cancel' }))

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(document.activeElement).toBe(revoke)
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/tokens/token-1' && init?.method === 'DELETE')).toBe(false)
  })

  it('contains keyboard focus within destructive confirmation', async () => {
    const token: StudioTokenMetadata = {
      id: 'token-1',
      name: 'Token',
      tokenPrefix: 'fk_token',
      createdAt: 1,
      lastUsedAt: null,
      revokedAt: null
    }
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'DELETE') return apiResponse({})
      return url === '/api/framekit/tokens' ? apiResponse([token]) : apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/tokens')

    fireEvent.click(await waitFor(() => screen.getByRole('button', { name: 'Revoke' })))
    const dialog = screen.getByRole('dialog')
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' })
    const confirm = within(dialog).getByRole('button', { name: 'Revoke token' })
    expect(document.activeElement).toBe(cancel)

    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(confirm)
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(cancel)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(confirm)
  })

  it('keeps pending destructive confirmation focus contained while actions are disabled', async () => {
    const token: StudioTokenMetadata = {
      id: 'token-1',
      name: 'Token',
      tokenPrefix: 'fk_token',
      createdAt: 1,
      lastUsedAt: null,
      revokedAt: null
    }
    let resolveDelete!: () => void
    const deleteRequest = new Promise<void>((resolve) => { resolveDelete = resolve })
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (init?.method === 'DELETE') {
        await deleteRequest
        return apiResponse({})
      }
      return url === '/api/framekit/tokens' ? apiResponse([token]) : apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/tokens')

    fireEvent.click(await waitFor(() => screen.getByRole('button', { name: 'Revoke' })))
    const dialog = screen.getByRole('dialog')
    const cancel = within(dialog).getByRole('button', { name: 'Cancel' })
    const confirm = within(dialog).getByRole('button', { name: 'Revoke token' })
    fireEvent.click(confirm)

    await waitFor(() => {
      expect(cancel).toHaveProperty('disabled', true)
      expect(confirm).toHaveProperty('disabled', true)
      expect(document.activeElement).toBe(dialog)
    })
    fireEvent.click(confirm)
    expect(fetchMock.mock.calls.filter(([url, init]) => url === '/api/framekit/tokens/token-1' && init?.method === 'DELETE')).toHaveLength(1)

    const tab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true })
    document.dispatchEvent(tab)
    expect(tab.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(dialog)

    const shiftTab = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true, shiftKey: true })
    document.dispatchEvent(shiftTab)
    expect(shiftTab.defaultPrevented).toBe(true)
    expect(document.activeElement).toBe(dialog)

    resolveDelete()
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })
})

describe('FrameKitStudioSettings administrator workflows', () => {
  const managedAdministrator: ManagedStudioUser = { ...administrator, active: true, createdAt: 1, updatedAt: 1 }
  const managedTarget: ManagedStudioUser = { id: 'user-2', username: 'target', role: 'user', active: true, createdAt: 1, updatedAt: 1 }

  async function readCurrentUserRow () {
    return waitFor(() => screen.getByText('administrator').closest('li') as HTMLElement)
  }

  it('falls back to Account and redirects normal users away from the Users route', async () => {
    const fetchMock = vi.fn(async () => apiResponse({}))
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/users')

    expect(screen.getByRole('heading', { name: 'Account' })).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Users' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Tokens' })).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/settings/account'))
  })

  it('renders users in a compact table with links to the dedicated edit route', async () => {
    const inactiveUser: ManagedStudioUser = { ...managedTarget, id: 'team/member', username: 'inactive-target', active: false }
    const users: ManagedStudioUser[] = [managedAdministrator, inactiveUser]
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/users' && init?.method === 'GET') return apiResponse(users)
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(administrator, '/settings/users')

    const table = await waitFor(() => screen.getByRole('table', { name: 'Users' }))
    expect(within(table).getByRole('columnheader', { name: 'Username' })).toBeTruthy()
    expect(within(table).getByRole('columnheader', { name: 'Role' })).toBeTruthy()
    expect(within(table).getByRole('columnheader', { name: 'Active' })).toBeTruthy()
    const currentUserRow = within(table).getByText('administrator').closest('tr') as HTMLElement
    expect(within(currentUserRow).getByText('Administrator')).toBeTruthy()
    expect(within(currentUserRow).getByText('Active')).toBeTruthy()
    expect(within(currentUserRow).getByRole('link', { name: 'Edit' }).getAttribute('href')).toBe('/settings/users/admin-1')
    const inactiveRow = within(table).getByText('inactive-target').closest('tr') as HTMLElement
    expect(within(inactiveRow).getByText('Inactive')).toBeTruthy()
    expect(within(inactiveRow).getByRole('link', { name: 'Edit' }).getAttribute('href')).toBe('/settings/users/team%2Fmember')
    expect(table.querySelectorAll('form')).toHaveLength(0)
    expect(within(table).queryByRole('textbox')).toBeNull()
    expect(within(table).queryByRole('checkbox')).toBeNull()
    expect(within(table).queryByRole('button')).toBeNull()
  })

  it('decodes encoded user IDs before selecting the dedicated edit route user', async () => {
    const encodedRouteUser: ManagedStudioUser = { ...managedTarget, id: 'team/member', username: 'slash-target' }
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/users' && init?.method === 'GET') return apiResponse([encodedRouteUser])
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(administrator, '/settings/users/team%2Fmember')

    const usernameInput = await waitFor(() => screen.getByLabelText('Username') as HTMLInputElement)
    expect(usernameInput.value).toBe('slash-target')
    expect(screen.getByRole('button', { name: 'Save changes' })).toBeTruthy()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('redirects to Account after the current administrator is demoted from the edit route', async () => {
    let users: ManagedStudioUser[] = [managedAdministrator]
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/users' && init?.method === 'GET') return apiResponse(users)
      if (url === '/api/framekit/users/admin-1' && init?.method === 'PATCH') {
        users = [{ ...managedAdministrator, role: 'user' }]
        return apiResponse({ ...administrator, role: 'user' })
      }
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(administrator, '/settings/users/admin-1')

    const currentUserRow = await readCurrentUserRow()
    fireEvent.change(within(currentUserRow).getByRole('combobox'), { target: { value: 'user' } })
    fireEvent.submit(within(currentUserRow).getByRole('button', { name: 'Save changes' }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/framekit/users/admin-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'administrator', role: 'user', active: true })
    }))
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/settings/account'))
    expect(router.replace).toHaveBeenCalledTimes(1)
  })

  it('ends the session after self-deactivation from the edit route', async () => {
    let users: ManagedStudioUser[] = [managedAdministrator]
    let sessionEnded = false
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/users' && init?.method === 'GET') return sessionEnded ? apiResponse({ error: 'unauthorized' }, 401) : apiResponse(users)
      if (url === '/api/framekit/users/admin-1' && init?.method === 'PATCH') {
        users = [{ ...managedAdministrator, active: false }]
        sessionEnded = true
        return apiResponse(administrator)
      }
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(administrator, '/settings/users/admin-1')

    const currentUserRow = await readCurrentUserRow()
    fireEvent.click(within(currentUserRow).getByRole('checkbox'))
    fireEvent.submit(within(currentUserRow).getByRole('button', { name: 'Save changes' }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/framekit/users/admin-1', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'administrator', role: 'admin', active: false })
    }))
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'))
    expect(fetchMock.mock.calls.filter(([url, init]) => url === '/api/framekit/users' && init?.method === 'GET')).toHaveLength(1)
    expect(router.replace).toHaveBeenCalledTimes(1)
  })

  it('ends the session after self password reset from the edit route', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/users' && init?.method === 'GET') return apiResponse([managedAdministrator])
      if (url === '/api/framekit/users/admin-1/password' && init?.method === 'POST') return apiResponse({ status: 'ok' })
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(administrator, '/settings/users/admin-1')

    const currentUserRow = await readCurrentUserRow()
    fireEvent.change(within(currentUserRow).getByLabelText('New password'), { target: { value: 'new admin password with length' } })
    fireEvent.submit(within(currentUserRow).getByRole('button', { name: 'Reset password' }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/framekit/users/admin-1/password', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ password: 'new admin password with length' })
    }))
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'))
    expect(router.replace).toHaveBeenCalledTimes(1)
  })

  it('ends the session after self-delete from the edit route', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/users' && init?.method === 'GET') return apiResponse([managedAdministrator])
      if (url === '/api/framekit/users/admin-1' && init?.method === 'DELETE') return apiResponse({ status: 'ok' })
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(administrator, '/settings/users/admin-1')

    const currentUserRow = await readCurrentUserRow()
    fireEvent.click(within(currentUserRow).getByRole('button', { name: 'Delete user' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete user' }))

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/framekit/users/admin-1', { method: 'DELETE' }))
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/login'))
    expect(router.replace).toHaveBeenCalledTimes(1)
  })

  it('loads only the selected user for the dedicated edit route and reuses its mutations', async () => {
    let users: ManagedStudioUser[] = [managedAdministrator, managedTarget]
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/users' && init?.method === 'GET') return apiResponse(users)
      if (url === '/api/framekit/users/user-2' && init?.method === 'PATCH') {
        users = users.map((user) => user.id === 'user-2' ? { ...user, username: 'updated-target' } : user)
        return apiResponse({ id: 'user-2', username: 'updated-target', role: 'user' })
      }
      if (url === '/api/framekit/users/user-2/password' && init?.method === 'POST') return apiResponse({ status: 'ok' })
      if (url === '/api/framekit/users/user-2' && init?.method === 'DELETE') {
        users = users.filter((user) => user.id !== 'user-2')
        return apiResponse({ status: 'ok' })
      }
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(administrator, '/settings/users/user-2')

    await waitFor(() => expect(screen.getByText('target')).toBeTruthy())
    expect(screen.queryByRole('heading', { name: 'Create user' })).toBeNull()
    expect(screen.queryByText('administrator')).toBeNull()
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/framekit/users'])

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'updated-target' } })
    fireEvent.submit(screen.getByRole('button', { name: 'Save changes' }).closest('form') as HTMLFormElement)
    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/users/user-2' && init?.method === 'PATCH')).toBe(true))
    const saveToast = await waitFor(() => screen.getByRole('status'))
    expect(saveToast.textContent).toContain('Save changes')
    expect(saveToast.parentElement?.className).toContain('top-0')
    expect(saveToast.parentElement?.className).toContain('left-1/2')
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/users/user-2' && init?.body === JSON.stringify({ username: 'updated-target', role: 'user', active: true }))).toBe(true)

    fireEvent.click(screen.getByRole('button', { name: 'Delete user' }))
    expect(screen.getByRole('dialog')).toBeTruthy()
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete user' }))
    const notFoundAlert = await waitFor(() => {
      const alert = screen.getByRole('alert')
      expect(alert.textContent).toContain('no longer available')
      return alert
    })
    await waitFor(() => expect(document.activeElement).toBe(notFoundAlert))
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/users/user-2' && init?.method === 'DELETE')).toBe(true)
  })

  it('focuses a localized safe error when the initial users list fails to load', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/users' && init?.method === 'GET') return apiResponse({ error: 'internal_error', message: 'private server detail' }, 500)
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(administrator, '/settings/users')

    const alert = await waitFor(() => {
      const currentAlert = screen.getByRole('alert')
      expect(currentAlert.textContent).toBe(frameKitMessages.en.settings.errors.server)
      expect(currentAlert.getAttribute('role')).toBe('alert')
      expect(currentAlert.textContent).not.toContain('private server detail')
      return currentAlert
    })
    await waitFor(() => expect(document.activeElement).toBe(alert))
    expect(screen.queryByRole('status')).toBeNull()
    expect(fetchMock).toHaveBeenCalledWith('/api/framekit/users', { method: 'GET' })
  })

  it('supports user creation, updates, password reset, token inspection, token revocation, and deletion', async () => {
    let users: ManagedStudioUser[] = [managedAdministrator, managedTarget]
    const targetToken: StudioTokenMetadata = {
      id: 'target-token',
      name: 'Target token',
      tokenPrefix: 'fk_target',
      createdAt: 1,
      lastUsedAt: null,
      revokedAt: null
    }
    let targetTokens = [targetToken]
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/users' && init?.method === 'POST') {
        users = [...users, { id: 'user-3', username: 'created-user', role: 'admin', active: true, createdAt: 2, updatedAt: 2 }]
        return apiResponse({ id: 'user-3', username: 'created-user', role: 'admin' }, 201)
      }
      if (url === '/api/framekit/users' && init?.method === 'GET') return apiResponse(users)
      if (url === '/api/framekit/users/user-2' && init?.method === 'PATCH') {
        users = users.map((user) => user.id === 'user-2' ? { ...user, username: 'updated-target', role: 'admin', active: false } : user)
        return apiResponse({ id: 'user-2', username: 'updated-target', role: 'admin' })
      }
      if (url === '/api/framekit/users/user-2/password') return apiResponse({ status: 'ok' })
      if (url === '/api/framekit/users/user-2/tokens') return apiResponse(targetTokens)
      if (url === '/api/framekit/tokens/target-token' && init?.method === 'DELETE') {
        targetTokens = [{ ...targetToken, revokedAt: 3 }]
        return apiResponse({ status: 'ok' })
      }
      if (url === '/api/framekit/users/user-2' && init?.method === 'DELETE') {
        users = users.filter((user) => user.id !== 'user-2')
        return apiResponse({ status: 'ok' })
      }
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    const view = renderSettings(administrator, '/settings/users')

    const table = await waitFor(() => screen.getByRole('table', { name: 'Users' }))
    expect(screen.getByText('target')).toBeTruthy()
    expect(fetchMock.mock.calls.map(([url]) => url)).toEqual(['/api/framekit/users'])

    const targetRow = within(table).getByText('target').closest('tr') as HTMLElement
    expect(within(targetRow).getByRole('link', { name: 'Edit' }).getAttribute('href')).toBe('/settings/users/user-2')

    fireEvent.change(screen.getByLabelText('Username', { selector: '#framekit-settings-new-user' }), { target: { value: 'created-user' } })
    fireEvent.change(screen.getByLabelText('Temporary password'), { target: { value: 'temporary password with length' } })
    fireEvent.change(screen.getByLabelText('Role', { selector: '#framekit-settings-new-role' }), { target: { value: 'admin' } })
    submitNamedForm('Create user')
    await waitFor(() => expect(screen.getByText('created-user')).toBeTruthy())
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/users' && init?.method === 'POST' && init.body === JSON.stringify({ username: 'created-user', password: 'temporary password with length', role: 'admin' }))).toBe(true)
    expect(screen.queryByRole('status')).toBeNull()

    route.pathname = '/settings/users/user-2'
    view.rerender(
      <FrameKitLocaleProvider initialLocale="en">
        <StatefulSettings user={administrator} locale="en" />
      </FrameKitLocaleProvider>
    )
    const targetEditor = await waitFor(() => screen.getByText('target').closest('li') as HTMLElement)
    fireEvent.change(within(targetEditor).getByLabelText('Username'), { target: { value: 'updated-target' } })
    fireEvent.change(within(targetEditor).getByRole('combobox'), { target: { value: 'admin' } })
    fireEvent.click(within(targetEditor).getByRole('checkbox'))
    fireEvent.submit(within(targetEditor).getByRole('button', { name: 'Save changes' }).closest('form') as HTMLFormElement)
    await waitFor(() => expect(screen.getAllByText('updated-target').length).toBeGreaterThan(0))

    const updatedRow = screen.getByText('updated-target').closest('li') as HTMLElement
    fireEvent.change(within(updatedRow).getByLabelText('New password'), { target: { value: 'reset password with length' } })
    fireEvent.submit(within(updatedRow).getByRole('button', { name: 'Reset password' }).closest('form') as HTMLFormElement)
    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/users/user-2/password' && init?.body === JSON.stringify({ password: 'reset password with length' }))).toBe(true))

    fireEvent.click(within(updatedRow).getByRole('button', { name: 'View tokens' }))
    await waitFor(() => expect(within(updatedRow).getByText('Target token')).toBeTruthy())
    fireEvent.click(within(updatedRow).getByRole('button', { name: 'Revoke' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Revoke token' }))
    await waitFor(() => expect(within(updatedRow).getAllByText('Revoked').length).toBeGreaterThan(0))

    fireEvent.click(within(updatedRow).getByRole('button', { name: 'Delete user' }))
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete user' }))
    await waitFor(() => expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/users/user-2' && init?.method === 'DELETE')).toBe(true))
    await waitFor(() => expect(screen.queryByText('updated-target')).toBeNull())
  })
})

describe('FrameKitStudioSettings safe failures', () => {
  it('maps conflict status to a transient localized toast without exposing response text', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/account' && init?.method === 'PATCH') return apiResponse({ error: 'conflict', message: 'private server detail' }, 409)
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/account')

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'new-owner' } })
    submitNamedForm('Save username')

    const alert = await waitFor(() => screen.getByRole('alert'))
    expect(alert.textContent).toContain('last active administrator')
    expect(alert.textContent).not.toContain('private server detail')
    expect(alert.parentElement?.className).toContain('top-0')
    expect(alert.parentElement?.className).toContain('left-1/2')
    expect(within(alert).getByRole('button', { name: 'Close' })).toBeTruthy()
  })

  it('uses the localized Spanish close label for error toasts', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/account' && init?.method === 'PATCH') return apiResponse({ error: 'conflict' }, 409)
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings(normalUser, '/settings/account', 'es')

    fireEvent.change(screen.getByLabelText('Usuario'), { target: { value: 'nuevo-usuario' } })
    submitNamedForm('Guardar usuario')

    const alert = await waitFor(() => screen.getByRole('alert'))
    expect(within(alert).getByRole('button', { name: 'Cerrar' })).toBeTruthy()
  })
})
