import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import type { FrameKitStudioBrand } from '@mauriciodmo/framekit/studio'
import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

const templates = [] as readonly TemplateRegistryEntry[]
const brands = [] as readonly FrameKitStudioBrand[]

FrameKitStudio({ templates })
FrameKitStudio({ brands })
FrameKitStudio({ templates, brands })

// @ts-expect-error at least one manifest is required
FrameKitStudio({})
