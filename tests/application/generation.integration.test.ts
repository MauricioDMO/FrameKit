// @vitest-environment node

import { execFile } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { promisify } from 'node:util'

import { describe, expect, it } from 'vitest'

import { templateRegistry } from '@/.framekit/registry'
import { validateTemplateDefinition } from '@/lib/framekit'

const execFileAsync = promisify(execFile)
const generatorPath = fileURLToPath(new URL('../../scripts/generate-template-registry.mjs', import.meta.url))

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
      await mkdir(firstTemplate, { recursive: true })
      await mkdir(secondTemplate, { recursive: true })
      await writeFile(path.join(firstTemplate, 'template.tsx'), templateSource)
      await writeFile(path.join(secondTemplate, 'template.tsx'), templateSource)

      await execFileAsync(process.execPath, [generatorPath], { cwd: projectRoot })

      const framekitDir = path.join(projectRoot, 'src', '.framekit')
      const manifest = await readFile(path.join(framekitDir, 'manifest.ts'), 'utf8')
      const registry = await readFile(path.join(framekitDir, 'registry.ts'), 'utf8')

      expect(manifest).toBe(`/* Archivo generado automáticamente. No modificar. */

export const templateManifest: Array<{
  slug: string
  title: string
  segments: string[]
}> = [
  {
    slug: "branding/social/square",
    title: "Square",
    segments: ["branding","social","square"],
  },
  {
    slug: "product/launch",
    title: "Launch",
    segments: ["product","launch"],
  }
]
`)
      expect(registry).toBe(`/* Archivo generado automáticamente. No modificar. */
'use client'

import type { TemplateDefinition } from '@/lib/framekit'

export const templateRegistry: Record<string, () => Promise<{ default: TemplateDefinition }>> = {
  "branding/social/square": () => import("../templates/branding/social/square/template"),
  "product/launch": () => import("../templates/product/launch/template"),
}
`)

      const generated = await import(pathToFileURL(path.join(framekitDir, 'registry.ts')).href)
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
