import { cp, lstat, mkdir, readdir, rename, rm } from 'node:fs/promises'
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
const legacySkillDirectories = [
  'framekit-project-setup',
  'framekit-studio-usage',
  'framekit-template-creation',
]

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

  await cp(templateDirectory, target, {
    recursive: true,
    filter: (source) => path.basename(source) !== 'node_modules',
  })
  await rename(path.join(target, '_gitignore'), path.join(target, '.gitignore'))

  if (pm === 'npm') {
    const pnpmWorkspace = path.join(target, 'pnpm-workspace.yaml')
    await rm(pnpmWorkspace, { force: true })
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

export async function updateSkills(projectName = '.'): Promise<string> {
  const target = path.resolve(process.cwd(), projectName)
  if (!(await pathExists(target))) throw new Error(`The project directory does not exist: ${target}`)

  const source = path.join(templateDirectory, '.agents', 'skills')
  const destination = path.join(target, '.agents', 'skills')
  await mkdir(destination, { recursive: true })

  const entries = await readdir(source, { withFileTypes: true })
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    await rm(path.join(destination, entry.name), { recursive: true, force: true })
    await cp(path.join(source, entry.name), path.join(destination, entry.name), { recursive: true })
  }

  await Promise.all(
    legacySkillDirectories.map((name) => rm(path.join(destination, name), { recursive: true, force: true })),
  )

  return target
}
