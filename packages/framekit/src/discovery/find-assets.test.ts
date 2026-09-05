// @vitest-environment node

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { findTemplateAssets } from './find-assets'

async function withTempDirectory<T>(prefix: string, callback: (root: string) => Promise<T>): Promise<T> {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix))
  try {
    return await callback(root)
  } finally {
    await rm(root, { recursive: true, force: true })
  }
}

describe('findTemplateAssets', () => {
  it('returns empty assets when the template has no assets', () => withTempDirectory('framekit-assets-', async (root) => {
    await expect(findTemplateAssets(root, 'empty/template')).resolves.toEqual({
      manifest: { common: {}, variants: {} },
      files: [],
    })
  }))

  it('allows distinct keys named after inherited object properties', () => withTempDirectory('framekit-assets-', async (root) => {
    await mkdir(path.join(root, 'assets', 'common'), { recursive: true })
    await writeFile(path.join(root, 'assets', 'common', 'constructor.png'), 'png')
    await writeFile(path.join(root, 'assets', 'common', 'toString.webp'), 'webp')

    await expect(findTemplateAssets(root, 'brand/logo')).resolves.toMatchObject({
      manifest: {
        common: {
          constructor: '/__framekit/templates/brand/logo/common/constructor.png',
          toString: '/__framekit/templates/brand/logo/common/toString.webp',
        },
        variants: {},
      },
    })
  }))

  it('maps common and variant images to stable public URLs', () => withTempDirectory('framekit-assets-', async (root) => {
    await mkdir(path.join(root, 'assets', 'common'), { recursive: true })
    await mkdir(path.join(root, 'assets', 'es'), { recursive: true })
    await writeFile(path.join(root, 'assets', 'common', 'background.svg'), '<svg />')
    await writeFile(path.join(root, 'assets', 'es', 'hero.webp'), 'image')
    await writeFile(path.join(root, 'assets', 'common', '.gitkeep'), '')

    await expect(findTemplateAssets(root, 'social/post')).resolves.toEqual({
      manifest: {
        common: { background: '/__framekit/templates/social/post/common/background.svg' },
        variants: { es: { hero: '/__framekit/templates/social/post/es/hero.webp' } },
      },
      files: [
        {
          sourcePath: path.join(root, 'assets', 'common', 'background.svg'),
          relativePath: path.join('common', 'background.svg'),
          publicPath: '/__framekit/templates/social/post/common/background.svg',
        },
        {
          sourcePath: path.join(root, 'assets', 'es', 'hero.webp'),
          relativePath: path.join('es', 'hero.webp'),
          publicPath: '/__framekit/templates/social/post/es/hero.webp',
        },
      ],
    })
  }))

  it('rejects two extensions for the same asset key', () => withTempDirectory('framekit-assets-', async (root) => {
    await mkdir(path.join(root, 'assets', 'common'), { recursive: true })
    await writeFile(path.join(root, 'assets', 'common', 'logo.png'), 'png')
    await writeFile(path.join(root, 'assets', 'common', 'logo.webp'), 'webp')

    await expect(findTemplateAssets(root, 'brand/logo')).rejects.toThrow("Assets duplicados para 'logo'")
  }))

  it('ignores unsupported extensions and accepts uppercase image extensions', () => withTempDirectory('framekit-assets-', async (root) => {
    await mkdir(path.join(root, 'assets', 'common'), { recursive: true })
    await writeFile(path.join(root, 'assets', 'common', 'notes.txt'), 'text')
    await writeFile(path.join(root, 'assets', 'common', 'hero.PNG'), 'png')

    await expect(findTemplateAssets(root, 'brand/logo')).resolves.toMatchObject({
      manifest: {
        common: { hero: '/__framekit/templates/brand/logo/common/hero.PNG' },
        variants: {},
      },
      files: [{ relativePath: path.join('common', 'hero.PNG') }],
    })
  }))

  it('rejects invalid asset names', () => withTempDirectory('framekit-assets-', async (root) => {
    await mkdir(path.join(root, 'assets', 'common'), { recursive: true })
    await writeFile(path.join(root, 'assets', 'common', 'bad name.png'), 'png')

    await expect(findTemplateAssets(root, 'brand/logo')).rejects.toThrow("Nombre de asset inválido 'bad name.png'")
  }))

  it('rejects invalid variant names', () => withTempDirectory('framekit-assets-', async (root) => {
    await mkdir(path.join(root, 'assets', 'dark.mode'), { recursive: true })

    await expect(findTemplateAssets(root, 'brand/logo')).rejects.toThrow("Nombre de variante inválido 'dark.mode'")
  }))

  it('rejects files directly under the assets directory', () => withTempDirectory('framekit-assets-', async (root) => {
    await mkdir(path.join(root, 'assets'), { recursive: true })
    await writeFile(path.join(root, 'assets', 'logo.png'), 'png')

    await expect(findTemplateAssets(root, 'brand/logo')).rejects.toThrow('Los assets deben estar dentro de common o una variante')
  }))

  it('rejects asset subfolders', () => withTempDirectory('framekit-assets-', async (root) => {
    await mkdir(path.join(root, 'assets', 'common', 'icons'), { recursive: true })

    await expect(findTemplateAssets(root, 'brand/logo')).rejects.toThrow('Los assets no pueden tener subcarpetas')
  }))

  it('returns variants and files in deterministic order', () => withTempDirectory('framekit-assets-', async (root) => {
    await mkdir(path.join(root, 'assets', 'zeta'), { recursive: true })
    await mkdir(path.join(root, 'assets', 'alpha'), { recursive: true })
    await writeFile(path.join(root, 'assets', 'zeta', 'z.png'), 'png')
    await writeFile(path.join(root, 'assets', 'zeta', 'a.png'), 'png')
    await writeFile(path.join(root, 'assets', 'alpha', 'z.png'), 'png')
    await writeFile(path.join(root, 'assets', 'alpha', 'a.png'), 'png')

    const result = await findTemplateAssets(root, 'brand/logo')

    expect(Object.keys(result.manifest.variants)).toEqual(['alpha', 'zeta'])
    expect(Object.keys(result.manifest.variants.alpha)).toEqual(['a', 'z'])
    expect(Object.keys(result.manifest.variants.zeta)).toEqual(['a', 'z'])
    expect(result.files.map((file) => file.relativePath)).toEqual([
      path.join('alpha', 'a.png'),
      path.join('alpha', 'z.png'),
      path.join('zeta', 'a.png'),
      path.join('zeta', 'z.png'),
    ])
  }))
})
