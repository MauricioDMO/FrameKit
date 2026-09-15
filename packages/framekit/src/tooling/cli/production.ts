import { createRequire } from 'node:module'
import { access, cp, readFile, readdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { check } from './check'
import { runChild } from './run-child'

const require = createRequire(import.meta.url)

async function exists (filePath: string): Promise<boolean> {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function findStandaloneServer (projectRoot: string): Promise<string> {
  const standaloneRoot = path.join(projectRoot, '.framekit', 'next', 'standalone')

  if (!(await exists(standaloneRoot))) {
    throw new Error('No existe una build de producción. Ejecuta framekit build primero.')
  }

  const candidates: string[] = []

  async function visit (directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name === 'node_modules') continue
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        await visit(entryPath)
      } else if (
        entry.name === 'server.js' &&
        await exists(path.join(directory, '.framekit', 'next', 'BUILD_ID'))
      ) {
        candidates.push(entryPath)
      }
    }
  }

  await visit(standaloneRoot)

  if (candidates.length !== 1) {
    throw new Error(`No se pudo identificar el servidor standalone en: ${standaloneRoot}`)
  }

  return candidates[0]
}

async function copyStandaloneAssets (projectRoot: string): Promise<void> {
  const serverDirectory = path.dirname(await findStandaloneServer(projectRoot))
  const serverPackagePath = path.join(serverDirectory, 'package.json')
  if (await exists(serverPackagePath)) {
    const packageJson = JSON.parse(await readFile(serverPackagePath, 'utf8')) as Record<string, unknown>
    if (packageJson.type === 'module') {
      delete packageJson.type
      await writeFile(serverPackagePath, `${JSON.stringify(packageJson)}\n`, 'utf8')
    }
  }

  const publicDirectory = path.join(projectRoot, 'public')

  if (await exists(publicDirectory)) {
    await cp(publicDirectory, path.join(serverDirectory, 'public'), { recursive: true })
  }

  await cp(
    path.join(projectRoot, '.framekit', 'next', 'static'),
    path.join(serverDirectory, '.framekit', 'next', 'static'),
    { recursive: true }
  )

  const playwrightPackageRoot = path.dirname(require.resolve('playwright-core/package.json'))
  const standaloneRoot = path.join(projectRoot, '.framekit', 'next', 'standalone')
  async function copyPlaywrightRegistry (directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name)
      if (!entry.isDirectory()) continue
      if (entry.name === 'playwright-core') {
        await cp(path.join(playwrightPackageRoot, 'browsers.json'), path.join(entryPath, 'browsers.json'))
        continue
      }
      await copyPlaywrightRegistry(entryPath)
    }
  }

  await copyPlaywrightRegistry(standaloneRoot)
}

export async function build (projectRoot: string): Promise<number> {
  const checkCode = await check(projectRoot)
  if (checkCode !== 0) return checkCode

  const buildCode = await runChild(require.resolve('next/dist/bin/next'), ['build'], projectRoot)
  if (buildCode !== 0) return buildCode

  await copyStandaloneAssets(projectRoot)
  return 0
}

export async function start (projectRoot: string): Promise<number> {
  return runChild(await findStandaloneServer(projectRoot), [], projectRoot)
}
