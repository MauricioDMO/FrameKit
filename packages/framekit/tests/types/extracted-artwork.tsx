import type { TemplateRenderProps } from '@mauriciodmo/framekit'

import type { templateBase } from './extracted-definition'

export type ExtractedArtworkProps = TemplateRenderProps<typeof templateBase>

export function ExtractedArtwork({ data, variant, width, height }: ExtractedArtworkProps) {
  const title: string = data.title
  const variantKey: 'aurora' | 'desert' = variant

  void title
  void variantKey
  return <article style={{ width, height }} />
}
