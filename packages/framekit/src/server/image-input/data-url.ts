import { assertRasterSignature, decodeStrictBase64, type RasterMimeType } from '@/shared/raster-image'
import { canonicalDataUrl, imageTooLarge, maxImageBytes, unsupportedImage } from './shared'

function decodedLength (value: string): number {
  const padding = value.endsWith('==') ? 2 : value.endsWith('=') ? 1 : 0
  return value.length / 4 * 3 - padding
}

function parseDataUrl (value: string): { mimeType: RasterMimeType; encoded: string } {
  const match = /^data:(image\/(?:png|jpeg|webp|gif));base64,([A-Za-z0-9+/]*={0,2})$/i.exec(value)
  if (!match || match[2].length % 4 !== 0) unsupportedImage()

  const mimeType = match[1].toLowerCase() as RasterMimeType
  const encoded = match[2]
  if (decodedLength(encoded) > maxImageBytes) imageTooLarge()
  return { mimeType, encoded }
}

export function prepareDataUrl (value: string): string {
  const { mimeType, encoded } = parseDataUrl(value)
  let bytes: Buffer
  try {
    bytes = decodeStrictBase64(encoded, maxImageBytes)
  } catch (error) {
    if (error instanceof RangeError && encoded !== '') imageTooLarge()
    unsupportedImage()
  }

  try {
    assertRasterSignature(mimeType, bytes)
  } catch {
    unsupportedImage()
  }

  return canonicalDataUrl(mimeType, bytes)
}
