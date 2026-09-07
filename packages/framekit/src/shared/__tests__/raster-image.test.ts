// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { assertRasterSignature, decodeStrictBase64, type RasterMimeType } from '@/shared/raster-image'

const signatures: Record<RasterMimeType, Uint8Array> = {
  'image/png': Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  'image/jpeg': Uint8Array.from([0xff, 0xd8]),
  'image/webp': Uint8Array.from([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]),
  'image/gif': Uint8Array.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
}

describe('assertRasterSignature', () => {
  it.each(Object.entries(signatures))('accepts a valid %s signature', (mimeType, bytes) => {
    expect(() => assertRasterSignature(mimeType as RasterMimeType, bytes)).not.toThrow()
  })

  it.each([
    { mimeType: 'image/png' as const, bytes: signatures['image/jpeg'] },
    { mimeType: 'image/jpeg' as const, bytes: signatures['image/webp'] },
    { mimeType: 'image/webp' as const, bytes: signatures['image/gif'] },
    { mimeType: 'image/gif' as const, bytes: signatures['image/png'] }
  ])('rejects a signature mismatch for $mimeType', ({ mimeType, bytes }) => {
    expect(() => assertRasterSignature(mimeType, bytes)).toThrow(TypeError)
  })
})

describe('decodeStrictBase64', () => {
  it('decodes canonical base64', () => {
    expect(decodeStrictBase64('AQID', 3)).toEqual(Buffer.from([1, 2, 3]))
  })

  it('rejects empty data as a size error', () => {
    expect(() => decodeStrictBase64('', 3)).toThrow(RangeError)
  })

  it.each(['not base64', 'AA=A', 'AAAA==='])('rejects malformed data: %s', (value) => {
    expect(() => decodeStrictBase64(value, 3)).toThrow(TypeError)
  })

  it('rejects non-canonical base64', () => {
    expect(() => decodeStrictBase64('AB==', 3)).toThrow(TypeError)
  })

  it('accepts the decoded-byte limit and rejects the next byte', () => {
    expect(decodeStrictBase64('AQID', 3)).toEqual(Buffer.from([1, 2, 3]))
    expect(() => decodeStrictBase64('AQIDBA==', 3)).toThrow(RangeError)
  })
})
