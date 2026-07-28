'use client'

import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { brands } from '@framekit/generated/brands'
import { templates } from '@framekit/generated/templates'

export default function EditorPage() {
  return <FrameKitStudio templates={templates} brands={brands} />
}
