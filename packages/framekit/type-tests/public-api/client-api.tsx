import { createRenderClient } from '@mauriciodmo/framekit/client'
import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'
import type { ResolvedRenderPayload } from '@mauriciodmo/framekit/server'

import { template, templateAssets } from './valid-template'

const templateEntry = {
  slug: 'social/valid-template',
  segments: ['social', 'valid-template'],
  meta: template.meta,
  width: template.width,
  height: template.height,
  variants: template.variants,
  variantKeys: ['moon', 'fjord'],
  assets: templateAssets,
  load: async () => ({ default: template })
} satisfies TemplateRegistryEntry

const RenderClient = createRenderClient([templateEntry])
const payload = {
  template: templateEntry.slug,
  variant: 'moon',
  data: { title: 'Launch', accentColor: '#173d31', image: '/images/moon.png', alignment: 'center', count: 15, showLogo: true },
  assets: templateAssets,
  width: template.width,
  height: template.height
} satisfies ResolvedRenderPayload

type RenderClientProps = Parameters<typeof RenderClient>[0]
const props = { payload } satisfies RenderClientProps

export const rendered = <RenderClient {...props} />
