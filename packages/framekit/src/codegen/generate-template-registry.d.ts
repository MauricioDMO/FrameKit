export interface TemplateRecord {
  slug: string
  segments: string[]
}

export interface GenerateRegistryOptions {
  templatesRoot?: string
  framekitDir?: string
}

export function findTemplates(
  absoluteDirectory: string,
  segments?: string[],
): Promise<TemplateRecord[]>

export function generateRegistry(
  options?: GenerateRegistryOptions,
): Promise<TemplateRecord[]>
