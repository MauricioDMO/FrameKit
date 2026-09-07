import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

export function setupFrameKitEditorTests () {
  beforeEach(() => localStorage.clear())
  afterEach(() => {
    cleanup()
    localStorage.clear()
    vi.clearAllMocks()
  })
}
