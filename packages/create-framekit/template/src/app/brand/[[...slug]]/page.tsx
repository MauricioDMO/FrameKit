'use client'

import { brands } from '@framekit/generated/brands'
import { templates } from '@framekit/generated/templates'
import { FrameKitStudio } from '@mauriciodmo/framekit/studio'

export default function BrandPage() {
  return <FrameKitStudio templates={templates} brands={brands} />
}
