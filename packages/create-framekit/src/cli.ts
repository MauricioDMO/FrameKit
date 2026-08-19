#!/usr/bin/env node

import { realpathSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
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
import { createProject, updateSkills } from './project.js'
import { assertSupportedNodeRuntime, assertSupportedPackageManager } from './runtime.js'
import { bold, cyan, dim, green, red } from './terminal.js'

const USAGE = 'Usage: create-framekit [project-directory] [-y|-n] | create-framekit update-skills [project-directory]'

type Answer = boolean | undefined

interface ParsedArgs {
  command: 'create' | 'update-skills'
  projectName?: string
  answer: Answer
}

function parseArgs(args: string[]): ParsedArgs {
  if (args[0] === 'update-skills') {
    if (args.length > 2 || args[1]?.startsWith('-')) throw new Error(USAGE)
    return { command: 'update-skills', projectName: args[1], answer: undefined }
  }

  let projectName: string | undefined
  let answer: Answer

  for (const arg of args) {
    if (arg === '-y' || arg === '-n') {
      const nextAnswer = arg === '-y'
      if (answer !== undefined && answer !== nextAnswer) throw new Error(USAGE)
      answer = nextAnswer
      continue
    }

    if (arg.startsWith('-') || projectName !== undefined) throw new Error(USAGE)
    projectName = arg.trim()
  }

  return { command: 'create', projectName, answer }
}

function devCommand(pm: PackageManager): string {
  return pm === 'npm' ? 'npm run dev' : 'pnpm dev'
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  assertSupportedNodeRuntime()
  const parsed = parseArgs(args)

  if (parsed.command === 'update-skills') {
    const target = await updateSkills(parsed.projectName)
    console.log(`${green('Done!')} Updated FrameKit skills in ${target}.`)
    return
  }

  console.log()
  console.log(`${bold(cyan('FrameKit'))} ${dim('project creator')}`)
  console.log(dim('Create a new project from the official starter template.'))
  console.log()

  const projectName =
    parsed.projectName ||
    (parsed.answer === undefined ? await promptProjectName() : 'framekit')

  const detected = detectPackageManager()
  const packageManager: PackageManager =
    detected ??
    (parsed.answer === undefined ? await promptPackageManager() : 'pnpm')

  assertSupportedPackageManager(packageManager)

  const installDependencies =
    parsed.answer ?? (await promptInstallDependencies())

  let runApproveBuilds = false
  if (packageManager === 'pnpm' && installDependencies) {
    runApproveBuilds = parsed.answer ?? (await promptApproveBuilds())
  }

  const initGit = parsed.answer ?? (await promptInitGit())

  console.log()
  console.log(dim('Creating project...'))

  const target = await createProject(projectName, packageManager, {
    installDependencies,
    runApproveBuilds,
    initGit,
  })

  const displayPath = path.isAbsolute(projectName)
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
if (invokedFile && realpathSync(invokedFile) === realpathSync(fileURLToPath(import.meta.url))) {
  void main().catch((error: unknown) => {
    console.error(red(error instanceof Error ? error.message : String(error)))
    process.exitCode = 1
  })
}
