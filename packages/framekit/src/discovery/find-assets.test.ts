// @vitest-environment node

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { describe, expect, it } from 'vitest'

import { findTemplateAssets } from './find-assets'

describe('findTemplateAssets', () => {
  it('maps common and variant images to stable public URLs', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-assets-'))

    try {
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
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })

  it('rejects two extensions for the same asset key', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'framekit-assets-'))

    try {
      await mkdir(path.join(root, 'assets', 'common'), { recursive: true })
      await writeFile(path.join(root, 'assets', 'common', 'logo.png'), 'png')
      await writeFile(path.join(root, 'assets', 'common', 'logo.webp'), 'webp')

      await expect(findTemplateAssets(root, 'brand/logo')).rejects.toThrow("Assets duplicados para 'logo'")
    } finally {
      await rm(root, { recursive: true, force: true })
    }
  })
})
