import type { TemplateRegistryEntry } from '../types'

export interface StudioUser {
  id: string
  username: string
  role: 'admin' | 'user'
}

export type FrameKitStudioSection = 'editor' | 'brand' | 'settings'

export interface FrameKitStudioBrand {
  slug: string
  title: string
  segments: string[]
  description: string
  load: () => Promise<{ default: unknown }>
}

export type FrameKitStudioProps =
  | { templates: readonly TemplateRegistryEntry[], brands?: readonly FrameKitStudioBrand[], user?: StudioUser }
  | { templates?: readonly TemplateRegistryEntry[], brands: readonly FrameKitStudioBrand[], user?: StudioUser }
