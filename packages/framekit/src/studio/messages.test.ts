import { describe, expect, it } from 'vitest'

import { getFrameKitLocale } from './messages'

describe('getFrameKitLocale', () => {
  it.each([
    ['en', 'en'],
    ['en-US,en;q=0.9', 'en'],
    ['EN-us,en;q=0.9', 'en'],
    ['es', 'es'],
    ['es-MX,es;q=0.9', 'es'],
    ['fr-FR,fr;q=0.9', 'es'],
    ['', 'es'],
    [null, 'es'],
    [undefined, 'es'],
  ] as const)('resolves %j to %s', (value, expected) => {
    expect(getFrameKitLocale(value)).toBe(expected)
  })
})
