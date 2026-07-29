'use client'

import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { brands } from '@framekit/generated/brands'

export default function BrandPage() {
  return <FrameKitStudio brands={brands} />
}
