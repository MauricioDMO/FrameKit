import { isIP } from 'node:net'

import { imageHostNotAllowed, hasControlCharacters, loopbackHostnames, unsupportedImage } from './shared'

export function isSafeRootRelativePath (value: string): boolean {
  if (
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('?') ||
    value.includes('#') ||
    value.includes('%') ||
    value.includes('\\') ||
    hasControlCharacters(value)
  ) {
    return false
  }

  const prefix = value.startsWith('/assets/')
    ? '/assets/'
    : value.startsWith('/framekit/templates/')
      ? '/framekit/templates/'
      : undefined
  if (!prefix) return false

  const segments = value.slice(prefix.length).split('/')
  return segments.length > 0 && segments.every((segment) => /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(segment))
}

function isIpLiteral (hostname: string): boolean {
  const value = hostname.startsWith('[') && hostname.endsWith(']')
    ? hostname.slice(1, -1)
    : hostname
  return isIP(value) !== 0
}

export function hasCredentialsInAuthority (value: string): boolean {
  if (!/^[A-Za-z][A-Za-z0-9+.-]*:\/\//i.test(value)) return false
  const authority = value.slice(value.indexOf('://') + 3)
  const end = authority.search(/[/?#]/)
  return (end === -1 ? authority : authority.slice(0, end)).includes('@')
}

export function hasInvalidPortSyntax (value: string): boolean {
  if (!/^[A-Za-z][A-Za-z0-9+.-]*:\/\//i.test(value)) return false
  const authority = value.slice(value.indexOf('://') + 3).split(/[/?#]/, 1)[0]
  if (authority.startsWith('[')) {
    const closingBracket = authority.indexOf(']')
    if (closingBracket === -1) return true
    const suffix = authority.slice(closingBracket + 1)
    return suffix !== '' && !/^:\d+$/.test(suffix)
  }

  const portSeparator = authority.lastIndexOf(':')
  return portSeparator !== -1 && !/^\d+$/.test(authority.slice(portSeparator + 1))
}

export type RemoteTargetResult = {
  ok: true
  url: URL
} | {
  ok: false
  reason: 'invalid' | 'host_not_allowed' | 'non_https'
}

export function validateRemoteTarget (url: URL, allowedImageHosts: ReadonlySet<string>): RemoteTargetResult {
  if (url.protocol !== 'https:') return { ok: false, reason: 'non_https' }

  if (
    url.username !== '' ||
    url.password !== '' ||
    url.hash !== '' ||
    url.port !== '' ||
    url.hostname === '' ||
    isIpLiteral(url.hostname) ||
    loopbackHostnames.has(url.hostname) ||
    url.href.includes('\\')
  ) {
    return { ok: false, reason: 'invalid' }
  }

  if (!allowedImageHosts.has(url.hostname)) return { ok: false, reason: 'host_not_allowed' }
  return { ok: true, url }
}

export function parseRemoteTarget (value: string, allowedImageHosts: ReadonlySet<string>): URL {
  if (
    value !== value.trim() ||
    hasControlCharacters(value) ||
    value.includes('\\') ||
    value.includes('#') ||
    hasCredentialsInAuthority(value) ||
    hasInvalidPortSyntax(value) ||
    !/^https?:\/\//i.test(value)
  ) unsupportedImage()

  let url: URL
  try {
    url = new URL(value)
  } catch {
    unsupportedImage()
  }

  const target = validateRemoteTarget(url, allowedImageHosts)
  if (!target.ok) {
    if (target.reason === 'host_not_allowed' || target.reason === 'non_https') imageHostNotAllowed()
    unsupportedImage()
  }
  return target.url
}
