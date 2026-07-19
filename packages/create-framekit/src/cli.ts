#!/usr/bin/env node

import { pathToFileURL } from 'node:url'
import path from 'node:path'

import {
  promptProjectName,
  promptPackageManager,
  promptInstallDependencies,
  promptApproveBuilds,
  promptInitGit,
  type PackageManager,
} from './prompts.js'
import { detectPackageManager } from './package-manager.js'
import { createProject } from './project.js'

const USAGE = 'Uso: create-framekit [directorio]'

function devCommand(pm: PackageManager): string {
  return pm === 'npm' ? 'npm run dev' : 'pnpm dev'
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  if (args.length > 1) throw new Error(USAGE)

  const projectName =
    args[0]?.trim() || (await promptProjectName())

  const detected = detectPackageManager()
  const packageManager: PackageManager =
    detected ?? (await promptPackageManager())

  const installDependencies = await promptInstallDependencies()

  let runApproveBuilds = false
  if (packageManager === 'pnpm' && installDependencies) {
    runApproveBuilds = await promptApproveBuilds()
  }

  const initGit = await promptInitGit()

  const target = await createProject(projectName, packageManager, {
    installDependencies,
    runApproveBuilds,
    initGit,
  })

  const displayPath = path.isAbsolute(args[0] ?? '')
    ? target
    : path.relative(process.cwd(), target) || '.'

  console.log('\nProyecto FrameKit creado.')
  console.log(`  cd ${JSON.stringify(displayPath)}`)
  console.log(`  ${devCommand(packageManager)}`)
}

const invokedFile = process.argv[1]
if (invokedFile && import.meta.url === pathToFileURL(invokedFile).href) {
  void main().catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
