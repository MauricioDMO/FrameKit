import type { ReactNode, Ref } from 'react'

import type { InferTemplateData, TemplateAssetManifest, TemplateBase, TemplateRenderProps } from '@/types'

interface TemplateCanvasProps<Definition extends TemplateBase> {
  definition: Definition & {
    render(props: TemplateRenderProps<Definition>): ReactNode
  }
  data: InferTemplateData<Definition>
  assets: TemplateAssetManifest
  variant: keyof Definition['content'] & string
  canvasRef?: Ref<HTMLDivElement>
}

export function TemplateCanvas<Definition extends TemplateBase> ({ definition, data, assets, variant, canvasRef }: TemplateCanvasProps<Definition>) {
  return (
    <div ref={canvasRef} data-framekit-render-root style={{ width: definition.width, height: definition.height }}>
      {definition.render({ data, assets, variant, width: definition.width, height: definition.height })}
    </div>
  )
}
