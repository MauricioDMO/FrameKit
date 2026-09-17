// @vitest-environment jsdom

import { act, cleanup, fireEvent, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ErrorToast, SuccessToast, toast } from '@/editor/toast'

afterEach(() => {
  document.querySelectorAll<HTMLButtonElement>('[data-framekit-toast-dismiss]').forEach((button) => {
    act(() => fireEvent.click(button))
  })
  cleanup()
  vi.useRealTimers()
})

describe('toast', () => {
  it('renders custom content in the requested position and dismisses it', () => {
    let dismiss!: () => void

    act(() => {
      dismiss = toast(<SuccessToast message="Saved" />, {
        position: 'center-center',
        duration: Infinity,
        closeLabel: 'Dismiss'
      })
    })

    expect(screen.getByText('Saved')).toBeTruthy()
    expect(screen.getAllByRole('status')).toHaveLength(1)
    expect(screen.getByRole('status').parentElement?.className).toContain('left-1/2')
    expect(screen.getByRole('button', { name: 'Dismiss' })).toBeTruthy()

    act(dismiss)

    expect(screen.queryByText('Saved')).toBeNull()
  })

  it('provides success, error and info helpers with their options', () => {
    act(() => {
      toast.success('Success', { position: 'top-left', duration: Infinity, closeLabel: 'Close success' })
      toast.error('Error', { position: 'center-right', duration: Infinity, closeLabel: 'Close error' })
      toast.info('Info', { position: 'bottom-center', duration: Infinity, closeLabel: 'Close info' })
    })

    expect(screen.getAllByRole('status')).toHaveLength(2)
    expect(screen.getByRole('alert')).toBeTruthy()
    expect(screen.getByRole('alert').parentElement?.className).toContain('top-1/2')
    expect(screen.getByRole('alert').parentElement?.className).toContain('right-0')
    expect(screen.getByRole('button', { name: 'Close success' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Close error' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Close info' })).toBeTruthy()
  })

  it('dismisses a toast automatically', () => {
    vi.useFakeTimers()

    act(() => {
      toast.info('Temporary', { duration: 4000 })
    })
    expect(screen.getByText('Temporary')).toBeTruthy()

    act(() => vi.advanceTimersByTime(4000))

    expect(screen.queryByText('Temporary')).toBeNull()
  })

  it('supports the error component in custom toasts', () => {
    act(() => {
      toast(<ErrorToast message="Failure" />, { duration: Infinity })
    })

    expect(screen.getByText('Failure')).toBeTruthy()
  })
})
