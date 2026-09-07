import { isIP } from 'node:net'

import type { TemplateAssetManifest } from '../types'
import { ImageRenderError } from './errors'

export interface ImageRenderRequest {
  template: string
  variant?: string
  data?: Record<string, unknown>
}

export interface ImageRenderRuntimeConfig {
  internalOrigin: URL
  allowedImageHosts: ReadonlySet<string>
  maxConcurrentRenders: number
  renderTimeoutMs: number
}

export interface ImageApiConfig {
  apiKey: string
  render: ImageRenderRuntimeConfig
}

export interface ResolvedRenderPayload {
  template: string
  variant: string
  data: Record<string, string | number | boolean>
  assets: TemplateAssetManifest
  width: number
  height: number
}

const missingConfigurationMessage = 'Image rendering API is not configured'
const invalidConfigurationMessage = 'Image rendering API configuration is invalid'
const loopbackHosts = new Set(['127.0.0.1', '[::1]', 'localhost'])
const hostnamePattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/

function configurationFailure (message = invalidConfigurationMessage): never {
  throw new ImageRenderError({ code: 'api_not_configured', message })
}

function rawOriginHost (value: string): string | undefined {
  const schemeSeparator = value.indexOf('://')
  if (schemeSeparator === -1) return undefined

  const remainder = value.slice(schemeSeparator + 3)
  const end = remainder.search(/[/?#]/)
  const authority = end === -1 ? remainder : remainder.slice(0, end)
  if (authority.includes('@')) return undefined

  if (authority.startsWith('[')) {
    const closingBracket = authority.indexOf(']')
    if (closingBracket === -1) return undefined
    const port = authority.slice(closingBracket + 1)
    if (port !== '' && !/^:\d+$/.test(port)) return undefined
    return authority.slice(0, closingBracket + 1).toLowerCase()
  }

  const portSeparator = authority.indexOf(':')
  if (portSeparator === -1) return authority.toLowerCase()
  if (!/^\d+$/.test(authority.slice(portSeparator + 1))) return undefined
  return authority.slice(0, portSeparator).toLowerCase()
}

function rawOriginPath (value: string): string {
  const schemeSeparator = value.indexOf('://')
  if (schemeSeparator === -1) return ''

  const remainder = value.slice(schemeSeparator + 3)
  const pathStart = remainder.indexOf('/')
  if (pathStart === -1) return ''

  const pathAndSuffix = remainder.slice(pathStart)
  const end = pathAndSuffix.search(/[?#]/)
  return end === -1 ? pathAndSuffix : pathAndSuffix.slice(0, end)
}

function parseInternalOrigin (value: string | undefined): URL {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim() || !/^http:\/\//i.test(value)) {
    return configurationFailure(missingConfigurationMessage)
  }

  let origin: URL
  try {
    origin = new URL(value)
  } catch {
    return configurationFailure(missingConfigurationMessage)
  }

  const path = rawOriginPath(value)
  if (
    origin.protocol !== 'http:' ||
    !loopbackHosts.has(origin.hostname) ||
    rawOriginHost(value) !== origin.hostname ||
    origin.username !== '' ||
    origin.password !== '' ||
    value.includes('?') ||
    value.includes('#') ||
    (path !== '' && path !== '/') ||
    origin.pathname !== '/' ||
    origin.search !== '' ||
    origin.hash !== ''
  ) {
    return configurationFailure(missingConfigurationMessage)
  }

  return origin
}

function isIpLiteral (value: string): boolean {
  if (isIP(value) !== 0) return true

  if (value.startsWith('[') && value.endsWith(']') && isIP(value.slice(1, -1)) !== 0) return true

  try {
    const normalized = new URL(`https://${value}`).hostname
    const normalizedIp = normalized.startsWith('[') && normalized.endsWith(']')
      ? normalized.slice(1, -1)
      : normalized
    return normalized !== value && isIP(normalizedIp) !== 0
  } catch {
    return false
  }
}

function parseAllowedImageHosts (value: string | undefined): ReadonlySet<string> {
  if (value === undefined || value === '') return new Set()
  if (typeof value !== 'string') return configurationFailure()

  const hosts = new Set<string>()
  for (const entry of value.split(',')) {
    const hostname = entry.trim().toLowerCase()
    if (hostname === '') continue
    if (hostname.length > 253 || isIpLiteral(hostname) || !hostnamePattern.test(hostname)) {
      return configurationFailure()
    }
    hosts.add(hostname)
  }
  return hosts
}

function parsePositiveInteger (value: string | undefined, fallback: number, maximum: number): number {
  if (value === undefined) return fallback
  if (typeof value !== 'string' || !/^[0-9]+$/.test(value)) return configurationFailure()

  const parsed = Number(value)
  if (!Number.isSafeInteger(parsed) || parsed < 1 || parsed > maximum) return configurationFailure()
  return parsed
}

export function parseImageApiConfig (env: NodeJS.ProcessEnv): ImageApiConfig {
  const apiKey = env.FRAMEKIT_API_KEY
  if (typeof apiKey !== 'string' || apiKey.length === 0) configurationFailure(missingConfigurationMessage)

  return {
    apiKey,
    render: {
      internalOrigin: parseInternalOrigin(env.FRAMEKIT_INTERNAL_ORIGIN),
      allowedImageHosts: parseAllowedImageHosts(env.FRAMEKIT_ALLOWED_IMAGE_HOSTS),
      maxConcurrentRenders: parsePositiveInteger(env.FRAMEKIT_MAX_CONCURRENT_RENDERS, 2, 32),
      renderTimeoutMs: parsePositiveInteger(env.FRAMEKIT_RENDER_TIMEOUT_MS, 30_000, 120_000)
    }
  }
}
