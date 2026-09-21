import { isIP } from 'node:net'

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

const invalidConfigurationMessage = 'Image rendering API configuration is invalid'
const hostnamePattern = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)(?:\.(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?))*$/

function configurationFailure (message = invalidConfigurationMessage): never {
  throw new ImageRenderError({ code: 'api_not_configured', message })
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

export function parseImageRenderConfig (env: NodeJS.ProcessEnv): ImageRenderRuntimeConfig {
  const port = parsePositiveInteger(env.PORT, 3000, 65535)

  return {
    internalOrigin: new URL(`http://localhost:${port}`),
    allowedImageHosts: parseAllowedImageHosts(env.FRAMEKIT_ALLOWED_IMAGE_HOSTS),
    maxConcurrentRenders: parsePositiveInteger(env.FRAMEKIT_MAX_CONCURRENT_RENDERS, 2, 32),
    renderTimeoutMs: parsePositiveInteger(env.FRAMEKIT_RENDER_TIMEOUT_MS, 30_000, 120_000)
  }
}
