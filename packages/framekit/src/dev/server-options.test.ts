import { describe, expect, it } from 'vitest'

import { getServerOptions } from './server-options'

describe('server options', () => {
  it('uses localhost and port 3000 by default', () => {
    expect(getServerOptions({})).toEqual({ hostname: 'localhost', port: 3000 })
  })

  it('prefers FRAMEKIT_HOST over HOST', () => {
    expect(getServerOptions({ HOST: 'host' }).hostname).toBe('host')
    expect(getServerOptions({ HOST: 'host', FRAMEKIT_HOST: 'framekit' }).hostname).toBe('framekit')
  })

  it.each([
    ['1', 1],
    ['65535', 65_535],
    ['4321', 4_321],
  ])('accepts PORT %s', (value, port) => {
    expect(getServerOptions({ PORT: value })).toEqual({ hostname: 'localhost', port })
  })

  it.each(['-1', '0', '65536', '3.5', 'invalid'])('rejects invalid PORT %s', (port) => {
    expect(() => getServerOptions({ PORT: port })).toThrow(`Invalid PORT: ${port}`)
  })
})
