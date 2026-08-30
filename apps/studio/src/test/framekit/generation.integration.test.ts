// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

import { templates } from '@framekit/generated/templates'
import { validateTemplateDefinition } from '@mauriciodmo/framekit'
import { writeTemplateModule } from '@mauriciodmo/framekit/dev'

const templateSource = `export default {
  meta: {
    title: 'Generated template',
    description: 'A functional description',
    marketingDescription: 'A marketing description',
    tags: ['generated', 'test'],
  },
  width: 120,
  height: 80,
  fields: {},
  content: { moon: {}, fjord: {} },
  variants: { default: 'moon', labels: { moon: 'Lunar', fjord: 'Fjordic' } },
  render() { return null },
}
`

async function addFrameKitStub(projectRoot: string): Promise<void> {
  const packageRoot = path.join(projectRoot, 'node_modules', '@mauriciodmo', 'framekit')
  await mkdir(packageRoot, { recursive: true })
  await writeFile(path.join(packageRoot, 'package.json'), JSON.stringify({
    name: '@mauriciodmo/framekit',
    type: 'module',
    exports: './index.js',
  }))
  await writeFile(path.join(packageRoot, 'index.js'), `
export function validateTemplateDefinition(definition) {
  return { success: true, definition }
}
`)
}

describe('template generation integration', () => {
  it('loads the pilot template through the generated loader', async () => {
    const entry = templates.find((template) => template.slug === 'redes-sociales/instagram/promocion-cuadrada')
    expect(entry).toBeDefined()
    expect(entry).not.toHaveProperty('title')
    expect(entry?.meta.title).toBe('Promoción cuadrada')
    expect(entry?.variantKeys).toEqual(['es', 'en'])

    const loaded = await entry!.load()
    expect(validateTemplateDefinition(loaded.default).success).toBe(true)
  })

  it('generates a clean Studio registry and loads its template defaults', async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-studio-'))

    try {
      const templatesRoot = path.join(projectRoot, 'src', 'templates')
      const firstTemplate = path.join(templatesRoot, 'branding', 'social', 'square')
      const secondTemplate = path.join(templatesRoot, 'product', 'launch')
      const outputDirectory = path.join(projectRoot, 'src', 'generated', 'framekit')
      await mkdir(firstTemplate, { recursive: true })
      await mkdir(secondTemplate, { recursive: true })
      await writeFile(path.join(firstTemplate, 'template.tsx'), templateSource)
      await writeFile(path.join(secondTemplate, 'template.tsx'), templateSource)
      await addFrameKitStub(projectRoot)

      await writeTemplateModule({ projectRoot })

      const generated = await import(pathToFileURL(path.join(outputDirectory, 'templates.ts')).href)

      expect(await readFile(path.join(outputDirectory, 'templates.ts'), 'utf8')).toBe(`/* Archivo generado automáticamente. No modificar. */

import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

export const templates: TemplateRegistryEntry[] = [
  {
    slug: "branding/social/square",
    segments: ["branding","social","square"],
    meta: {"title":"Generated template","description":"A functional description","marketingDescription":"A marketing description","tags":["generated","test"]},
    width: 120,
    height: 80,
    variants: {"default":"moon","labels":{"moon":"Lunar","fjord":"Fjordic"}},
    variantKeys: ["moon","fjord"],
    assets: {"common":{},"variants":{}},
    load: () => import("../../templates/branding/social/square/template"),
  },
  {
    slug: "product/launch",
    segments: ["product","launch"],
    meta: {"title":"Generated template","description":"A functional description","marketingDescription":"A marketing description","tags":["generated","test"]},
    width: 120,
    height: 80,
    variants: {"default":"moon","labels":{"moon":"Lunar","fjord":"Fjordic"}},
    variantKeys: ["moon","fjord"],
    assets: {"common":{},"variants":{}},
    load: () => import("../../templates/product/launch/template"),
  }
]
`)

      for (const slug of ['branding/social/square', 'product/launch']) {
        const entry = generated.templates.find((template: { slug: string }) => template.slug === slug)
        expect(entry).toBeDefined()
        const loaded = await entry!.load()
        const validation = validateTemplateDefinition(loaded.default)
        expect(validation.success, slug).toBe(true)
      }
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  })
})
