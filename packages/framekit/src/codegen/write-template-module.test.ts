// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
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
  meta: {
    title: 'Generated template',
    description: 'A functional description',
    marketingDescription: 'A marketing description',
    tags: ['generated', 'test'],
  },
  width: 1080,
  height: 1080,
  fields: {},
  content: { moon: {}, fjord: {} },
  variants: { default: 'moon', labels: { moon: 'Lunar', fjord: 'Fjordic' } },
  render: () => null,
}`

async function addFrameKitStub(root: string, source = `
export function validateTemplateDefinition(definition) {
  return { success: true, definition }
}
`): Promise<void> {
  const framekitPackage = path.join(root, 'node_modules', '@mauriciodmo', 'framekit')
  await mkdir(framekitPackage, { recursive: true })
  await writeFile(path.join(framekitPackage, 'package.json'), JSON.stringify({
    name: '@mauriciodmo/framekit',
    type: 'module',
    exports: './index.js',
  }))
  await writeFile(path.join(framekitPackage, 'index.js'), source)
}

function normalizePathSeparators(value: string): string {
  return value.replaceAll('\\', '/')
}

async function expectErrorWithPortablePath(
  operation: () => Promise<unknown>,
  expectedMessage: string,
): Promise<void> {
  const error = await operation().catch((cause: unknown) => cause)
  expect(error).toBeInstanceOf(Error)
  expect(normalizePathSeparators((error as Error).message)).toContain(
    normalizePathSeparators(expectedMessage),
  )
}

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

        await expectErrorWithPortablePath(
          () => findTemplates(templatesRoot),
          `Segmento inválido '${segment}' en ruta física: ${templateRoot}`,
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
      await mkdir(path.join(firstTemplate, 'assets', 'fjord'), { recursive: true })
      await mkdir(path.join(templatesRoot, 'empty', 'category'), { recursive: true })
      await mkdir(secondTemplate, { recursive: true })
      await writeFile(path.join(firstTemplate, 'template.tsx'), validTemplateSource)
      await writeFile(path.join(firstTemplate, 'helpers', 'template.tsx'), '')
      await writeFile(path.join(firstTemplate, 'assets', 'common', 'logo.svg'), '<svg />')
      await writeFile(path.join(firstTemplate, 'assets', 'fjord', 'card.png'), 'png')
      await writeFile(path.join(secondTemplate, 'template.tsx'), validTemplateSource)

      await addFrameKitStub(root)

      await expect(writeTemplateModule({ projectRoot: root })).resolves.toEqual([
        {
          slug: 'marketing/email/launch',
          segments: ['marketing', 'email', 'launch'],
          absolutePath: secondTemplate,
        },
        {
          slug: 'social/campaign',
          segments: ['social', 'campaign'],
          absolutePath: firstTemplate,
        },
      ])

      await expect(readFile(path.join(outputDirectory, 'templates.ts'), 'utf8')).resolves.toBe(`/* Archivo generado automáticamente. No modificar. */

import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

export const templates: TemplateRegistryEntry[] = [
  {
    slug: "marketing/email/launch",
    segments: ["marketing","email","launch"],
    meta: {"title":"Generated template","description":"A functional description","marketingDescription":"A marketing description","tags":["generated","test"]},
    width: 1080,
    height: 1080,
    variants: {"default":"moon","labels":{"moon":"Lunar","fjord":"Fjordic"}},
    variantKeys: ["moon","fjord"],
    assets: {"common":{},"variants":{}},
    load: () => import("../../templates/marketing/email/launch/template"),
  },
  {
    slug: "social/campaign",
    segments: ["social","campaign"],
    meta: {"title":"Generated template","description":"A functional description","marketingDescription":"A marketing description","tags":["generated","test"]},
    width: 1080,
    height: 1080,
    variants: {"default":"moon","labels":{"moon":"Lunar","fjord":"Fjordic"}},
    variantKeys: ["moon","fjord"],
    assets: {"common":{"logo":"/__framekit/templates/social/campaign/common/logo.svg"},"variants":{"fjord":{"card":"/__framekit/templates/social/campaign/fjord/card.png"}}},
    load: () => import("../../templates/social/campaign/template"),
  }
]
`)
      await expect(readFile(path.join(root, 'public', '__framekit', 'templates', 'social', 'campaign', 'common', 'logo.svg'), 'utf8')).resolves.toBe('<svg />')
      await expect(readFile(path.join(root, 'public', '__framekit', 'templates', 'social', 'campaign', 'fjord', 'card.png'), 'utf8')).resolves.toBe('png')

      const generatedFile = path.join(outputDirectory, 'templates.ts')
      const generatedStat = await stat(generatedFile)
      await writeFile(path.join(firstTemplate, 'helpers', 'template.tsx'), 'export const changed = true')
      await writeTemplateModule({ projectRoot: root })
      expect((await stat(generatedFile)).mtimeMs).toBe(generatedStat.mtimeMs)

      const generatedSource = await readFile(generatedFile, 'utf8')
      expect(generatedSource).not.toContain('templateManifest')
      expect(generatedSource).not.toContain('templateRegistry')
      expect(generatedSource).not.toContain('fields:')
      expect(generatedSource).not.toContain('content:')
      expect(generatedSource).not.toContain('render:')

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
export interface TemplateDefinition {
  meta: Record<string, unknown>
  width: number
  height: number
  fields: Record<string, unknown>
  variants: { default: string; labels?: Record<string, string> }
  content: Record<string, Record<string, string>>
  render: (props: unknown) => unknown
}

export interface TemplateRegistryEntry {
  slug: string
  segments: string[]
  meta: { title: string; description?: string; marketingDescription?: string; tags?: string[] }
  width: number
  height: number
  variants: { default: string; labels?: Record<string, string> }
  variantKeys: string[]
  assets: { common: Record<string, string>; variants: Record<string, Record<string, string>> }
  load: () => Promise<{ default: TemplateDefinition }>
}
`)
      await writeFile(path.join(framekitPackage, 'studio.d.ts'), `
import type { TemplateRegistryEntry } from '@mauriciodmo/framekit'

export declare function FrameKitStudio(props: {
  templates: readonly TemplateRegistryEntry[]
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
  }, 30_000)

  it('omits optional metadata and prohibited registry properties', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-summary-contract-'))
    const templateRoot = path.join(root, 'src', 'templates', 'example')

    try {
      await mkdir(templateRoot, { recursive: true })
      await writeFile(path.join(templateRoot, 'template.tsx'), `export default {
  title: 'Forbidden filesystem title',
  revision: 1,
  mode: 'legacy',
  compatibility: 'legacy',
  category: 'social',
  preview: '/preview.png',
  meta: { title: 'Minimal template', revision: 1 },
  width: 100,
  height: 100,
  fields: { privateValue: { kind: 'text', label: 'Private' } },
  content: { moon: { privateValue: 'Secret' } },
  variants: { default: 'moon', mode: 'legacy' },
  render: () => null,
}`)
      await addFrameKitStub(root)

      await writeTemplateModule({ projectRoot: root })

      const generatedSource = await readFile(
        path.join(root, 'src', 'generated', 'framekit', 'templates.ts'),
        'utf8',
      )
      expect(generatedSource).toContain('meta: {"title":"Minimal template"},')
      expect(generatedSource).toContain('variants: {"default":"moon"},')
      expect(generatedSource).not.toContain('\n    title:')

      for (const property of ['description', 'marketingDescription', 'tags', 'revision', 'mode', 'compatibility', 'category', 'preview']) {
        expect(generatedSource).not.toContain(`"${property}"`)
      }
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it.each([
    ['syntax', 'export default {', undefined],
    ['import', `throw new Error('load failed')`, 'load failed'],
    ['validation', `export function validateTemplateDefinition() {
  return { success: false, error: 'definition is invalid' }
}`, 'definition is invalid'],
  ] as const)('reports the source path for %s failures', async (kind, source, message) => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-summary-error-'))
    const templateRoot = path.join(root, 'src', 'templates', 'example')

    try {
      await mkdir(templateRoot, { recursive: true })
      await writeFile(path.join(templateRoot, 'template.tsx'), kind === 'validation' ? validTemplateSource : source)
      await addFrameKitStub(root, kind === 'validation' ? source : undefined)

      await expectErrorWithPortablePath(
        () => writeTemplateModule({ projectRoot: root }),
        message === undefined
          ? path.join(templateRoot, 'template.tsx')
          : `${path.join(templateRoot, 'template.tsx')}: ${message}`,
      )
      await expect(readFile(path.join(root, 'src', 'generated', 'framekit', 'templates.ts'))).rejects.toThrow()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
