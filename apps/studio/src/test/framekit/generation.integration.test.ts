// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

import { templateRegistry } from '@framekit/generated/templates'
import { validateTemplateDefinition } from '@mauriciodmo/framekit'
import { writeTemplateModule } from '@mauriciodmo/framekit/dev'

const templateSource = `export default {
  width: 120,
  height: 80,
  fields: {},
  content: { en: { language: 'English' } },
  render() { return null },
}
`

describe('template generation integration', () => {
  it('loads the pilot template through the generated loader', async () => {
    const loader = templateRegistry['redes-sociales/instagram/promocion-cuadrada']
    expect(loader).toBeTypeOf('function')

    const loaded = await loader()
    expect(validateTemplateDefinition(loaded.default).success).toBe(true)
  })

  it('generates a clean Studio registry and loads its template defaults', async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-studio-'))

    try {
      const templatesRoot = path.join(projectRoot, 'src', 'templates')
      const firstTemplate = path.join(templatesRoot, 'branding', 'social', 'square')
      const secondTemplate = path.join(templatesRoot, 'product', 'launch')
      const outputDirectory = path.join(projectRoot, '.framekit', 'generated')
      await mkdir(firstTemplate, { recursive: true })
      await mkdir(secondTemplate, { recursive: true })
      await writeFile(path.join(firstTemplate, 'template.tsx'), templateSource)
      await writeFile(path.join(secondTemplate, 'template.tsx'), templateSource)

      await writeTemplateModule({ projectRoot })

      const generated = await import(pathToFileURL(path.join(outputDirectory, 'templates.ts')).href)

      expect(await readFile(path.join(outputDirectory, 'templates.ts'), 'utf8')).toBe(`/* Archivo generado automáticamente. No modificar. */

import type { TemplateDefinition } from '@mauriciodmo/framekit'

type TemplateLoader = () => Promise<{
  default: TemplateDefinition
}>

export const templates = [
  {
    slug: "branding/social/square",
    title: "Square",
    segments: ["branding","social","square"],
    load: () => import("../../src/templates/branding/social/square/template"),
  },
  {
    slug: "product/launch",
    title: "Launch",
    segments: ["product","launch"],
    load: () => import("../../src/templates/product/launch/template"),
  }
] satisfies Array<{
  slug: string
  title: string
  segments: string[]
  load: TemplateLoader
}>

export const templateManifest = templates.map(
  ({ load: _, ...metadata }) => metadata,
)

export const templateRegistry: Record<string, TemplateLoader> =
  Object.fromEntries(templates.map(({ slug, load }) => [slug, load]))
`)

      for (const slug of ['branding/social/square', 'product/launch']) {
        const loaded = await generated.templateRegistry[slug]()
        const validation = validateTemplateDefinition(loaded.default)
        expect(validation.success, slug).toBe(true)
      }
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  })
})
