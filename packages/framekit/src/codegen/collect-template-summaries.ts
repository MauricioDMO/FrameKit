import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { promisify } from 'node:util'

import type { DiscoveredTemplate } from '../discovery/types'
import type { TemplateMeta, TemplateRegistryEntry, TemplateVariants } from '../types'

const execFileAsync = promisify(execFile)
const require = createRequire(import.meta.url)

export type TemplateSummary = Pick<TemplateRegistryEntry, 'meta' | 'width' | 'height' | 'variants' | 'variantKeys'>

function importPathForTemplate(template: DiscoveredTemplate, scriptDirectory: string): string {
  const relativePath = path.relative(scriptDirectory, path.join(template.absolutePath, 'template.tsx')).split(path.sep).join('/')
  return relativePath.startsWith('.') ? relativePath : `./${relativePath}`
}

function createSummarySource(
  templates: readonly DiscoveredTemplate[],
  scriptFile: string,
  summaryFile: string,
): string {
  const imports = templates.map((template, index) => {
    const sourcePath = path.join(template.absolutePath, 'template.tsx')
    const specifier = importPathForTemplate(template, path.dirname(scriptFile))
    return `const template${index} = await loadTemplate(${JSON.stringify(sourcePath)}, ${JSON.stringify(specifier)})`
  })
  const entries = templates.map((template, index) => `  { slug: ${JSON.stringify(template.slug)}, path: ${JSON.stringify(path.join(template.absolutePath, 'template.tsx'))}, definition: template${index} },`).join('\n')

  return `import { writeFile } from 'node:fs/promises'
import { validateTemplateDefinition } from '@mauriciodmo/framekit'

async function loadTemplate(templatePath, specifier) {
  try {
    return (await import(specifier)).default
  } catch (error) {
    throw new Error(\`${'${templatePath}'}: ${'${error instanceof Error ? error.message : String(error)}'}\`)
  }
}

${imports.join('\n')}

const templates = [
${entries}
]

const summaries = templates.map(({ slug, path: templatePath, definition }) => {
  const result = validateTemplateDefinition(definition)
  if (!result.success) throw new Error(\`${'${templatePath}'}: ${'${result.error}'}\`)

  const { meta, width, height, variants, content } = result.definition
  return {
    slug,
    meta: {
      title: meta.title,
      ...(meta.description === undefined ? {} : { description: meta.description }),
      ...(meta.marketingDescription === undefined ? {} : { marketingDescription: meta.marketingDescription }),
      ...(meta.tags === undefined ? {} : { tags: meta.tags }),
    },
    width,
    height,
    variants: {
      default: variants.default,
      ...(variants.labels === undefined ? {} : { labels: variants.labels }),
    },
    variantKeys: Object.keys(content),
  }
})

await writeFile(${JSON.stringify(summaryFile)}, JSON.stringify(summaries), 'utf8')
`
}

function normalizeSummary(value: unknown): TemplateSummary {
  if (!value || typeof value !== 'object') throw new Error('El resumen generado no es válido')
  const summary = value as Partial<TemplateSummary>
  if (!summary.meta || typeof summary.meta !== 'object' || typeof summary.width !== 'number' || typeof summary.height !== 'number' || !summary.variants || typeof summary.variants !== 'object' || !Array.isArray(summary.variantKeys)) {
    throw new Error('El resumen generado no es válido')
  }
  return {
    meta: summary.meta as TemplateMeta,
    width: summary.width,
    height: summary.height,
    variants: summary.variants as TemplateVariants,
    variantKeys: summary.variantKeys as string[],
  }
}

export async function collectTemplateSummaries(
  projectRoot: string,
  templates: readonly DiscoveredTemplate[],
): Promise<Readonly<Record<string, TemplateSummary>>> {
  const framekitDirectory = path.join(projectRoot, '.framekit')
  await mkdir(framekitDirectory, { recursive: true })
  const temporaryDirectory = await mkdtemp(path.join(framekitDirectory, 'summary-'))
  const scriptFile = path.join(temporaryDirectory, 'templates.mts')
  const summaryFile = path.join(temporaryDirectory, 'summaries.json')

  try {
    await writeFile(scriptFile, createSummarySource(templates, scriptFile, summaryFile), 'utf8')

    try {
      await execFileAsync(process.execPath, [require.resolve('tsx/cli'), scriptFile], {
        cwd: projectRoot,
        maxBuffer: 10 * 1024 * 1024,
      })
    } catch (error) {
      const stderr = error && typeof error === 'object' && 'stderr' in error ? String(error.stderr) : ''
      throw new Error(stderr.trim() || String(error))
    }

    const summaries = JSON.parse(await readFile(summaryFile, 'utf8')) as unknown
    if (!Array.isArray(summaries) || summaries.length !== templates.length) {
      throw new Error('El resumen generado no es válido')
    }

    const summariesBySlug: Record<string, TemplateSummary> = {}
    for (const [index, value] of summaries.entries()) {
      const template = templates[index]
      if (!template || !value || typeof value !== 'object' || (value as { slug?: unknown }).slug !== template.slug) {
        throw new Error('El resumen generado no es válido')
      }
      summariesBySlug[template.slug] = normalizeSummary(value)
    }
    return summariesBySlug
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true })
  }
}
