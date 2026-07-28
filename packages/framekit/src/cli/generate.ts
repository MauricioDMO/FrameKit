import { writeTemplateModule } from '../codegen/write-template-module'
import type { DiscoveredTemplate } from '../discovery/types'

export async function generate(projectRoot: string): Promise<DiscoveredTemplate[]> {
  const templates = await writeTemplateModule({ projectRoot })
  console.log(`FrameKit: ${templates.length} template${templates.length === 1 ? '' : 's'}`)
  return templates
}
