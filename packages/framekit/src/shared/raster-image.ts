export type RasterMimeType =
  | 'image/png'
  | 'image/jpeg'
  | 'image/webp'
  | 'image/gif'

const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const jpegSignature = [0xff, 0xd8]
const riffSignature = [0x52, 0x49, 0x46, 0x46]
const webpSignature = [0x57, 0x45, 0x42, 0x50]
const gifSignature = [0x47, 0x49, 0x46, 0x38]

function hasBytes (bytes: Uint8Array, signature: readonly number[], offset = 0): boolean {
  return bytes.length >= offset + signature.length && signature.every((byte, index) => bytes[offset + index] === byte)
}

export function decodeStrictBase64 (value: string, maxBytes: number): Buffer {
  if (!/^[A-Za-z0-9+/]*={0,2}$/.test(value) || value.length % 4 !== 0) {
    throw new TypeError('Invalid base64 data')
  }

  const bytes = Buffer.from(value, 'base64')
  if (bytes.length === 0 || bytes.length > maxBytes) {
    throw new RangeError('Decoded data is empty or exceeds the limit')
  }
  if (bytes.toString('base64') !== value) {
    throw new TypeError('Invalid base64 data')
  }
  return bytes
}

export function assertRasterSignature (mimeType: RasterMimeType, bytes: Uint8Array): void {
  const isPng = hasBytes(bytes, pngSignature)
  const isJpeg = hasBytes(bytes, jpegSignature)
  const isWebp = hasBytes(bytes, riffSignature) && hasBytes(bytes, webpSignature, 8)
  const isGif = hasBytes(bytes, gifSignature)
  const valid = mimeType === 'image/png'
    ? isPng
    : mimeType === 'image/jpeg'
      ? isJpeg
      : mimeType === 'image/webp'
        ? isWebp
        : mimeType === 'image/gif'
          ? isGif
          : false

  if (!valid) throw new TypeError('Raster signature does not match MIME type')
}
