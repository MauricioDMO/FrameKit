import { mkdir, readdir, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { assertRasterSignature, decodeStrictBase64, type RasterMimeType } from '../../../shared/raster-image'
import { findTemplates } from '../../discovery/find-templates'
import { AssetUploadError } from './errors'

const maxAssetBytes = 8_000_000
const identifierPattern = /^[A-Za-z0-9][A-Za-z0-9_-]*$/
const mimeExtensions: Record<string, string> = {
  'image/gif': '.gif',
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
}

export interface ReplaceAssetInput {
  templateSlug: string
  variant: string
  fieldKey: string
  mimeType: string
  data: string
}

function decodeAsset (data: string): Buffer {
  try {
    return decodeStrictBase64(data, maxAssetBytes)
  } catch (error) {
    if (error instanceof RangeError) throw new AssetUploadError(413, 'El asset supera el límite de 8 MB')
    throw new AssetUploadError(400, 'Los datos del asset no son base64 válido')
  }
}

function validateImageSignature (mimeType: string, bytes: Buffer): void {
  try {
    assertRasterSignature(mimeType as RasterMimeType, bytes)
  } catch {
    throw new AssetUploadError(415, 'El contenido no coincide con el tipo de imagen declarado')
  }
}

export async function replaceAsset (projectRoot: string, input: ReplaceAssetInput): Promise<void> {
  if (!identifierPattern.test(input.fieldKey) || input.fieldKey === 'language') {
    throw new AssetUploadError(400, 'La key del field no es válida')
  }
  if (input.variant !== 'common' && !identifierPattern.test(input.variant)) {
    throw new AssetUploadError(400, 'La variante no es válida')
  }

  const extension = mimeExtensions[input.mimeType]
  if (!extension) throw new AssetUploadError(415, 'Tipo de imagen no soportado')
  const bytes = decodeAsset(input.data)
  validateImageSignature(input.mimeType, bytes)

  const templatesDirectory = path.join(projectRoot, 'src', 'templates')
  const templates = await findTemplates(templatesDirectory)
  const template = templates.find((candidate) => candidate.slug === input.templateSlug)
  if (!template) throw new AssetUploadError(404, 'La plantilla no existe')

  const assetsDirectory = path.join(template.absolutePath, 'assets', input.variant)
  await mkdir(assetsDirectory, { recursive: true })

  for (const entry of await readdir(assetsDirectory, { withFileTypes: true })) {
    const extension = path.extname(entry.name).toLowerCase()
    if (!entry.isFile() || !['.avif', '.gif', '.jpeg', '.jpg', '.png', '.svg', '.webp'].includes(extension)) continue
    if (entry.name.slice(0, -extension.length) !== input.fieldKey) continue
    await unlink(path.join(assetsDirectory, entry.name))
  }

  await writeFile(path.join(assetsDirectory, `${input.fieldKey}${extension}`), bytes)
}
