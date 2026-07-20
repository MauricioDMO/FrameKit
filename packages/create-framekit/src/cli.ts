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
import { bold, cyan, dim, green, red } from './terminal.js'

const USAGE = 'Usage: create-framekit [project-directory]'

function devCommand(pm: PackageManager): string {
  return pm === 'npm' ? 'npm run dev' : 'pnpm dev'
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  if (args.length > 1) throw new Error(USAGE)

  console.log()
  console.log(`${bold(cyan('FrameKit'))} ${dim('project creator')}`)
  console.log(dim('Create a new project from the official starter template.'))
  console.log()

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

  console.log()
  console.log(dim('Creating project...'))

  const target = await createProject(projectName, packageManager, {
    installDependencies,
    runApproveBuilds,
    initGit,
  })

  const displayPath = path.isAbsolute(args[0] ?? '')
    ? target
    : path.relative(process.cwd(), target) || '.'

  console.log()
  console.log(`${green('Done!')} ${bold('Your FrameKit project is ready.')}`)
  console.log()
  console.log(dim('Next steps:'))
  console.log(`  ${cyan('$')} cd ${JSON.stringify(displayPath)}`)
  console.log(`  ${cyan('$')} ${devCommand(packageManager)}`)
}

const invokedFile = process.argv[1]
if (invokedFile && import.meta.url === pathToFileURL(invokedFile).href) {
  void main().catch((error: unknown) => {
    console.error(red(error instanceof Error ? error.message : String(error)))
    process.exitCode = 1
  })
}
