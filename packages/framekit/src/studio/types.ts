import type { StudioUser, TemplateRegistryEntry } from '@/types'

export type { StudioUser }

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
