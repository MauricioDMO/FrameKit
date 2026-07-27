// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { findTemplates } from '../discovery/find-templates'
import { writeTemplateModule } from './write-template-module'

const execFileAsync = promisify(execFile)
const tscCli = fileURLToPath(import.meta.resolve('typescript/bin/tsc'))
const validTemplateSource = `export default {
  width: 1080,
  height: 1080,
  fields: {},
  content: { en: { language: 'English' } },
  render: () => null,
}`

describe('findTemplates', () => {
  it('stops at a template and ignores its private auxiliary directories', async () => {
    const templatesRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-templates-'))

    try {
      const templateRoot = path.join(templatesRoot, 'social', 'campaign')
      await mkdir(path.join(templateRoot, 'components', 'private'), { recursive: true })
      await mkdir(path.join(templateRoot, 'helpers'), { recursive: true })
      await mkdir(path.join(templateRoot, 'assets'), { recursive: true })
      await writeFile(path.join(templateRoot, 'template.tsx'), '')
      await writeFile(path.join(templateRoot, 'definition.ts'), '')
      await writeFile(path.join(templateRoot, 'artwork.tsx'), '')
      await writeFile(path.join(templateRoot, 'components', 'private', 'template.tsx'), '')

      await expect(findTemplates(templatesRoot)).resolves.toEqual([
        {
          slug: 'social/campaign',
          title: 'Campaign',
          segments: ['social', 'campaign'],
          absolutePath: templateRoot,
        },
      ])
    } finally {
      await rm(templatesRoot, { recursive: true, force: true })
    }
  })

  it('ignores dot and underscore directories', async () => {
    const templatesRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-templates-'))

    try {
      await mkdir(path.join(templatesRoot, '.hidden', 'template'), { recursive: true })
      await mkdir(path.join(templatesRoot, '_private', 'template'), { recursive: true })
      await writeFile(path.join(templatesRoot, '.hidden', 'template', 'template.tsx'), '')
      await writeFile(path.join(templatesRoot, '_private', 'template', 'template.tsx'), '')

      await expect(findTemplates(templatesRoot)).resolves.toEqual([])
    } finally {
      await rm(templatesRoot, { recursive: true, force: true })
    }
  })

  it.each(['Uppercase', 'with_underscore', 'with space', 'conácento'])
    ('rejects invalid segment %j', async (segment) => {
      const templatesRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-templates-'))

      try {
        const templateRoot = path.join(templatesRoot, segment)
        await mkdir(templateRoot, { recursive: true })
        await writeFile(path.join(templateRoot, 'template.tsx'), '')

        await expect(findTemplates(templatesRoot)).rejects.toThrow(
          new RegExp(`Segmento inválido '${segment}'.*${templateRoot.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}`),
        )
      } finally {
        await rm(templatesRoot, { recursive: true, force: true })
      }
    })
})

describe('writeTemplateModule', () => {
  it('rejects a catalog without templates', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-empty-'))
    const templatesRoot = path.join(root, 'src', 'templates')

    try {
      await mkdir(templatesRoot, { recursive: true })

      await expect(writeTemplateModule({ projectRoot: root })).rejects.toThrow(
        `No se encontraron plantillas en: ${templatesRoot}`,
      )
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('generates sorted exact module output', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-registry-'))
    const templatesRoot = path.join(root, 'src', 'templates')
    const outputDirectory = path.join(root, 'src', 'generated', 'framekit')

    try {
      const firstTemplate = path.join(templatesRoot, 'social', 'campaign')
      const secondTemplate = path.join(templatesRoot, 'marketing', 'email', 'launch')
      await mkdir(path.join(firstTemplate, 'helpers'), { recursive: true })
      await mkdir(path.join(firstTemplate, 'assets', 'common'), { recursive: true })
      await mkdir(path.join(templatesRoot, 'empty', 'category'), { recursive: true })
      await mkdir(secondTemplate, { recursive: true })
      await writeFile(path.join(firstTemplate, 'template.tsx'), validTemplateSource)
      await writeFile(path.join(firstTemplate, 'helpers', 'template.tsx'), '')
      await writeFile(path.join(firstTemplate, 'assets', 'common', 'logo.svg'), '<svg />')
      await writeFile(path.join(secondTemplate, 'template.tsx'), validTemplateSource)

      await expect(writeTemplateModule({ projectRoot: root })).resolves.toEqual([
        {
          slug: 'marketing/email/launch',
          title: 'Launch',
          segments: ['marketing', 'email', 'launch'],
          absolutePath: secondTemplate,
        },
        {
          slug: 'social/campaign',
          title: 'Campaign',
          segments: ['social', 'campaign'],
          absolutePath: firstTemplate,
        },
      ])

      await expect(readFile(path.join(outputDirectory, 'templates.ts'), 'utf8')).resolves.toBe(`/* Archivo generado automáticamente. No modificar. */

import type { TemplateAssetManifest, TemplateDefinition } from '@mauriciodmo/framekit'

type TemplateLoader = () => Promise<{
  default: TemplateDefinition
}>

export const templates: Array<{
  slug: string
  title: string
  segments: string[]
  assets: TemplateAssetManifest
  load: TemplateLoader
}> = [
  {
    slug: "marketing/email/launch",
    title: "Launch",
    segments: ["marketing","email","launch"],
    assets: {"common":{},"variants":{}},
    load: () => import("../../templates/marketing/email/launch/template"),
  },
  {
    slug: "social/campaign",
    title: "Campaign",
    segments: ["social","campaign"],
    assets: {"common":{"logo":"/__framekit/templates/social/campaign/common/logo.svg"},"variants":{}},
    load: () => import("../../templates/social/campaign/template"),
  }
]

export const templateManifest = templates.map(
  ({ load: _, assets: __, ...metadata }) => metadata,
)

export const templateRegistry: Record<string, TemplateLoader> =
  Object.fromEntries(templates.map(({ slug, load }) => [slug, load]))
`)
      await expect(readFile(path.join(root, 'public', '__framekit', 'templates', 'social', 'campaign', 'common', 'logo.svg'), 'utf8')).resolves.toBe('<svg />')

      const framekitPackage = path.join(root, 'node_modules', '@mauriciodmo', 'framekit')
      await mkdir(framekitPackage, { recursive: true })
      await writeFile(path.join(framekitPackage, 'package.json'), JSON.stringify({
        name: '@mauriciodmo/framekit',
        type: 'module',
        exports: {
          '.': { types: './index.d.ts' },
          './studio': { types: './studio.d.ts' },
        },
      }))
      await writeFile(path.join(framekitPackage, 'index.d.ts'), `
export interface TemplateAssetManifest {
  common: Record<string, string>
  variants: Record<string, Record<string, string>>
}

export interface TemplateDefinition {
  width: number
  height: number
  fields: Record<string, unknown>
  content: Record<string, { language: string }>
  render: (props: unknown) => unknown
}
`)
      await writeFile(path.join(framekitPackage, 'studio.d.ts'), `
import type { TemplateAssetManifest, TemplateDefinition } from '@mauriciodmo/framekit'

export interface FrameKitStudioTemplate {
  slug: string
  title: string
  segments: string[]
  assets?: TemplateAssetManifest
  load: () => Promise<{ default: TemplateDefinition }>
}

export declare function FrameKitStudio(props: {
  templates: readonly FrameKitStudioTemplate[]
}): unknown
`)
      await writeFile(path.join(root, 'src', 'consumer.ts'), `
import { FrameKitStudio } from '@mauriciodmo/framekit/studio'
import { templates } from './generated/framekit/templates'

FrameKitStudio({ templates })
`)
      await writeFile(path.join(root, 'tsconfig.json'), JSON.stringify({
        compilerOptions: {
          strict: true,
          noEmit: true,
          module: 'esnext',
          moduleResolution: 'bundler',
          target: 'es2022',
          jsx: 'react-jsx',
          skipLibCheck: true,
        },
        include: ['src/**/*.ts', 'src/**/*.tsx'],
      }))

      await expect(execFileAsync(process.execPath, [tscCli, '--project', path.join(root, 'tsconfig.json')])).resolves.toBeDefined()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
