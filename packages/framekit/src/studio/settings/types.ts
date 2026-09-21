import type { StudioUser } from '@/studio/types'
import type { FrameKitStudioMessages } from '@/studio/i18n/messages'

export type SettingsMessages = FrameKitStudioMessages['settings']
export type FeedbackTone = 'error' | 'success'
export type FeedbackState = { message: string, tone: FeedbackTone }

export interface StudioTokenMetadata {
  id: string
  name: string
  tokenPrefix: string
  createdAt: number
  lastUsedAt: number | null
  revokedAt: number | null
}

export interface CreatedStudioToken extends StudioTokenMetadata {
  token: string
}

export interface ManagedStudioUser extends StudioUser {
  active: boolean
  createdAt: number
  updatedAt: number
}
