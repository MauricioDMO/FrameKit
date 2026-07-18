import type { TemplateRenderProps } from '@mauriciodmo/framekit'

import type { templateBase } from './extracted-definition'

export type ExtractedArtworkProps = TemplateRenderProps<typeof templateBase>

export function ExtractedArtwork({ data, locale, width, height }: ExtractedArtworkProps) {
  const title: string = data.title
  const localeKey: 'aurora' | 'desert' = locale

  void title
  void localeKey
  return <article style={{ width, height }} />
}
