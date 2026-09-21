// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { FrameKitLocaleProvider } from '@/studio/i18n/locale-provider'
import { FrameKitLoginForm } from '@/studio/login/login-form'

const router = vi.hoisted(() => ({ replace: vi.fn() }))

vi.mock('next/navigation', () => ({
  useRouter: () => router
}))

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  router.replace.mockReset()
})

function renderLoginForm () {
  return render(
    <FrameKitLocaleProvider initialLocale="en">
      <FrameKitLoginForm />
    </FrameKitLocaleProvider>
  )
}

function fillCredentials () {
  fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'admin' } })
  fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'correct password' } })
}

describe('FrameKitLoginForm', () => {
  it('renders associated username and native password controls with visible focus styles', () => {
    renderLoginForm()

    const username = screen.getByLabelText('Username')
    const password = screen.getByLabelText('Password')

    expect(username.getAttribute('id')).toBe('framekit-login-username')
    expect(password.getAttribute('id')).toBe('framekit-login-password')
    expect(password.getAttribute('type')).toBe('password')
    expect(username.className).toContain('focus:ring-2')
    expect(password.className).toContain('focus:ring-2')
  })

  it('shows a pending state and prevents duplicate submissions', async () => {
    let resolveResponse!: (response: Response) => void
    const response = new Promise<Response>((resolve) => { resolveResponse = resolve })
    const fetchMock = vi.fn(() => response)
    vi.stubGlobal('fetch', fetchMock)
    renderLoginForm()
    fillCredentials()

    const form = screen.getByRole('button', { name: 'Sign in' }).closest('form')
    const button = screen.getByRole('button', { name: 'Sign in' })
    fireEvent.submit(form as HTMLFormElement)

    expect((button as HTMLButtonElement).disabled).toBe(true)
    expect(button.textContent).toBe('Signing in...')
    expect(form?.getAttribute('aria-busy')).toBe('true')
    fireEvent.submit(form as HTMLFormElement)
    expect(fetchMock).toHaveBeenCalledOnce()

    resolveResponse(new Response('{}', { status: 200 }))
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith('/editor'))
  })

  it('shows generic feedback for invalid credentials', async () => {
    const fetchMock = vi.fn(async () => new Response(JSON.stringify({ message: 'database detail' }), { status: 401 }))
    vi.stubGlobal('fetch', fetchMock)
    renderLoginForm()
    fillCredentials()

    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Invalid username or password.'))
    expect(screen.queryByText('database detail')).toBeNull()
    expect(router.replace).not.toHaveBeenCalled()
  })

  it('shows safe feedback for non-credential server failures', async () => {
    const fetchMock = vi.fn(async () => new Response('private server detail', { status: 503 }))
    vi.stubGlobal('fetch', fetchMock)
    renderLoginForm()
    fillCredentials()

    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(screen.getByRole('alert').textContent).toBe('Unable to sign in right now. Please try again.'))
    expect(screen.queryByText('private server detail')).toBeNull()
  })

  it('posts exact credentials and navigates after success', async () => {
    const fetchMock = vi.fn(async () => new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetchMock)
    renderLoginForm()
    fillCredentials()

    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form') as HTMLFormElement)

    await waitFor(() => expect(router.replace).toHaveBeenCalledOnce())
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith('/api/framekit/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'correct password' })
    })
  })
})
