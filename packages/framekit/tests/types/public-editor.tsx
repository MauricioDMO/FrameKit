import { resolveTemplateData } from '@mauriciodmo/framekit'
import { TemplateCanvas } from '@mauriciodmo/framekit/editor'

import { template, templateAssets } from './valid-template'

const data = resolveTemplateData(template, 'moon', {}, templateAssets)

export const canvas = <TemplateCanvas definition={template} data={data} assets={templateAssets} variant="moon" />
