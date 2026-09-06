import type { TemplateRegistryEntry } from '../types'

export interface FrameKitStudioBrand {
  slug: string
  title: string
  segments: string[]
  description: string
  load: () => Promise<{ default: unknown }>
}

export type FrameKitStudioProps =
  | { templates: readonly TemplateRegistryEntry[], brands?: readonly FrameKitStudioBrand[] }
  | { templates?: readonly TemplateRegistryEntry[], brands: readonly FrameKitStudioBrand[] }
