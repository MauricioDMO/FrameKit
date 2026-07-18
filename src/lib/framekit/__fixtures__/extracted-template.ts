import { defineTemplate } from '@/lib/framekit'
import type { TemplateDefinition } from '@/lib/framekit'

import { ExtractedArtwork } from './extracted-artwork'
import { templateBase } from './extracted-definition'

export const extractedTemplate: TemplateDefinition = defineTemplate({
  ...templateBase,
  render: ExtractedArtwork,
})
