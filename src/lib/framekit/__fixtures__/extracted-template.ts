import { defineTemplate } from '@/lib/framekit'

import { ExtractedArtwork } from './extracted-artwork'
import { templateBase } from './extracted-definition'

export const extractedTemplate = defineTemplate({
  ...templateBase,
  render: ExtractedArtwork,
})
