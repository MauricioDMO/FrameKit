// @vitest-environment jsdom

import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderEditor } from './fixtures'
import { setupFrameKitEditorTests } from './setup'

setupFrameKitEditorTests()

describe('FrameKitEditor storage', () => {
  it('keeps editing when localStorage rejects writes', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('storage unavailable')
    })

    try {
      renderEditor()
      const title = screen.getByRole('textbox', { name: 'Title' })
      fireEvent.change(title, { target: { value: 'Updated' } })
      expect((title as HTMLInputElement).value).toBe('Updated')
    } finally {
      setItem.mockRestore()
    }
  })

  it('keeps editing when localStorage is inaccessible', () => {
    const storageGetter = vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('localStorage unavailable', 'SecurityError')
    })

    try {
      renderEditor()
      const title = screen.getByRole('textbox', { name: 'Title' })
      expect((title as HTMLInputElement).value).toBe('English title')
      fireEvent.change(title, { target: { value: 'Updated' } })
      expect((title as HTMLInputElement).value).toBe('Updated')
    } finally {
      storageGetter.mockRestore()
    }
  })
})
