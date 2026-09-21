// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FrameKitLocaleProvider } from '@/studio/i18n/locale-provider'
import { frameKitMessages } from '@/studio/i18n/messages'
import { FrameKitStudioSettings } from '@/studio/settings/studio-settings'
import type { ManagedStudioUser, StudioTokenMetadata } from '@/studio/settings/types'
import type { StudioUser } from '@/studio/types'

const router = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => router
}))

const normalUser: StudioUser = { id: 'user-1', username: 'owner', role: 'user' }
const administrator: StudioUser = { id: 'admin-1', username: 'administrator', role: 'admin' }

function apiResponse (body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

function renderSettings (user = normalUser) {
  return render(
    <FrameKitLocaleProvider initialLocale="en">
      <FrameKitStudioSettings user={user} locale="en" messages={frameKitMessages.en.settings} />
    </FrameKitLocaleProvider>
  )
}

function submitNamedForm (name: string) {
  fireEvent.submit(screen.getByRole('button', { name }).closest('form') as HTMLFormElement)
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  router.replace.mockReset()
  if ('clipboard' in navigator) Reflect.deleteProperty(navigator, 'clipboard')
})

describe('FrameKitStudioSettings account workflows', () => {
  it('updates the displayed safe identity and sends the exact account body', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/tokens') return apiResponse([])
      if (url === '/api/framekit/account' && init?.method === 'PATCH') return apiResponse({ ...normalUser, username: 'renamed-owner' })
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings()

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'renamed-owner' } })
    submitNamedForm('Save username')

    await waitFor(() => expect(screen.getByText('renamed-owner')).toBeTruthy())
    const accountRequest = fetchMock.mock.calls.find(([url, init]) => url === '/api/framekit/account' && init?.method === 'PATCH')
    expect(accountRequest?.[1]).toMatchObject({
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'renamed-owner' })
    })
  })

  it('changes the password and navigates to login without displaying server details', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/tokens' && init?.method === 'GET') return apiResponse([])
      if (url === '/api/framekit/account/password' && init?.method === 'POST') return apiResponse({ status: 'ok' })
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings()

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
      if (url === '/api/framekit/tokens' && init?.method === 'GET') return apiResponse([])
      if (url === '/api/framekit/logout' && init?.method === 'POST') return apiResponse({ status: 'ok' })
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings()

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
    renderSettings()

    await waitFor(() => expect(screen.getByText('Old token')).toBeTruthy())
    fireEvent.change(screen.getByLabelText('Token name'), { target: { value: 'New token' } })
    submitNamedForm('Create token')

    await waitFor(() => expect(screen.getByText(createdToken.token)).toBeTruthy())
    expect(screen.getByText('Old token')).toBeTruthy()
    expect(screen.queryByText('old secret')).toBeNull()

    fireEvent.click(screen.getByRole('button', { name: 'Copy token' }))
    await waitFor(() => expect(writeText).toHaveBeenCalledWith(createdToken.token))
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
    renderSettings()

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
    renderSettings()

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
    renderSettings()

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

  it('hides Users and never calls the users endpoint for normal users', async () => {
    const fetchMock = vi.fn(async (url: string) => url === '/api/framekit/tokens' ? apiResponse([]) : apiResponse({}))
    vi.stubGlobal('fetch', fetchMock)
    renderSettings()

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/framekit/tokens', { method: 'GET' }))
    expect(screen.queryByRole('heading', { name: 'Users' })).toBeNull()
    expect(fetchMock.mock.calls.some(([url]) => url === '/api/framekit/users')).toBe(false)
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
      if (url === '/api/framekit/tokens') return apiResponse([])
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
    renderSettings(administrator)

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Users' })).toBeTruthy())
    expect(screen.getByText('target')).toBeTruthy()

    fireEvent.change(screen.getByLabelText('Username', { selector: '#framekit-settings-new-user' }), { target: { value: 'created-user' } })
    fireEvent.change(screen.getByLabelText('Temporary password'), { target: { value: 'temporary password with length' } })
    fireEvent.change(screen.getByLabelText('Role', { selector: '#framekit-settings-new-role' }), { target: { value: 'admin' } })
    submitNamedForm('Create user')
    await waitFor(() => expect(screen.getByText('created-user')).toBeTruthy())
    expect(fetchMock.mock.calls.some(([url, init]) => url === '/api/framekit/users' && init?.method === 'POST' && init.body === JSON.stringify({ username: 'created-user', password: 'temporary password with length', role: 'admin' }))).toBe(true)

    const targetRow = () => screen.getByText('target').closest('li') as HTMLElement
    fireEvent.change(within(targetRow()).getByLabelText('Username'), { target: { value: 'updated-target' } })
    fireEvent.change(within(targetRow()).getByRole('combobox'), { target: { value: 'admin' } })
    fireEvent.click(within(targetRow()).getByRole('checkbox'))
    fireEvent.submit(within(targetRow()).getByRole('button', { name: 'Save changes' }).closest('form') as HTMLFormElement)
    await waitFor(() => expect(screen.getAllByText('updated-target').length).toBeGreaterThan(0))

    const updatedRow = screen.getAllByText('updated-target').find((element) => element.closest('li') !== null)?.closest('li') as HTMLElement
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
  it('maps conflict status to a focused localized message without exposing response text', async () => {
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      if (url === '/api/framekit/tokens') return apiResponse([])
      if (url === '/api/framekit/account' && init?.method === 'PATCH') return apiResponse({ error: 'conflict', message: 'private server detail' }, 409)
      return apiResponse({})
    })
    vi.stubGlobal('fetch', fetchMock)
    renderSettings()

    fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'new-owner' } })
    submitNamedForm('Save username')

    const alert = await waitFor(() => screen.getByRole('alert'))
    expect(alert.textContent).toContain('last active administrator')
    expect(alert.textContent).not.toContain('private server detail')
    await waitFor(() => expect(document.activeElement).toBe(alert))
  })
})
