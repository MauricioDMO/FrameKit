import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import type { FrameKitStudioBrand, FrameKitStudioTemplate } from '@mauriciodmo/framekit/studio'

const templates = [] as readonly FrameKitStudioTemplate[]
const brands = [] as readonly FrameKitStudioBrand[]

FrameKitStudio({ templates })
FrameKitStudio({ brands })
FrameKitStudio({ templates, brands })

// @ts-expect-error at least one manifest is required
FrameKitStudio({})
