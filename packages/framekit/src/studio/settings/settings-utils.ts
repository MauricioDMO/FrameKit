import type { FrameKitLocale } from '@/studio/i18n/messages'
import type { StudioUser } from '@/studio/types'
import { requestStudioJson, StudioApiError } from './api'
import type { ManagedStudioUser, StudioTokenMetadata, SettingsMessages } from './types'

export const inputClass = 'mt-2 min-h-10 w-full rounded-lg border border-fk-ivory-400 bg-fk-ivory-100 px-3 text-sm text-fk-forest-400 outline-none transition placeholder:text-fk-sage-400 focus:ring-2 focus:ring-fk-forest-300 dark:border-white/15 dark:bg-fk-forest-100 dark:text-fk-sage-100 dark:placeholder:text-fk-sage-300 dark:focus:ring-fk-mint-200'
export const selectClass = 'mt-2 min-h-10 w-full rounded-lg border border-fk-ivory-400 bg-fk-ivory-100 px-3 text-sm text-fk-forest-400 outline-none transition focus:ring-2 focus:ring-fk-forest-300 dark:border-white/15 dark:bg-fk-forest-100 dark:text-fk-sage-100 dark:focus:ring-fk-mint-200'
export const primaryButtonClass = 'inline-flex min-h-10 items-center justify-center rounded-lg bg-fk-forest-300 px-4 text-sm font-bold text-fk-ivory-100 transition hover:bg-fk-forest-400 focus:ring-2 focus:ring-fk-mint-300 focus:outline-none disabled:cursor-wait disabled:opacity-60'
export const secondaryButtonClass = 'inline-flex min-h-10 items-center justify-center rounded-lg border border-fk-forest-300 px-4 text-sm font-bold text-fk-forest-300 transition hover:bg-fk-ivory-300 focus:ring-2 focus:ring-fk-forest-300 focus:outline-none disabled:cursor-wait disabled:opacity-60 dark:border-fk-mint-200 dark:text-fk-mint-200 dark:hover:bg-white/10 dark:focus:ring-fk-mint-200'
export const dangerButtonClass = 'inline-flex min-h-10 items-center justify-center rounded-lg border border-red-700/25 px-4 text-sm font-bold text-red-800 transition hover:bg-red-50 focus:ring-2 focus:ring-red-700/40 focus:outline-none disabled:cursor-wait disabled:opacity-60 dark:border-red-200/30 dark:text-red-100 dark:hover:bg-red-950/30'

export function jsonRequest (method: 'PATCH' | 'POST', body: unknown): RequestInit {
  return {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body)
  }
}

export function errorMessage (error: unknown, messages: SettingsMessages['errors']): string {
  const status = error instanceof StudioApiError ? error.status : undefined
  if (status === 400) return messages.invalid
  if (status === 401) return messages.unauthorized
  if (status === 403) return messages.forbidden
  if (status === 404) return messages.notFound
  if (status === 409) return messages.conflict
  return status === undefined ? messages.network : messages.server
}

export function formatTimestamp (value: number | null, locale: FrameKitLocale, neverLabel: string): string {
  if (value === null) return neverLabel
  return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(value)
}

export function roleLabel (role: StudioUser['role'], messages: SettingsMessages['account'] | SettingsMessages['users']): string {
  return role === 'admin' ? messages.administratorRole : messages.userRole
}

export function readOwnTokens (): Promise<StudioTokenMetadata[]> {
  return requestStudioJson<StudioTokenMetadata[]>('/api/framekit/tokens', { method: 'GET' })
}

export function readUsers (): Promise<ManagedStudioUser[]> {
  return requestStudioJson<ManagedStudioUser[]>('/api/framekit/users', { method: 'GET' })
}
