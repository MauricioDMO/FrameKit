// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { describe, expect, it } from 'vitest'

import { validateTemplateDefinition, type TemplateRegistryEntry } from '@mauriciodmo/framekit'
import { writeTemplateModule } from '@mauriciodmo/framekit/dev'
import type { FrameKitStudioBrand } from '@mauriciodmo/framekit/studio'

const GENERATION_TIMEOUT_MS = 30_000

const alphaTemplateSource = `export default {
  meta: {
    title: 'Alpha campaign',
    description: 'A campaign post for social channels.',
    marketingDescription: 'Turn a campaign idea into a clear social post.',
    tags: ['alpha', 'campaign'],
  },
  width: 1200,
  height: 630,
  fields: {
    headline: { kind: 'text', label: 'Headline', defaultValue: 'Launch' },
    logo: { kind: 'image', label: 'Logo', scope: 'common' },
    portrait: { kind: 'image', label: 'Portrait', scope: 'variant' },
    showBadge: { kind: 'boolean', label: 'Show badge', defaultValue: true },
  },
  content: {
    es: { headline: 'Lanza', showBadge: true },
    en: { headline: 'Launch', showBadge: false },
  },
  variants: { default: 'es', labels: { es: 'Spanish', en: 'English' } },
  render: () => null,
}
`

const betaTemplateSource = `export default {
  meta: {
    title: 'Beta story',
    description: 'A vertical story with a focused call to action.',
    marketingDescription: 'Present a seasonal offer in a vertical format.',
    tags: ['beta', 'story'],
  },
  width: 1080,
  height: 1920,
  fields: {
    title: { kind: 'text', label: 'Title', defaultValue: 'Seasonal story' },
    accentColor: { kind: 'color', label: 'Accent color', defaultValue: '#ff6600' },
    cta: {
      kind: 'choice',
      label: 'Call to action',
      options: [
        { value: 'read', label: 'Read' },
        { value: 'shop', label: 'Shop' },
      ],
      defaultValue: 'read',
    },
  },
  content: {
    summer: { title: 'Summer offer', accentColor: '#ff6600', cta: 'shop' },
    winter: { title: 'Winter offer', accentColor: '#3366ff', cta: 'read' },
  },
  variants: { default: 'summer', labels: { summer: 'Summer', winter: 'Winter' } },
  render: () => null,
}
`

type GeneratedModules = {
  templates: TemplateRegistryEntry[]
  brands: FrameKitStudioBrand[]
  brandManifest: Array<Omit<FrameKitStudioBrand, 'load'>>
  brandRegistry: Record<string, FrameKitStudioBrand['load']>
}

function metadataWithoutLoader<T extends { load: unknown }>(entry: T): Omit<T, 'load'> {
  const { load, ...metadata } = entry
  void load
  return metadata
}

async function exposeFrameKitRuntime(projectRoot: string): Promise<void> {
  const packageRoot = path.join(projectRoot, 'node_modules', '@mauriciodmo', 'framekit')
  const runtimeEntry = import.meta.resolve('@mauriciodmo/framekit')

  await mkdir(packageRoot, { recursive: true })
  await writeFile(path.join(packageRoot, 'package.json'), JSON.stringify({
    name: '@mauriciodmo/framekit',
    type: 'module',
    exports: './index.js',
  }))
  await writeFile(path.join(packageRoot, 'index.js'), `export * from ${JSON.stringify(runtimeEntry)}\n`)
}

async function writeTemplateFixture(
  projectRoot: string,
  slug: string,
  source: string,
  assets: Record<string, string> = {},
): Promise<void> {
  const templateRoot = path.join(projectRoot, 'src', 'templates', ...slug.split('/'))
  await mkdir(templateRoot, { recursive: true })
  await writeFile(path.join(templateRoot, 'template.tsx'), source)

  for (const [relativePath, contents] of Object.entries(assets)) {
    const assetPath = path.join(templateRoot, 'assets', ...relativePath.split('/'))
    await mkdir(path.dirname(assetPath), { recursive: true })
    await writeFile(assetPath, contents)
  }
}

async function writeBrandFixture(
  projectRoot: string,
  slug: string,
  description: string,
  marker: string,
): Promise<void> {
  const brandRoot = path.join(projectRoot, 'src', 'brand', ...slug.split('/'))
  await mkdir(brandRoot, { recursive: true })
  await writeFile(path.join(brandRoot, 'component.tsx'), 'export function BrandComponent() { return null }')
  await writeFile(path.join(brandRoot, 'preview.tsx'), `export default ${JSON.stringify({ marker })}`)
  await writeFile(path.join(brandRoot, 'README.md'), `# ${slug}\n\n${description}\n`)
}

async function loadGeneratedModules(projectRoot: string): Promise<GeneratedModules> {
  const generatedRoot = path.join(projectRoot, 'src', 'generated', 'framekit')
  const [templateModule, brandModule] = await Promise.all([
    import(pathToFileURL(path.join(generatedRoot, 'templates.ts')).href),
    import(pathToFileURL(path.join(generatedRoot, 'brands.ts')).href),
  ])

  return {
    templates: templateModule.templates as TemplateRegistryEntry[],
    brands: brandModule.brands as FrameKitStudioBrand[],
    brandManifest: brandModule.brandManifest as Array<Omit<FrameKitStudioBrand, 'load'>>,
    brandRegistry: brandModule.brandRegistry as Record<string, FrameKitStudioBrand['load']>,
  }
}

describe('template generation integration', () => {
  it('generates metadata, loaders, assets, and brands from an isolated project', async () => {
    const projectRoot = await mkdtemp(path.join(os.tmpdir(), 'framekit-studio-'))

    try {
      await writeTemplateFixture(projectRoot, 'alpha/post', alphaTemplateSource, {
        'common/logo.svg': '<svg>common-logo</svg>',
        'es/portrait.png': 'es-portrait',
        'en/portrait.webp': 'en-portrait',
      })
      await writeTemplateFixture(projectRoot, 'beta/story', betaTemplateSource)
      await writeBrandFixture(projectRoot, 'alpha/hero-card', 'Reusable alpha brand block.', 'alpha-preview')
      await writeBrandFixture(projectRoot, 'zeta/quote-card', 'Reusable zeta brand block.', 'zeta-preview')
      await exposeFrameKitRuntime(projectRoot)

      const discovered = await writeTemplateModule({ projectRoot })
      expect(discovered.map(({ slug, segments }) => ({ slug, segments }))).toEqual([
        { slug: 'alpha/post', segments: ['alpha', 'post'] },
        { slug: 'beta/story', segments: ['beta', 'story'] },
      ])

      const generated = await loadGeneratedModules(projectRoot)

      expect(generated.templates.map(metadataWithoutLoader)).toEqual([
        {
          slug: 'alpha/post',
          segments: ['alpha', 'post'],
          meta: {
            title: 'Alpha campaign',
            description: 'A campaign post for social channels.',
            marketingDescription: 'Turn a campaign idea into a clear social post.',
            tags: ['alpha', 'campaign'],
          },
          width: 1200,
          height: 630,
          variants: { default: 'es', labels: { es: 'Spanish', en: 'English' } },
          variantKeys: ['es', 'en'],
          assets: {
            common: { logo: '/__framekit/templates/alpha/post/common/logo.svg' },
            variants: {
              en: { portrait: '/__framekit/templates/alpha/post/en/portrait.webp' },
              es: { portrait: '/__framekit/templates/alpha/post/es/portrait.png' },
            },
          },
        },
        {
          slug: 'beta/story',
          segments: ['beta', 'story'],
          meta: {
            title: 'Beta story',
            description: 'A vertical story with a focused call to action.',
            marketingDescription: 'Present a seasonal offer in a vertical format.',
            tags: ['beta', 'story'],
          },
          width: 1080,
          height: 1920,
          variants: { default: 'summer', labels: { summer: 'Summer', winter: 'Winter' } },
          variantKeys: ['summer', 'winter'],
          assets: { common: {}, variants: {} },
        },
      ])

      for (const entry of generated.templates) {
        const loaded = await entry.load()
        const validation = validateTemplateDefinition(loaded.default)
        expect(validation.success, entry.slug).toBe(true)
        if (!validation.success) continue

        expect({
          meta: validation.definition.meta,
          width: validation.definition.width,
          height: validation.definition.height,
          variants: validation.definition.variants,
          variantKeys: Object.keys(validation.definition.content),
        }).toEqual({
          meta: entry.meta,
          width: entry.width,
          height: entry.height,
          variants: entry.variants,
          variantKeys: entry.variantKeys,
        })
      }

      await expect(readFile(path.join(projectRoot, 'public', '__framekit', 'templates', 'alpha', 'post', 'common', 'logo.svg'), 'utf8')).resolves.toBe('<svg>common-logo</svg>')
      await expect(readFile(path.join(projectRoot, 'public', '__framekit', 'templates', 'alpha', 'post', 'es', 'portrait.png'), 'utf8')).resolves.toBe('es-portrait')
      await expect(readFile(path.join(projectRoot, 'public', '__framekit', 'templates', 'alpha', 'post', 'en', 'portrait.webp'), 'utf8')).resolves.toBe('en-portrait')

      const brandMetadata = generated.brands.map(metadataWithoutLoader)
      expect(brandMetadata).toEqual([
        {
          slug: 'alpha/hero-card',
          title: 'Hero Card',
          segments: ['alpha', 'hero-card'],
          description: 'Reusable alpha brand block.',
        },
        {
          slug: 'zeta/quote-card',
          title: 'Quote Card',
          segments: ['zeta', 'quote-card'],
          description: 'Reusable zeta brand block.',
        },
      ])
      expect(generated.brandManifest).toEqual(brandMetadata)
      expect(Object.keys(generated.brandRegistry)).toEqual(['alpha/hero-card', 'zeta/quote-card'])
      await expect(Promise.all(generated.brands.map(async (brand) => (await brand.load()).default))).resolves.toEqual([
        { marker: 'alpha-preview' },
        { marker: 'zeta-preview' },
      ])
      const registryPreview = await generated.brandRegistry['alpha/hero-card']()
      expect((registryPreview.default as { marker: string }).marker).toBe('alpha-preview')
    } finally {
      await rm(projectRoot, { recursive: true, force: true })
    }
  }, GENERATION_TIMEOUT_MS)
})
