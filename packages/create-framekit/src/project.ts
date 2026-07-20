import { cp, lstat, rename, rm, writeFile, readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import type { PackageManager } from './prompts.js'
import {
  installDependencies,
  generateCatalog,
  runApproveBuilds,
  runCommand,
} from './package-manager.js'

const templateDirectory = fileURLToPath(new URL('../template/', import.meta.url))

async function pathExists(target: string): Promise<boolean> {
  try {
    await lstat(target)
    return true
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') return false
    throw error
  }
}

export async function createProject(
  projectName: string,
  pm: PackageManager,
  options: {
    installDependencies: boolean
    runApproveBuilds: boolean
    initGit: boolean
  },
): Promise<string> {
  const target = path.resolve(process.cwd(), projectName)

  if (await pathExists(target)) {
    throw new Error(`The directory already exists: ${target}`)
  }

  await cp(templateDirectory, target, { recursive: true })
  await rename(path.join(target, '_gitignore'), path.join(target, '.gitignore'))

  if (pm === 'npm') {
    const pnpmWorkspace = path.join(target, 'pnpm-workspace.yaml')
    await rm(pnpmWorkspace, { force: true })
    const pkgPath = path.join(target, 'package.json')
    const pkg = JSON.parse(await readFile(pkgPath, 'utf8'))
    delete pkg.engines?.pnpm
    if (Object.keys(pkg.engines ?? {}).length === 0) delete pkg.engines
    await writeFile(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }

  if (options.installDependencies) {
    await installDependencies(pm, target)
    if (pm === 'pnpm' && options.runApproveBuilds) {
      await runApproveBuilds(target)
    }
    await generateCatalog(pm, target)
  }

  if (options.initGit) {
    await runCommand('git', ['init'], target)
    await runCommand('git', ['add', '-A'], target)
    await runCommand('git', ['commit', '-m', 'Initial FrameKit project'], target)
  }

  return target
}
