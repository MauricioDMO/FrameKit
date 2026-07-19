import { describe, expect, it } from 'vitest'

import { getServerOptions } from './server-options'

describe('server options', () => {
  it('resolves explicit network options and rejects invalid ports', () => {
    expect(getServerOptions({})).toEqual({ hostname: 'localhost', port: 3000 })
    expect(getServerOptions({ HOST: 'host', FRAMEKIT_HOST: 'framekit', PORT: '4321' })).toEqual({
      hostname: 'framekit',
      port: 4321,
    })

    for (const port of ['0', '65536', '3.5', 'invalid']) {
      expect(() => getServerOptions({ PORT: port })).toThrow(`Invalid PORT: ${port}`)
    }
  })
})
