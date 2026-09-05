import type { TemplateRenderProps } from '@mauriciodmo/framekit'

import type { templateBase } from './extracted-definition'

export type ExtractedArtworkProps = TemplateRenderProps<typeof templateBase>

export function ExtractedArtwork({ data, assets, variant, width, height }: ExtractedArtworkProps) {
  const title: string = data.title
  const alignment: 'left' | 'center' | 'right' = data.alignment
  const logo: string = assets.common.logo
  const background: string = assets.variants[variant].background
  const variantKey: 'aurora' | 'desert' = variant

  return <article style={{ width, height }} data-alignment={alignment} data-background={background} data-logo={logo} data-variant={variantKey}>{title}</article>
}
