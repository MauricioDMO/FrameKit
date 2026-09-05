import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import type { FrameKitStudioBrand } from '@mauriciodmo/framekit/studio'
import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

import { template, templateAssets } from './valid-template'

const templateEntry = {
  slug: 'social/valid-template',
  segments: ['social', 'valid-template'],
  meta: template.meta,
  width: template.width,
  height: template.height,
  variants: template.variants,
  variantKeys: ['moon', 'fjord'],
  assets: templateAssets,
  load: async () => ({ default: template }),
} satisfies TemplateRegistryEntry

const templates = [templateEntry] satisfies readonly TemplateRegistryEntry[]
const brands = [{
  slug: 'example-brand',
  title: 'Example brand',
  segments: ['example-brand'],
  description: 'An example brand fixture.',
  load: async () => ({ default: () => null }),
}] satisfies readonly FrameKitStudioBrand[]

FrameKitStudio({ templates })
FrameKitStudio({ brands })
FrameKitStudio({ templates, brands })

// @ts-expect-error at least one manifest is required
FrameKitStudio({})
