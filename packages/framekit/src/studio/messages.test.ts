import { describe, expect, it } from 'vitest'

import { getFrameKitLocale } from './messages'

describe('getFrameKitLocale', () => {
  it('uses English only for English locale preferences', () => {
    expect(getFrameKitLocale('en-US,en;q=0.9')).toBe('en')
    expect(getFrameKitLocale('es-MX,es;q=0.9')).toBe('es')
    expect(getFrameKitLocale()).toBe('es')
  })
})
