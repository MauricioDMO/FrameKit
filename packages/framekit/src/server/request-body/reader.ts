function abortReason (signal: AbortSignal): unknown {
  return signal.reason ?? Object.assign(new Error('The operation was aborted'), { name: 'AbortError' })
}

export async function readChunk (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  signal: AbortSignal | undefined
): Promise<ReadableStreamReadResult<Uint8Array>> {
  if (signal === undefined) return await reader.read()
  if (signal.aborted) throw abortReason(signal)

  let rejectAbort: (reason?: unknown) => void = () => undefined
  const aborted = new Promise<never>((_resolve, reject) => { rejectAbort = reject })
  const onAbort = () => rejectAbort(abortReason(signal))
  signal.addEventListener('abort', onAbort, { once: true })

  try {
    return await Promise.race([reader.read(), aborted])
  } finally {
    signal.removeEventListener('abort', onAbort)
  }
}

export { abortReason }
