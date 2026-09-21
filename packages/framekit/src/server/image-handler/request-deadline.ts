import { ImageRenderError } from '@/server/errors'
import { failure } from './errors'

export interface RequestDeadline {
  signal: AbortSignal
  timeoutError?: ImageRenderError
  cleanup: () => void
}

export function createRequestDeadline (request: Request, timeoutMs: number): RequestDeadline {
  const controller = new AbortController()
  let timeoutError: ImageRenderError | undefined
  const onRequestAbort = () => controller.abort(request.signal.reason)

  if (request.signal.aborted) onRequestAbort()
  else request.signal.addEventListener('abort', onRequestAbort, { once: true })

  const timer = setTimeout(() => {
    timeoutError = failure('render_timeout')
    controller.abort(timeoutError)
  }, timeoutMs)

  return {
    signal: controller.signal,
    get timeoutError () { return timeoutError },
    cleanup: () => {
      clearTimeout(timer)
      request.signal.removeEventListener('abort', onRequestAbort)
    }
  }
}

export function throwIfAborted (deadline: RequestDeadline): void {
  if (!deadline.signal.aborted) return
  if (deadline.timeoutError !== undefined) throw deadline.timeoutError
  throw failure('render_failed', deadline.signal.reason)
}

export async function awaitWithAbort<T> (start: () => PromiseLike<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) throw signal.reason ?? failure('render_failed')

  const task = Promise.resolve().then(start)
  let rejectAbort: (reason?: unknown) => void = () => undefined
  const aborted = new Promise<never>((_resolve, reject) => { rejectAbort = reject })
  const onAbort = () => rejectAbort(signal.reason ?? failure('render_failed'))
  signal.addEventListener('abort', onAbort, { once: true })
  if (signal.aborted) onAbort()

  try {
    return await Promise.race([task, aborted])
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
}

export function normalizeFailure (error: unknown, deadline?: RequestDeadline): ImageRenderError {
  if (deadline?.timeoutError !== undefined) return deadline.timeoutError
  if (deadline?.signal.aborted) return failure('render_failed', deadline.signal.reason)
  if (error instanceof ImageRenderError) return error
  return failure('render_failed', error)
}
