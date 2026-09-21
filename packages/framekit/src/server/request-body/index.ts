import { ImageRenderError } from '@/server/errors'
import { abortReason, readChunk } from './reader'
import { invalidRequest, maxRequestBytes, requestTooLarge, validateRequestMetadata } from './validate-request'

export async function readJsonBody (request: Request, signal?: AbortSignal): Promise<unknown> {
  validateRequestMetadata(request)

  const body = request.body
  if (body === null) invalidRequest()
  if (signal?.aborted) throw abortReason(signal)

  let reader: ReadableStreamDefaultReader<Uint8Array>
  try {
    reader = body.getReader()
  } catch {
    invalidRequest()
  }
  const decoder = new TextDecoder('utf-8', { fatal: true })
  const text: string[] = []
  let length = 0
  let cancelPromise: Promise<void> | undefined

  const cancelReader = (): Promise<void> => {
    cancelPromise ??= Promise.resolve().then(() => reader.cancel()).catch(() => undefined)
    return cancelPromise
  }
  const onAbort = () => { cancelReader().catch(() => undefined) }
  signal?.addEventListener('abort', onAbort, { once: true })

  try {
    while (true) {
      const result = await readChunk(reader, signal)
      if (result.done) break

      length += result.value.byteLength
      if (length > maxRequestBytes) {
        await cancelReader()
        requestTooLarge()
      }
      text.push(decoder.decode(result.value, { stream: true }))
    }

    text.push(decoder.decode())
    try {
      return JSON.parse(text.join('')) as unknown
    } catch {
      invalidRequest()
    }
  } catch (error) {
    if (!signal?.aborted) await cancelReader()
    if (signal?.aborted) throw abortReason(signal)
    if (error instanceof ImageRenderError) throw error
    invalidRequest()
  } finally {
    signal?.removeEventListener('abort', onAbort)
    if (cancelPromise !== undefined) await cancelPromise
    reader.releaseLock()
  }
}
