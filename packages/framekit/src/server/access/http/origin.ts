function requestOrigin (request: Request): string | undefined {
  let internalOrigin: string
  try {
    internalOrigin = new URL(request.url).origin
  } catch {
    return undefined
  }

  const forwardedProtocol = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedProtocol === null && forwardedHost === null) return internalOrigin
  if (forwardedProtocol === null || forwardedHost === null) return undefined

  const protocol = forwardedProtocol.trim().toLowerCase()
  const host = forwardedHost.trim()
  if ((protocol !== 'http' && protocol !== 'https') || host === '' || host.includes(',') || /[\s\\/?#@]/.test(host)) return undefined

  let forwardedOrigin: string
  try {
    const parsed = new URL(`${protocol}://${host}`)
    if (parsed.host === '' || parsed.username !== '' || parsed.password !== '' || parsed.pathname !== '/' || parsed.search !== '' || parsed.hash !== '') return undefined
    forwardedOrigin = parsed.origin
  } catch {
    return undefined
  }

  // Next builds request.url from its configured host and port. Only an HTTPS
  // proxy may replace that internal origin with its forwarded public host.
  if (protocol === 'http' && forwardedOrigin !== internalOrigin) return undefined
  return forwardedOrigin
}

export function isSameOrigin (request: Request): boolean {
  const origin = request.headers.get('origin')
  if (origin === null || origin === 'null') return false

  const expectedOrigin = requestOrigin(request)
  if (expectedOrigin === undefined) return false

  return origin === expectedOrigin
}
