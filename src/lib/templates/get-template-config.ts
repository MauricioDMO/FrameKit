import 'server-only'

import { templateConfigRegistry } from '@/generated/template-config-registry'
import type { TemplateConfig } from '@/lib/templates/types'

const VALID_SEGMENT = /^[a-z0-9-]+$/

export async function getTemplateConfig(
  segments: string[],
): Promise<TemplateConfig | null> {
  if (
    segments.length === 0 ||
    segments.some((segment) => !VALID_SEGMENT.test(segment))
  ) {
    return null
  }

  return templateConfigRegistry[segments.join('/')] ?? null
}
