import type { TemplateAssetManifest, TemplateBase } from '@/types'
import { isPlainObject } from '@/core/validation/utils'
import { prepareDataUrl } from './data-url'
import { fetchRemoteRasterImage } from './remote-image'
import { isSafeRootRelativePath, parseRemoteTarget } from './remote-target'
import { invalidTemplateData, throwIfAborted, unsupportedImage } from './shared'

interface PrepareRenderInputsOptions {
  definition: TemplateBase
  variant: string
  data?: unknown
  assets: TemplateAssetManifest
  allowedImageHosts: ReadonlySet<string>
  signal?: AbortSignal
}

interface PreparedRenderInputs {
  edits: Record<string, unknown>
  assets: TemplateAssetManifest
}

async function prepareImageSource (
  value: unknown,
  allowedImageHosts: ReadonlySet<string>,
  signal: AbortSignal | undefined
): Promise<string> {
  if (typeof value !== 'string' || value === '') unsupportedImage()
  throwIfAborted(signal)

  if (/^data:/i.test(value)) return prepareDataUrl(value)
  if (isSafeRootRelativePath(value)) return value

  if (/^https?:\/\//i.test(value)) {
    const url = parseRemoteTarget(value, allowedImageHosts)
    return fetchRemoteRasterImage(url, allowedImageHosts, signal)
  }

  unsupportedImage()
}

export async function prepareRenderInputs ({
  definition,
  variant,
  data,
  assets,
  allowedImageHosts,
  signal
}: PrepareRenderInputsOptions): Promise<PreparedRenderInputs> {
  throwIfAborted(signal)

  const inputData = data === undefined ? {} : data
  if (!isPlainObject(inputData)) invalidTemplateData()

  for (const key of Object.keys(inputData)) {
    if (!Object.hasOwn(definition.fields, key)) invalidTemplateData()
  }
  if (!Object.hasOwn(definition.content, variant)) invalidTemplateData()

  const preparedAssets: TemplateAssetManifest = {
    common: { ...assets.common },
    variants: { ...assets.variants }
  }
  let selectedVariantAssets: Record<string, string> | undefined
  const edits: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(inputData)) {
    const field = definition.fields[key]
    if (field.kind !== 'image') {
      edits[key] = value
      continue
    }

    const preparedValue = await prepareImageSource(value, allowedImageHosts, signal)
    if (field.scope === 'common') {
      preparedAssets.common[key] = preparedValue
      continue
    }

    selectedVariantAssets ??= { ...(assets.variants[variant] ?? {}) }
    preparedAssets.variants[variant] = selectedVariantAssets
    selectedVariantAssets[key] = preparedValue
  }

  return { edits, assets: preparedAssets }
}
