import { resolveTemplateData } from '@mauriciodmo/framekit'
import { FrameKitNavigation, SuccessToast, TemplateCanvas, toast } from '@mauriciodmo/framekit/editor'

import { template, templateAssets } from '../templates/valid-template'

const data = resolveTemplateData(template, 'moon', {}, templateAssets)

export const canvas = <TemplateCanvas definition={template} data={data} assets={templateAssets} variant="moon" />
export const navigationWithoutPathname = <FrameKitNavigation node={{ type: 'template', id: 'valid', slug: 'valid', title: 'Valid', href: '/editor/valid' }} />
export const customToast = toast(<SuccessToast message="Saved" />, { position: 'center-center' })
export const successToast = toast.success('Saved', { position: 'center-right', closeLabel: 'Close' })
