// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

import { findTemplates } from '@/tooling/discovery/find-templates'
import { writeTemplateModule } from '@/tooling/codegen/write-template-module'

const execFileAsync = promisify(execFile)
const tsxCli = fileURLToPath(import.meta.resolve('tsx/cli'))
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
  marker: 'template-loader',
  render: () => null,
}`

const slash = String.fromCharCode(92)
const escapedTemplateTitle = `Title with "quotes" ${slash} path`
const escapedTemplateDescription = `Description with </script> and ${slash} path`
const escapedBrandDescription = `Brand "quotes" ${slash} path and </script>`
const escapedTemplateSource = `export default {
  meta: ${JSON.stringify({
    title: escapedTemplateTitle,
    description: escapedTemplateDescription,
    marketingDescription: 'Marketing "copy"',
    tags: ['generated', 'escaping']
  })},
  width: 320,
  height: 180,
  fields: {},
  content: { only: {} },
  variants: { default: 'only' },
  marker: 'escaped-template-loader',
  render: () => null,
}`

async function addFrameKitStub (root: string, source = `
export function validateTemplateDefinition(definition) {
  return { success: true, definition }
}
`): Promise<void> {
  await writeFile(path.join(root, 'tsconfig.json'), JSON.stringify({
    compilerOptions: { jsx: 'react-jsx' }
  }))

  const framekitPackage = path.join(root, 'node_modules', '@mauriciodmo', 'framekit')
  await mkdir(framekitPackage, { recursive: true })
  await writeFile(path.join(framekitPackage, 'package.json'), JSON.stringify({
    name: '@mauriciodmo/framekit',
    type: 'module',
    exports: {
      '.': './index.js',
      './client': './client.js',
      './studio': './studio.js'
    }
  }))
  await writeFile(path.join(framekitPackage, 'index.js'), source)

  await writeFile(path.join(framekitPackage, 'client.js'), `
export function createRenderClient(templates) {
  return { marker: 'render-client', templates }
}
`)
  await writeFile(path.join(framekitPackage, 'studio.js'), `
export function FrameKitStudio() {}
`)

  const reactPackage = path.join(root, 'node_modules', 'react')
  await mkdir(reactPackage, { recursive: true })
  await writeFile(path.join(reactPackage, 'package.json'), JSON.stringify({
    name: 'react',
    type: 'module',
    exports: { './jsx-runtime': './jsx-runtime.js' }
  }))
  await writeFile(path.join(reactPackage, 'jsx-runtime.js'), `
export function jsx(type, props) {
  return { type: type.name, props }
}

export const jsxs = jsx
`)
}

function normalizePathSeparators (value: string): string {
  return value.replaceAll('\\', '/')
}

async function expectErrorWithPortablePath (
  operation: () => Promise<unknown>,
  expectedMessage: string
): Promise<void> {
  const error = await operation().catch((cause: unknown) => cause)
  expect(error).toBeInstanceOf(Error)
  expect(normalizePathSeparators((error as Error).message)).toContain(
    normalizePathSeparators(expectedMessage)
  )
}

async function writeTemplateFixture (
  root: string,
  slug: string,
  source = validTemplateSource
): Promise<string> {
  const directory = path.join(root, 'src', 'templates', ...slug.split('/'))
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'template.tsx'), source)
  return directory
}

async function writeBrandFixture (
  root: string,
  slug: string,
  options: { description: string; marker: string }
): Promise<string> {
  const directory = path.join(root, 'src', 'brand', ...slug.split('/'))
  await mkdir(directory, { recursive: true })
  await writeFile(path.join(directory, 'component.tsx'), 'export function Component() { return null }')
  await writeFile(path.join(directory, 'preview.tsx'), `export default ${JSON.stringify({ marker: options.marker })}`)
  await writeFile(path.join(directory, 'README.md'), `# ${slug}\n\n${options.description}\n`)
  return directory
}

async function executeGeneratedLoaders (root: string): Promise<{
  templateMetadata: Array<Record<string, unknown>>
  brandMetadata: Array<Record<string, unknown>>
  brandManifest: Array<Record<string, unknown>>
  brandRegistryKeys: string[]
  templateMarkers: string[]
  brandMarkers: string[]
  brandRegistryMarker: string | null
  studioTemplateSlugs: string[]
  studioBrandSlugs: string[]
  studioUser: Record<string, unknown>
  renderTemplateSlugs: string[]
}> {
  const outputDirectory = path.join(root, 'src', 'generated', 'framekit')
  const runner = path.join(root, 'inspect-generated.mts')
  const templatesFile = pathToFileURL(path.join(outputDirectory, 'templates.ts')).href
  const brandsFile = pathToFileURL(path.join(outputDirectory, 'brands.ts')).href
  const studioClientFile = pathToFileURL(path.join(outputDirectory, 'studio-client.tsx')).href
  const renderClientFile = pathToFileURL(path.join(outputDirectory, 'render-client.tsx')).href

  await writeFile(runner, `
const templateModule = await import(${JSON.stringify(templatesFile)})
const brandModule = await import(${JSON.stringify(brandsFile)})
const studioClientModule = await import(${JSON.stringify(studioClientFile)})
const renderClientModule = await import(${JSON.stringify(renderClientFile)})
const templateMarkers = await Promise.all(
  templateModule.templates.map(async (entry) => (await entry.load()).default.marker),
)
const brandMarkers = await Promise.all(
  brandModule.brands.map(async (entry) => (await entry.load()).default.marker),
)
const firstBrand = brandModule.brands[0]
const registryResult = firstBrand
  ? await brandModule.brandRegistry[firstBrand.slug]()
  : null
const studioElement = studioClientModule.StudioClient({ user: { id: 'user-1', username: 'admin', role: 'admin' } })

console.log(JSON.stringify({
  templateMetadata: templateModule.templates.map(({ load: _, ...metadata }) => metadata),
  brandMetadata: brandModule.brands.map(({ load: _, ...metadata }) => metadata),
  brandManifest: brandModule.brandManifest,
  brandRegistryKeys: Object.keys(brandModule.brandRegistry),
  templateMarkers,
  brandMarkers,
  brandRegistryMarker: registryResult?.default.marker ?? null,
  studioTemplateSlugs: studioElement.props.templates.map(({ slug }) => slug),
  studioBrandSlugs: studioElement.props.brands.map(({ slug }) => slug),
  studioUser: studioElement.props.user,
  renderTemplateSlugs: renderClientModule.RenderClient.templates.map(({ slug }) => slug),
}))
`, 'utf8')

  const { stdout } = await execFileAsync(process.execPath, [tsxCli, runner], { cwd: root })
  return JSON.parse(stdout.trim()) as Awaited<ReturnType<typeof executeGeneratedLoaders>>
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
          absolutePath: templateRoot
        }
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

  it.each(['Uppercase', 'with_underscore', 'with space', 'conácento'])('rejects invalid segment %j', async (segment) => {
    const templatesRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-templates-'))

    try {
      const templateRoot = path.join(templatesRoot, segment)
      await mkdir(templateRoot, { recursive: true })
      await writeFile(path.join(templateRoot, 'template.tsx'), '')

      await expectErrorWithPortablePath(
        () => findTemplates(templatesRoot),
          `Segmento inválido '${segment}' en ruta física: ${templateRoot}`
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
        `No se encontraron plantillas en: ${templatesRoot}`
      )
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('generates brands, preserves escaped metadata, and executes every loader', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-registry-'))

    try {
      const zetaTemplate = await writeTemplateFixture(root, 'zeta/launch', escapedTemplateSource)
      const alphaTemplate = await writeTemplateFixture(root, 'alpha/post')
      await writeBrandFixture(root, 'zulu-brand', {
        description: escapedBrandDescription,
        marker: 'zulu-preview'
      })
      await writeBrandFixture(root, 'alpha-brand', {
        description: 'Alpha brand block.',
        marker: 'alpha-preview'
      })
      await addFrameKitStub(root)

      await expect(writeTemplateModule({ projectRoot: root })).resolves.toEqual([
        { slug: 'alpha/post', segments: ['alpha', 'post'], absolutePath: alphaTemplate },
        { slug: 'zeta/launch', segments: ['zeta', 'launch'], absolutePath: zetaTemplate }
      ])

      const generatedDirectory = path.join(root, 'src', 'generated', 'framekit')
      const generatedTemplates = await readFile(path.join(generatedDirectory, 'templates.ts'), 'utf8')
      const generatedBrands = await readFile(path.join(generatedDirectory, 'brands.ts'), 'utf8')
      const generatedStudioClient = await readFile(path.join(generatedDirectory, 'studio-client.tsx'), 'utf8')
      const generatedRenderClient = await readFile(path.join(generatedDirectory, 'render-client.tsx'), 'utf8')

      expect(generatedTemplates).toContain('/* Archivo generado automáticamente. No modificar. */')
      expect(generatedBrands).toContain('/* Archivo generado automáticamente. No modificar. */')
      expect(generatedStudioClient).toContain("'use client'")
      expect(generatedStudioClient).toContain("import { FrameKitStudio } from '@mauriciodmo/framekit/studio'")
      expect(generatedStudioClient).toContain("import type { StudioUser } from '@mauriciodmo/framekit/studio'")
      expect(generatedStudioClient).toContain('user: StudioUser')
      expect(generatedStudioClient).toContain("import { templates } from './templates'")
      expect(generatedStudioClient).toContain("import { brands } from './brands'")
      expect(generatedStudioClient).not.toContain('@mauriciodmo/framekit/server')
      expect(generatedRenderClient).toContain("'use client'")
      expect(generatedRenderClient).toContain("import { createRenderClient } from '@mauriciodmo/framekit/client'")
      expect(generatedRenderClient).toContain("import { templates } from './templates'")
      expect(generatedRenderClient).not.toContain('./brands')
      expect(generatedRenderClient).not.toContain('@mauriciodmo/framekit/studio')
      expect(generatedStudioClient).not.toContain('@mauriciodmo/framekit/client')
      expect(generatedTemplates).not.toContain("'use client'")
      expect(generatedBrands).not.toContain("'use client'")

      const generated = await executeGeneratedLoaders(root)
      expect(generated.templateMetadata.map((entry) => entry.slug)).toEqual(['alpha/post', 'zeta/launch'])
      expect(generated.templateMarkers).toEqual(['template-loader', 'escaped-template-loader'])
      expect(generated.studioTemplateSlugs).toEqual(['alpha/post', 'zeta/launch'])
      expect(generated.studioBrandSlugs).toEqual(['alpha-brand', 'zulu-brand'])
      expect(generated.studioUser).toEqual({ id: 'user-1', username: 'admin', role: 'admin' })
      expect(generated.renderTemplateSlugs).toEqual(['alpha/post', 'zeta/launch'])

      expect(generated.templateMetadata.find((entry) => entry.slug === 'zeta/launch')).toMatchObject({
        slug: 'zeta/launch',
        segments: ['zeta', 'launch'],
        meta: {
          title: escapedTemplateTitle,
          description: escapedTemplateDescription,
          marketingDescription: 'Marketing "copy"',
          tags: ['generated', 'escaping']
        },
        width: 320,
        height: 180,
        variants: { default: 'only' },
        variantKeys: ['only'],
        assets: { common: {}, variants: {} }
      })

      expect(generated.brandMetadata).toEqual([
        {
          slug: 'alpha-brand',
          title: 'Alpha Brand',
          segments: ['alpha-brand'],
          description: 'Alpha brand block.'
        },
        {
          slug: 'zulu-brand',
          title: 'Zulu Brand',
          segments: ['zulu-brand'],
          description: escapedBrandDescription
        }
      ])
      expect(generated.brandManifest).toEqual(generated.brandMetadata)
      expect(generated.brandRegistryKeys).toEqual(['alpha-brand', 'zulu-brand'])
      expect(generated.brandMarkers).toEqual(['alpha-preview', 'zulu-preview'])
      expect(generated.brandRegistryMarker).toBe('alpha-preview')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  }, 30_000)

  it('keeps generated modules deterministic across repeated generation', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-deterministic-'))

    try {
      const zetaTemplate = await writeTemplateFixture(root, 'zeta')
      await writeTemplateFixture(root, 'alpha')
      const commonAssets = path.join(zetaTemplate, 'assets', 'common')
      await mkdir(commonAssets, { recursive: true })
      await writeFile(path.join(commonAssets, 'z.png'), 'z')
      await writeFile(path.join(commonAssets, 'a.png'), 'a')
      await writeBrandFixture(root, 'zulu', { description: 'Zulu brand.', marker: 'zulu-preview' })
      await writeBrandFixture(root, 'alpha', { description: 'Alpha brand.', marker: 'alpha-preview' })
      await addFrameKitStub(root)

      await writeTemplateModule({ projectRoot: root })
      const firstTemplates = await readFile(path.join(root, 'src', 'generated', 'framekit', 'templates.ts'), 'utf8')
      const firstBrands = await readFile(path.join(root, 'src', 'generated', 'framekit', 'brands.ts'), 'utf8')
      const firstStudioClient = await readFile(path.join(root, 'src', 'generated', 'framekit', 'studio-client.tsx'), 'utf8')
      const firstRenderClient = await readFile(path.join(root, 'src', 'generated', 'framekit', 'render-client.tsx'), 'utf8')

      await writeTemplateModule({ projectRoot: root })

      await expect(readFile(path.join(root, 'src', 'generated', 'framekit', 'templates.ts'), 'utf8')).resolves.toBe(firstTemplates)
      await expect(readFile(path.join(root, 'src', 'generated', 'framekit', 'brands.ts'), 'utf8')).resolves.toBe(firstBrands)
      await expect(readFile(path.join(root, 'src', 'generated', 'framekit', 'studio-client.tsx'), 'utf8')).resolves.toBe(firstStudioClient)
      await expect(readFile(path.join(root, 'src', 'generated', 'framekit', 'render-client.tsx'), 'utf8')).resolves.toBe(firstRenderClient)
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('recreates missing bindings without changing consumer-owned files', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-bindings-'))
    const templateRoot = await writeTemplateFixture(root, 'example')
    const routeFile = path.join(root, 'src', 'app', 'editor', '[[...slug]]', 'page.tsx')
    const configFile = path.join(root, 'next.config.ts')
    const sourceAsset = path.join(templateRoot, 'assets', 'common', 'logo.svg')
    const publicFile = path.join(root, 'public', 'keep.svg')
    const userGeneratedFile = path.join(root, 'src', 'generated', 'framekit', 'custom.ts')

    try {
      await mkdir(path.dirname(routeFile), { recursive: true })
      await mkdir(path.dirname(sourceAsset), { recursive: true })
      await mkdir(path.dirname(publicFile), { recursive: true })
      await mkdir(path.dirname(userGeneratedFile), { recursive: true })
      await writeFile(routeFile, 'export default function Page() { return null }')
      await writeFile(configFile, 'export default { distDir: \'custom\' }')
      await writeFile(sourceAsset, 'source asset')
      await writeFile(publicFile, 'public file')
      await writeFile(userGeneratedFile, 'export const custom = true')
      await addFrameKitStub(root)

      await writeTemplateModule({ projectRoot: root })

      const generatedDirectory = path.join(root, 'src', 'generated', 'framekit')
      const studioClient = path.join(generatedDirectory, 'studio-client.tsx')
      const renderClient = path.join(generatedDirectory, 'render-client.tsx')
      await rm(studioClient)
      await rm(renderClient)

      await writeTemplateModule({ projectRoot: root })

      await expect(readFile(studioClient, 'utf8')).resolves.toContain("'use client'")
      await expect(readFile(renderClient, 'utf8')).resolves.toContain("'use client'")
      await expect(readFile(routeFile, 'utf8')).resolves.toBe('export default function Page() { return null }')
      await expect(readFile(configFile, 'utf8')).resolves.toBe('export default { distDir: \'custom\' }')
      await expect(readFile(sourceAsset, 'utf8')).resolves.toBe('source asset')
      await expect(readFile(publicFile, 'utf8')).resolves.toBe('public file')
      await expect(readFile(userGeneratedFile, 'utf8')).resolves.toBe('export const custom = true')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('generates empty brand bindings while keeping client graphs separate', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-empty-brands-'))

    try {
      await writeTemplateFixture(root, 'example')
      await addFrameKitStub(root)

      await writeTemplateModule({ projectRoot: root })

      const generatedDirectory = path.join(root, 'src', 'generated', 'framekit')
      const templatesSource = await readFile(path.join(generatedDirectory, 'templates.ts'), 'utf8')
      const brandsSource = await readFile(path.join(generatedDirectory, 'brands.ts'), 'utf8')
      const studioSource = await readFile(path.join(generatedDirectory, 'studio-client.tsx'), 'utf8')
      const renderSource = await readFile(path.join(generatedDirectory, 'render-client.tsx'), 'utf8')
      const generated = await executeGeneratedLoaders(root)

      expect(generated.brandMetadata).toEqual([])
      expect(generated.brandManifest).toEqual([])
      expect(generated.brandRegistryKeys).toEqual([])
      expect(generated.brandMarkers).toEqual([])
      expect(generated.studioBrandSlugs).toEqual([])
      expect(generated.studioTemplateSlugs).toEqual(['example'])
      expect(generated.renderTemplateSlugs).toEqual(['example'])
      expect(brandsSource).toContain('export const brands')
      expect(brandsSource).toMatch(/= \[\s*\]/)
      expect(studioSource).toContain("import { brands } from './brands'")
      expect(studioSource).not.toContain('@mauriciodmo/framekit/client')
      expect(renderSource).not.toContain('./brands')
      expect(renderSource).not.toContain('@mauriciodmo/framekit/studio')
      expect(templatesSource).not.toContain("'use client'")
      expect(brandsSource).not.toContain("'use client'")
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('overwrites generated modules when template and brand metadata change', { timeout: 15_000 }, async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-overwrite-'))

    try {
      const templateRoot = await writeTemplateFixture(root, 'example')
      const brandRoot = await writeBrandFixture(root, 'example', {
        description: 'Before brand description.',
        marker: 'example-preview'
      })
      await addFrameKitStub(root)
      await writeTemplateModule({ projectRoot: root })

      const generatedTemplatesPath = path.join(root, 'src', 'generated', 'framekit', 'templates.ts')
      const generatedBrandsPath = path.join(root, 'src', 'generated', 'framekit', 'brands.ts')
      const firstTemplates = await readFile(generatedTemplatesPath, 'utf8')
      const firstBrands = await readFile(generatedBrandsPath, 'utf8')

      await writeFile(
        path.join(templateRoot, 'template.tsx'),
        validTemplateSource.replace('Generated template', 'Updated template')
      )
      await writeFile(path.join(brandRoot, 'README.md'), '# example\n\nAfter brand description.\n')
      await writeTemplateModule({ projectRoot: root })

      const updatedTemplates = await readFile(generatedTemplatesPath, 'utf8')
      const updatedBrands = await readFile(generatedBrandsPath, 'utf8')
      expect(updatedTemplates).not.toBe(firstTemplates)
      expect(updatedBrands).not.toBe(firstBrands)
      expect(updatedTemplates).toContain('Updated template')
      expect(updatedTemplates).not.toContain('Generated template')
      expect(updatedBrands).toContain('After brand description.')
      expect(updatedBrands).not.toContain('Before brand description.')

      const generated = await executeGeneratedLoaders(root)
      expect(generated.templateMetadata[0]?.meta).toMatchObject({ title: 'Updated template' })
      expect(generated.brandMetadata[0]?.description).toBe('After brand description.')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('removes obsolete assets and stale output without touching other public files', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-assets-sync-'))

    try {
      const templateRoot = await writeTemplateFixture(root, 'example')
      const commonAssets = path.join(templateRoot, 'assets', 'common')
      const variantAssets = path.join(templateRoot, 'assets', 'variant')
      await mkdir(commonAssets, { recursive: true })
      await mkdir(variantAssets, { recursive: true })
      await writeFile(path.join(commonAssets, 'old.svg'), 'old common')
      await writeFile(path.join(variantAssets, 'card.png'), 'old variant')

      const publicKeep = path.join(root, 'public', 'keep.txt')
      const staleOutput = path.join(root, 'public', 'framekit', 'templates', 'stale', 'old.png')
      await mkdir(path.dirname(publicKeep), { recursive: true })
      await mkdir(path.dirname(staleOutput), { recursive: true })
      await writeFile(publicKeep, 'keep')
      await writeFile(staleOutput, 'stale')
      await addFrameKitStub(root)

      await writeTemplateModule({ projectRoot: root })

      const outputRoot = path.join(root, 'public', 'framekit', 'templates', 'example')
      await expect(readFile(path.join(outputRoot, 'common', 'old.svg'), 'utf8')).resolves.toBe('old common')
      await expect(readFile(path.join(outputRoot, 'variant', 'card.png'), 'utf8')).resolves.toBe('old variant')
      await expect(readFile(staleOutput, 'utf8')).rejects.toThrow()

      await rm(path.join(commonAssets, 'old.svg'))
      await rm(variantAssets, { recursive: true, force: true })
      await writeFile(path.join(commonAssets, 'new.webp'), 'new')
      await writeTemplateModule({ projectRoot: root })

      await expect(readFile(path.join(outputRoot, 'common', 'old.svg'), 'utf8')).rejects.toThrow()
      await expect(readFile(path.join(outputRoot, 'variant', 'card.png'), 'utf8')).rejects.toThrow()
      await expect(stat(path.join(outputRoot, 'variant'))).rejects.toThrow()
      await expect(readFile(path.join(outputRoot, 'common', 'new.webp'), 'utf8')).resolves.toBe('new')
      await expect(readFile(publicKeep, 'utf8')).resolves.toBe('keep')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('omits optional metadata and prohibited registry properties', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-summary-contract-'))

    try {
      await writeTemplateFixture(root, 'example', `export default {
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

      const generated = await executeGeneratedLoaders(root)
      expect(generated.templateMetadata).toEqual([{
        slug: 'example',
        segments: ['example'],
        meta: { title: 'Minimal template' },
        width: 100,
        height: 100,
        variants: { default: 'moon' },
        variantKeys: ['moon'],
        assets: { common: {}, variants: {} }
      }])
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it.each([
    ['syntax', 'export default {', undefined],
    ['import', 'throw new Error(\'load failed\')', 'load failed'],
    ['validation', `export function validateTemplateDefinition() {
  return { success: false, error: 'definition is invalid' }
}`, 'definition is invalid']
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
          : `${path.join(templateRoot, 'template.tsx')}: ${message}`
      )
      await expect(readFile(path.join(root, 'src', 'generated', 'framekit', 'templates.ts'))).rejects.toThrow()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('reports invalid asset layouts before writing generated modules', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-asset-error-'))
    const templateRoot = await writeTemplateFixture(root, 'example')
    const invalidDirectory = path.join(templateRoot, 'assets', 'common', 'nested')

    try {
      await mkdir(invalidDirectory, { recursive: true })
      await addFrameKitStub(root)

      await expectErrorWithPortablePath(
        () => writeTemplateModule({ projectRoot: root }),
        `Los assets no pueden tener subcarpetas: ${invalidDirectory}`
      )
      await expect(
        readFile(path.join(root, 'src', 'generated', 'framekit', 'templates.ts'))
      ).rejects.toThrow()
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('preserves existing output assets when brand discovery fails', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-brand-error-'))
    const brandRoot = path.join(root, 'src', 'brand', 'broken')
    const existingAsset = path.join(root, 'public', 'framekit', 'templates', 'previous', 'common', 'logo.svg')

    try {
      await writeTemplateFixture(root, 'example')
      await mkdir(brandRoot, { recursive: true })
      await writeFile(path.join(brandRoot, 'component.tsx'), 'export function Component() { return null }')
      await mkdir(path.dirname(existingAsset), { recursive: true })
      await writeFile(existingAsset, 'previous asset')
      await addFrameKitStub(root)

      await expectErrorWithPortablePath(
        () => writeTemplateModule({ projectRoot: root }),
        `Falta preview.tsx en: ${brandRoot}`
      )
      await expect(readFile(existingAsset, 'utf8')).resolves.toBe('previous asset')
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
