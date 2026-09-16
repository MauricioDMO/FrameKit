function requestOrigin (request: Request): string | undefined {
  let internalUrl: URL
  try {
    internalUrl = new URL(request.url)
  } catch {
    return undefined
  }
  const internalOrigin = internalUrl.origin

  const forwardedProtocol = request.headers.get('x-forwarded-proto')
  const forwardedHost = request.headers.get('x-forwarded-host')
  if (forwardedProtocol === null && forwardedHost === null) {
    if (internalUrl.hostname !== '0.0.0.0' && internalUrl.hostname !== '[::]') return internalOrigin
    const host = request.headers.get('host')
    if (host === null) return internalOrigin

    return parseOrigin(internalUrl.protocol.slice(0, -1), host)
  }
  if (forwardedProtocol === null || forwardedHost === null) return undefined

  const protocol = forwardedProtocol.trim().toLowerCase()
  const forwardedOrigin = parseOrigin(protocol, forwardedHost)
  if (forwardedOrigin === undefined) return undefined

  // Next may synthesize HTTP forwarding headers from Host while request.url
  // uses its wildcard bind host. Only an HTTPS proxy may otherwise replace the
  // internal origin with its forwarded public host.
  if (protocol === 'http' && forwardedOrigin !== internalOrigin) {
    const host = request.headers.get('host')
    const hostOrigin = host === null || !isWildcardHostname(internalUrl.hostname)
      ? undefined
      : parseOrigin(protocol, host)
    if (hostOrigin !== forwardedOrigin) return undefined
  }
  return forwardedOrigin
}

function isWildcardHostname (hostname: string): boolean {
  return hostname === '0.0.0.0' || hostname === '[::]'
}

function parseOrigin (protocol: string, host: string): string | undefined {
  const normalizedHost = host.trim()
  if ((protocol !== 'http' && protocol !== 'https') || normalizedHost === '' || normalizedHost.includes(',') || /[\s\\/?#@]/.test(normalizedHost)) return undefined

  try {
    const parsed = new URL(`${protocol}://${normalizedHost}`)
    if (parsed.host === '' || parsed.username !== '' || parsed.password !== '' || parsed.pathname !== '/' || parsed.search !== '' || parsed.hash !== '') return undefined
    return parsed.origin
  } catch {
    return undefined
  }
}

export function isSameOrigin (request: Request): boolean {
  const origin = request.headers.get('origin')
  if (origin === null || origin === 'null') return false

  const expectedOrigin = requestOrigin(request)
  if (expectedOrigin === undefined) return false

  return origin === expectedOrigin
}
