import { resolveTemplateData } from '@/core/template-data/resolve-template-data'
import { validateTemplateData, validateTemplateDefinition } from '@/core/validation'
import type { TemplateDataValidationError } from '@/core/validation'
import type { ResolvedRenderPayload, TemplateDefinition, TemplateRegistryEntry } from '@/types'
import type { ImageRenderRequest, ImageRenderRuntimeConfig } from '@/server/config'
import { ImageRenderError } from '@/server/errors'
import { prepareRenderInputs } from '@/server/image-input'
import { failure } from './errors'
import type { RequestDeadline } from './request-deadline'
import { awaitWithAbort, throwIfAborted } from './request-deadline'

export async function loadDefinition (entry: TemplateRegistryEntry, signal: AbortSignal): Promise<TemplateDefinition> {
  try {
    const result = validateTemplateDefinition((await awaitWithAbort(() => entry.load(), signal)).default)
    if (!result.success) throw new Error(result.error)
    return result.definition
  } catch (error) {
    throw failure('render_failed', error)
  }
}

interface ResolveRenderPayloadOptions {
  entry: TemplateRegistryEntry
  definition: TemplateDefinition
  request: ImageRenderRequest
  config: ImageRenderRuntimeConfig
  deadline: RequestDeadline
}

export async function resolveRenderPayload ({
  entry,
  definition,
  request,
  config,
  deadline
}: ResolveRenderPayloadOptions): Promise<ResolvedRenderPayload> {
  throwIfAborted(deadline)
  const signal = deadline.signal

  const variant = request.variant ?? definition.variants.default
  if (!Object.hasOwn(definition.content, variant)) throw failure('invalid_request')

  let prepared: Awaited<ReturnType<typeof prepareRenderInputs>>
  try {
    prepared = await awaitWithAbort(() => prepareRenderInputs({
      definition,
      variant,
      data: request.data,
      assets: entry.assets,
      allowedImageHosts: config.allowedImageHosts,
      signal
    }), signal)
  } catch (error) {
    throwIfAborted(deadline)
    if (error instanceof ImageRenderError) throw error
    throw failure('invalid_template_data', error)
  }
  throwIfAborted(deadline)

  let data: Record<string, string | number | boolean>
  try {
    data = resolveTemplateData(
      definition,
      variant,
      prepared.edits as Record<string, string | number | boolean>,
      prepared.assets
    ) as Record<string, string | number | boolean>
  } catch (error) {
    throwIfAborted(deadline)
    if (error instanceof ImageRenderError) throw error
    throw failure('invalid_template_data', error)
  }
  throwIfAborted(deadline)

  let validationErrors: Record<string, TemplateDataValidationError>
  try {
    validationErrors = validateTemplateData(definition, data)
  } catch (error) {
    throwIfAborted(deadline)
    if (error instanceof ImageRenderError) throw error
    throw failure('invalid_template_data', error)
  }
  if (Object.keys(validationErrors).length > 0) {
    throw failure('invalid_template_data', undefined, validationErrors)
  }
  throwIfAborted(deadline)

  return {
    template: entry.slug,
    variant,
    data,
    assets: prepared.assets,
    width: definition.width,
    height: definition.height
  }
}
